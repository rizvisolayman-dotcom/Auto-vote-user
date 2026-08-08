const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const { computeCheck } = require('telegram/Password');
const fs = require('fs');
const path = require('path');
const https = require('https');

const { API_ID, API_HASH } = require('./load-config.js');
const CONFIG = path.join(__dirname, 'config.js');

const pending = {};

function cleanPhone(p) { return (p || '').replace(/[^0-9+]/g, ''); }

function nextNumber(accounts) {
  const nums = accounts.map(a => parseInt((a.n || '').match(/#(\d+)/)?.[1] || 0, 10));
  return Math.max(2, ...nums) + 1;
}

function renderApi(method, path, body) {
  return new Promise((resolve, reject) => {
    const u = new URL('https://api.render.com/v1' + path);
    const opts = {
      hostname: u.hostname, port: 443, path: u.pathname + u.search,
      method,
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.RENDER_API_KEY },
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, raw: d }); } });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function cancelPendingDeploys(sid) {
  const r = await renderApi('GET', '/services/' + sid + '/deploys');
  if (!r.data || !Array.isArray(r.data)) return;
  for (const d of r.data) {
    const s = d.deploy && d.deploy.status;
    if (s === 'queued' || s === 'created' || s === 'build_in_progress' || s === 'deploy_in_progress' || s === 'update_in_progress') {
      await renderApi('POST', '/services/' + sid + '/deploys/' + d.deploy.id + '/cancel', {});
    }
  }
}

async function updateRenderConfig(accounts) {
  const cfg = {
    accounts,
    API_ID,
    API_HASH,
    CHAT_ID: process.env.CHAT_ID || require('./load-config.js').CHAT_ID,
  };
  const r = await renderApi('PUT', '/services/' + process.env.RENDER_SERVICE_ID + '/env-vars/VOTE_CONFIG', { value: JSON.stringify(cfg) });
  if (r.status !== 200) throw new Error('Render config update failed: ' + JSON.stringify(r.data || r.raw).substring(0, 120));
  await cancelPendingDeploys(process.env.RENDER_SERVICE_ID);
  await renderApi('POST', '/services/' + process.env.RENDER_SERVICE_ID + '/deploys', {});
  return true;
}

function normTokens(name) {
  return (name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z0-9]+/g) || [];
}

function findMatchByName(accounts, name) {
  const tokens = normTokens(name);
  if (!tokens.length) return null;
  return accounts.find(a => {
    const at = normTokens(a.n);
    return tokens.every(t => at.includes(t));
  }) || null;
}

async function appendAccount(name, session) {
  let accounts;
  if (fs.existsSync(CONFIG)) {
    accounts = require('./load-config.js').accounts;
  } else {
    accounts = JSON.parse(process.env.VOTE_CONFIG).accounts;
  }
  const existing = findMatchByName(accounts, name);
  if (existing) {
    existing.s = session;
    if (fs.existsSync(CONFIG)) {
      let cfg = fs.readFileSync(CONFIG, 'utf8');
      cfg = cfg.replace(new RegExp("(\\{n:'[^']*" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "[^']*'\\s*,\\s*s:')([^']*)('\\})"), '$1' + session + '$3');
      fs.writeFileSync(CONFIG, cfg);
    }
    if (process.env.RENDER_SERVICE_ID) {
      await updateRenderConfig(accounts);
    }
    return { number: existing.n.split(' ')[0].replace('#', ''), name: existing.n, message: 'Session updated for ' + existing.n };
  }
  const num = nextNumber(accounts);
  const newAcc = { n: '#' + num + ' ' + name, s: session };
  accounts = accounts.concat([newAcc]);

  if (fs.existsSync(CONFIG)) {
    const line = `  {n:'#${num} ${name}', s:'${session}'},\n`;
    let cfg = fs.readFileSync(CONFIG, 'utf8');
    cfg = cfg.replace(/\n\];\n\nconst API_ID/, '\n' + line + '];\n\nconst API_ID');
    fs.writeFileSync(CONFIG, cfg);
  }

  if (process.env.RENDER_SERVICE_ID) {
    await updateRenderConfig(accounts);
  }
  return { number: num, name };
}

async function startLogin(phone) {
  phone = cleanPhone(phone);
  if (!phone) throw new Error('phone required');
  const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, { connectionRetries: 5 });
  await client.connect();
  const res = await client.invoke(new Api.auth.SendCode({
    phoneNumber: phone,
    apiId: API_ID,
    apiHash: API_HASH,
    settings: new Api.CodeSettings({ allowFlashcall: false, currentNumber: false }),
  }));
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  pending[id] = { client, phone, phoneCodeHash: res.phoneCodeHash, step: 'code' };
  return { add_id: id, message: 'Code sent to ' + phone };
}

async function submitCode(addId, code) {
  const p = pending[addId];
  if (!p) throw new Error('Session expired, start again');
  if (p.step === 'password') throw new Error('2FA password required');
  try {
    const r = await p.client.invoke(new Api.auth.SignIn({
      phoneNumber: p.phone, phoneCodeHash: p.phoneCodeHash, phoneCode: String(code).trim(),
    }));
    return finalize(p, addId, r);
  } catch (e) {
    const em = e?.errorMessage || e?.message || '';
    if (em.includes('SESSION_PASSWORD_NEEDED')) {
      p.step = 'password';
      return { add_id: addId, needs_password: true, message: '2FA password required' };
    }
    if (em.includes('PHONE_CODE_INVALID') || em.includes('PHONE_CODE_EXPIRED')) {
      throw new Error('Invalid or expired code');
    }
    if (em.includes('AUTH_KEY_UNREGISTERED') || em.includes('USER_DEACTIVATED')) {
      throw new Error('Account not registered on Telegram');
    }
    throw new Error(em || 'Login failed');
  }
}

async function submitPassword(addId, password) {
  const p = pending[addId];
  if (!p) throw new Error('Session expired, start again');
  if (p.step !== 'password') throw new Error('No password needed');
  const srp = await p.client.invoke(new Api.account.GetPassword());
  const check = await computeCheck(srp, password);
  const r = await p.client.invoke(new Api.auth.CheckPassword({ password: check }));
  return finalize(p, addId, r);
}

async function finalize(p, addId, authResult) {
  const user = authResult?.user;
  if (!user) throw new Error('Login incomplete');
  const session = p.client.session.save();
  const name = (user.firstName || '') + (user.lastName ? ' ' + user.lastName : '');
  try { await p.client.disconnect(); } catch {}
  delete pending[addId];
  const added = appendAccount(name.trim() || 'Account', session);
  return { number: added.number, name: added.name, message: 'Added #' + added.number + ' ' + added.name };
}

module.exports = { startLogin, submitCode, submitPassword };
