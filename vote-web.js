const http = require('http');
const fs = require('fs');
const path = require('path');
const { voteAll, voteEach } = require('./userbot.js');
const { accounts } = require('./load-config.js');
const { startLogin, submitCode, submitPassword } = require('./add-api.js');
const { listGroups, changeChatId } = require('./chat-api.js');
const scheduler = require('./scheduler.js');

const PORT = process.env.PORT || 8080;
let voting = false;
let lastResult = null;

function getAccounts() {
  try {
    delete require.cache[require.resolve('./config.js')];
    return require('./config.js').accounts.map(a => a.n);
  } catch {
    try {
      const fresh = require('./load-config.js');
      accounts = fresh.accounts;
      return fresh.accounts.map(a => a.n);
    } catch { return accounts.map(a => a.n); }
  }
}

function loadHtml() {
  return fs.readFileSync(path.join(__dirname, 'panel.html'), 'utf8');
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = '';
    req.on('data', c => b += c);
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch { resolve({}); } });
  });
}

function renderOwnResults(log) {
  const results = [];
  const lines = (log || '').split('|').map(s => s.trim());
  getAccounts().forEach((name, i) => {
    const line = lines.find(l => l.startsWith(name)) || name + ' no result';
    results.push(line);
  });
  return results;
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(loadHtml());
    return;
  }

  if (req.method === 'GET' && url === '/schedule') {
    json(res, 200, scheduler.getStatus());
    return;
  }

  if (req.method === 'POST' && url === '/schedule') {
    try {
      const b = await readBody(req);
      const r = scheduler.setSchedule(b.start, b.end, b.options, b.defaultOption, b.tzOffset);
      json(res, 200, r);
    } catch (e) { json(res, 500, { error: e.message }); }
    return;
  }

  if (req.method === 'POST' && url === '/schedule-stop') {
    json(res, 200, scheduler.stopSchedule());
    return;
  }

  if (req.method === 'POST' && url === '/schedule-check') {
    const r = await scheduler.checkOnce();
    json(res, 200, r || { ok: true });
    return;
  }

  if (req.method === 'GET' && url === '/accounts') {
    json(res, 200, { accounts: getAccounts() });
    return;
  }

  if (req.method === 'GET' && url === '/groups') {
    try {
      const cfg = require('./load-config.js');
      const groups = await listGroups();
      json(res, 200, { groups, current: String(cfg.CHAT_ID) });
    } catch (e) { json(res, 500, { error: e.message }); }
    return;
  }

  if (req.method === 'POST' && url === '/chat') {
    try {
      const { chatId } = await readBody(req);
      if (!chatId) { json(res, 400, { error: 'chatId required' }); return; }
      const r = await changeChatId(chatId);
      json(res, 200, r);
    } catch (e) { json(res, 500, { error: e.message }); }
    return;
  }

  if (req.method === 'POST' && url === '/vote') {
    if (voting) { json(res, 409, { error: 'already voting' }); return; }
    voting = true;
    try {
      const { option, options } = await readBody(req);
      let result;
      if (options && Array.isArray(options)) {
        result = await voteEach(options.join(' '));
      } else {
        result = await voteAll(String(option));
      }
      lastResult = { option, options, result };
      json(res, 200, { result });
    } catch (e) {
      json(res, 500, { error: e.message });
    } finally { voting = false; }
    return;
  }

  if (req.method === 'POST' && url === '/vote-own') {
    if (voting) { json(res, 409, { error: 'already voting' }); return; }
    voting = true;
    try {
      const { execFile } = require('child_process');
      const out = await new Promise((resolve, reject) => {
        execFile('node', [path.join(__dirname, 'vote-own.js')], { timeout: 180000 }, (err, stdout, stderr) => {
          if (err && !stdout) return reject(err);
          resolve(stdout + stderr);
        });
      });
      const results = renderOwnResults(out);
      lastResult = { type: 'own', results };
      json(res, 200, { results });
    } catch (e) {
      json(res, 500, { error: e.message });
    } finally { voting = false; }
    return;
  }

  if (req.method === 'POST' && url === '/add-account') {
    try {
      const { phone } = await readBody(req);
      const r = await startLogin(phone);
      json(res, 200, r);
    } catch (e) {
      json(res, 500, { error: e.message });
    }
    return;
  }

  if (req.method === 'POST' && url === '/add-code') {
    try {
      const { add_id, code } = await readBody(req);
      const r = await submitCode(add_id, code);
      json(res, 200, r);
    } catch (e) {
      json(res, 500, { error: e.message });
    }
    return;
  }

  if (req.method === 'POST' && url === '/add-password') {
    try {
      const { add_id, password } = await readBody(req);
      const r = await submitPassword(add_id, password);
      json(res, 200, r);
    } catch (e) {
      json(res, 500, { error: e.message });
    }
    return;
  }

  json(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log('Vote panel running on http://localhost:' + PORT);
  scheduler.start();
});
