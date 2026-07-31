const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG = path.join(__dirname, 'config.js');

function getAccount() {
  try {
    delete require.cache[require.resolve('./load-config.js')];
    return require('./load-config.js').accounts[0];
  } catch { return null; }
}

function renderApi(method, p, body) {
  return new Promise((resolve, reject) => {
    const u = new URL('https://api.render.com/v1' + p);
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

async function listGroups() {
  const cfg = require('./load-config.js');
  const acc = cfg.accounts[0];
  if (!acc) throw new Error('No account');
  const client = new TelegramClient(new StringSession(acc.s), cfg.API_ID, cfg.API_HASH, { connectionRetries: 3 });
  await client.connect();
  try {
    const dialogs = await client.getDialogs({ limit: 200 });
    const groups = dialogs
      .filter(d => d.isGroup || d.isChannel)
      .map(d => ({ id: d.id, name: d.title || d.name || 'unnamed' }));
    return groups;
  } finally {
    await client.disconnect();
  }
}

async function changeChatId(newId) {
  const cfg = require('./load-config.js');
  const accs = cfg.accounts;
  if (fs.existsSync(CONFIG)) {
    let c = fs.readFileSync(CONFIG, 'utf8');
    c = c.replace(/const CHAT_ID = '[^']*';/, `const CHAT_ID = '${newId}';`);
    fs.writeFileSync(CONFIG, c);
  }
  if (process.env.RENDER_SERVICE_ID) {
    const payload = {
      accounts: accs,
      API_ID: cfg.API_ID,
      API_HASH: cfg.API_HASH,
      CHAT_ID: String(newId),
    };
    const r = await renderApi('PUT', '/services/' + process.env.RENDER_SERVICE_ID + '/env-vars/VOTE_CONFIG', { value: JSON.stringify(payload) });
    if (r.status !== 200) throw new Error('Render update failed: ' + JSON.stringify(r.data || r.raw).substring(0, 100));
  }
  return { ok: true, chatId: String(newId) };
}

module.exports = { listGroups, changeChatId };
