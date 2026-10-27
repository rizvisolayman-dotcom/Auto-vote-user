const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const { computeCheck } = require('telegram/Password');
const fs = require('fs');
const path = require('path');
const https = require('https');

const { API_ID, API_HASH } = require('./load-config.js');
const { persistConfig } = require('./persist.js');
const CONFIG = path.join(__dirname, 'config.js');

const pending = {};

function cleanPhone(p) { return (p || '').replace(/[^0-9+]/g, ''); }

function nextNumber(accounts) {
  const nums = accounts.map(a => parseInt((a.n || '').match(/#(\d+)/)?.[1] || 0, 10));
  return Math.max(2, ...nums) + 1;
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
    const saved = await persistConfig({
      accounts,
      API_ID,
      API_HASH,
      CHAT_ID: require('./load-config.js').CHAT_ID,
    });
    return { number: existing.n.split(' ')[0].replace('#', ''), name: existing.n, saved, message: 'Session updated for ' + existing.n };
  }
  const num = nextNumber(accounts);
  const newAcc = { n: '#' + num + ' ' + name, s: session };
  accounts = accounts.concat([newAcc]);

  await persistConfig({
    accounts,
    API_ID,
    API_HASH,
    CHAT_ID: require('./load-config.js').CHAT_ID,
  });
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
