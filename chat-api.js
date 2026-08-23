const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const path = require('path');
const { persistConfig } = require('./persist.js');

const CONFIG = path.join(__dirname, 'config.js');

async function listGroups() {
  const cfg = require('./load-config.js');
  let lastErr = null;
  for (const acc of cfg.accounts) {
    const client = new TelegramClient(new StringSession(acc.s), cfg.API_ID, cfg.API_HASH, { connectionRetries: 2 });
    try {
      await client.connect();
      const dialogs = await client.getDialogs({ limit: 200 });
      const groups = dialogs
        .filter(d => d.isGroup || d.isChannel)
        .map(d => ({ id: d.id, name: d.title || d.name || 'unnamed' }));
      await client.disconnect();
      return groups;
    } catch (e) {
      lastErr = e;
      try { await client.disconnect(); } catch {}
    }
  }
  throw lastErr || new Error('No working account');
}

async function changeChatId(newId) {
  const cfg = require('./load-config.js');
  await persistConfig({
    accounts: cfg.accounts,
    API_ID: cfg.API_ID,
    API_HASH: cfg.API_HASH,
    CHAT_ID: String(newId),
  });
  return { ok: true, chatId: String(newId) };
}

module.exports = { listGroups, changeChatId };
