const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { persistConfig } = require('./persist.js');
const { API_ID, API_HASH, CHAT_ID } = require('./load-config.js');

const cfg = JSON.parse(process.env.VOTE_CONFIG);
const accounts = cfg.accounts;

async function checkSession(acc) {
  try {
    const client = new TelegramClient(new StringSession(acc.s), API_ID, API_HASH, { connectionRetries: 1, timeout: 20 });
    await client.connect();
    const me = await client.getMe();
    await client.disconnect();
    return { name: acc.n, ok: true, username: me.username || me.firstName || 'ok' };
  } catch (e) {
    return { name: acc.n, ok: false, error: (e.message || '').substring(0, 100) };
  }
}

(async () => {
  console.log('Checking ' + accounts.length + ' sessions from VOTE_CONFIG...');
  const results = [];
  for (let i = 0; i < accounts.length; i += 5) {
    const batch = accounts.slice(i, i + 5);
    const r = await Promise.all(batch.map(checkSession));
    results.push(...r);
    process.stdout.write('  ' + results.length + '/' + accounts.length + '\r');
  }
  console.log('\n');
  const alive = results.filter(r => r.ok);
  const dead  = results.filter(r => !r.ok);

  console.log('=== DEAD: ' + dead.length + ' ===');
  dead.forEach(r => console.log('  X ' + r.name + ' - ' + r.error));
  console.log('\n=== ALIVE: ' + alive.length + ' ===');
  alive.forEach(r => console.log('  OK ' + r.name + ' - @' + r.username));

  if (dead.length) {
    const aliveAccs = alive.map(r => accounts.find(a => a.n === r.name));
    console.log('\nSaving ' + aliveAccs.length + ' alive accounts...');
    await persistConfig({ accounts: aliveAccs, API_ID, API_HASH, CHAT_ID });
    console.log('Done - dead accounts removed, redeploy triggered.');
  } else {
    console.log('\nAll alive!');
  }
  process.exit(0);
})();
