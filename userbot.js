const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const fs = require('fs');
const path = require('path');
let { accounts, API_ID, API_HASH, CHAT_ID } = require('./load-config.js');

function freshAccounts() {
  try {
    delete require.cache[require.resolve('./config.js')];
    return require('./config.js').accounts;
  } catch (e) {
    try {
      const fresh = require('./load-config.js');
      API_ID = fresh.API_ID; API_HASH = fresh.API_HASH; CHAT_ID = fresh.CHAT_ID;
      return fresh.accounts;
    } catch { return accounts; }
  }
}

async function voteAll(target) {
  const t = (target || '').trim();
  const n = parseInt(t, 10);
  if (isNaN(n) || n < 2 || n > 12) return 'Option must be 2-12';
  const optionBytes = Buffer.from([0x30 + (n - 2)]);
  let pollId = null;

  const accs = freshAccounts();
  for (const acc of accs) {
    try {
      const c = new TelegramClient(new StringSession(acc.s), API_ID, API_HASH, { connectionRetries: 3, autoReconnect: false });
      await c.connect();
      const msgs = await c.getMessages(CHAT_ID, { limit: 30 });
      for (const m of msgs) {
        if (m.media && m.media.className === 'MessageMediaPoll') { pollId = m.media.poll.id.toString(); break; }
        if (m.media && m.media.className === 'MessageMediaUnsupported') {
          try {
            const r = await c.invoke(new Api.messages.GetPollResults({ peer: CHAT_ID, msgId: m.id }));
            if (r?.updates?.[0]?.pollId) { pollId = r.updates[0].pollId.toString(); break; }
          } catch {}
        }
      }
      await c.disconnect();
      if (pollId) break;
    } catch {}
  }
  if (!pollId) return 'No poll found';

  let results = [];
  await Promise.all(accs.map(async (acc) => {
    try {
      const c = new TelegramClient(new StringSession(acc.s), API_ID, API_HASH, { connectionRetries: 3, autoReconnect: false });
      await c.connect();
      const msgs = await c.getMessages(CHAT_ID, { limit: 30 });
      for (const m of msgs) {
        let match = false;
        if (m.media && m.media.className === 'MessageMediaPoll') match = m.media.poll.id.toString() === pollId;
        else if (m.media && m.media.className === 'MessageMediaUnsupported') {
          try {
            const r = await c.invoke(new Api.messages.GetPollResults({ peer: CHAT_ID, msgId: m.id }));
            match = r?.updates?.[0]?.pollId?.toString() === pollId;
          } catch {}
        }
        if (match) {
          await c.invoke(new Api.messages.SendVote({ peer: CHAT_ID, msgId: m.id, options: [optionBytes] }));
          results.push(`${acc.n} voted`);
          break;
        }
      }
      await c.disconnect();
    } catch (e) { results.push(`${acc.n} failed: ${e.message.substring(0, 40)}`); }
  }));
  return results.join(', ');
}

const STATE_FILE = path.join(__dirname, 'userbot-state.json');

async function voteEach(options) {
  const t = (options || '').trim();
  const results = [];
  const accs = freshAccounts();
  const nums = t.split(/[, ]+/).map(x => parseInt(x, 10));
  if (nums.length !== accs.length || nums.some(n => isNaN(n) || n < 2 || n > 12)) {
    return 'Provide one option (2-12) per account: ' + accs.length + ' values';
  }
  await Promise.all(accs.map(async (acc, i) => {
    try {
      const c = new TelegramClient(new StringSession(acc.s), API_ID, API_HASH, { connectionRetries: 3, autoReconnect: false });
      await c.connect();
      const msgs = await c.getMessages(CHAT_ID, { limit: 30 });
      for (const m of msgs) {
        let match = false;
        if (m.media && m.media.className === 'MessageMediaPoll') match = true;
        else if (m.media && m.media.className === 'MessageMediaUnsupported') {
          try {
            const r = await c.invoke(new Api.messages.GetPollResults({ peer: CHAT_ID, msgId: m.id }));
            match = !!r?.updates?.[0]?.pollId;
          } catch {}
        }
        if (match) {
          await c.invoke(new Api.messages.SendVote({ peer: CHAT_ID, msgId: m.id, options: [Buffer.from([0x30 + (nums[i] - 2)])] }));
          results.push(acc.n + ' -> option ' + nums[i]);
          break;
        }
      }
      await c.disconnect();
    } catch (e) { results.push(acc.n + ' failed: ' + (e.message || '').substring(0, 40)); }
  }));
  return results.join(', ');
}function loadState() { try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return { lastMsgId: 0 }; } }
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s)); }

let lastMsgId = loadState().lastMsgId;

async function checkAndVote() {
  let client = null;
  try {
    client = new TelegramClient(new StringSession(freshAccounts()[0].s), API_ID, API_HASH, { connectionRetries: 3, autoReconnect: false });
    await client.connect();
    const msgs = await client.getMessages(CHAT_ID, { limit: 3 });
    for (const m of msgs) {
      if (m.id <= lastMsgId) continue;
      lastMsgId = Math.max(lastMsgId, m.id);
      const text = (m.message || '').trim();
      const match = text.toLowerCase().match(/^run\s+(\d+)$/);
      if (match) {
        const target = match[1];
        console.log('Run', target);
        try { await client.sendMessage(CHAT_ID, { message: `Voting ${target}...` }); } catch {}
        const result = await voteAll(target);
        try { await client.sendMessage(CHAT_ID, { message: result, replyTo: m.id }); } catch {}
      }
    }
    const state = { lastMsgId };
    saveState(state);
    await client.disconnect();
  } catch (e) {
    console.error('Check error:', e.code || e.errorMessage || e.message);
    if (client) try { await client.disconnect(); } catch {}
  }
}

if (require.main === module) {
  console.log('Userbot started');
  checkAndVote();
  setInterval(checkAndVote, 5000);
}

async function findLatestPoll() {
  const accs = freshAccounts();
  for (const acc of accs) {
    try {
      const c = new TelegramClient(new StringSession(acc.s), API_ID, API_HASH, { connectionRetries: 3, autoReconnect: false });
      await c.connect();
      const msgs = await c.getMessages(CHAT_ID, { limit: 30 });
      let found = null;
      for (const m of msgs) {
        let isPoll = false, pollId = null;
        if (m.media && m.media.className === 'MessageMediaPoll') { isPoll = true; pollId = m.media.poll.id.toString(); }
        else if (m.media && m.media.className === 'MessageMediaUnsupported') {
          try {
            const r = await c.invoke(new Api.messages.GetPollResults({ peer: CHAT_ID, msgId: m.id }));
            if (r?.updates?.[0]?.pollId) { isPoll = true; pollId = r.updates[0].pollId.toString(); }
          } catch {}
        }
        if (isPoll) { found = { msgId: m.id, pollId }; break; }
      }
      await c.disconnect();
      if (found) return found;
    } catch {}
  }
  return null;
}

module.exports = { voteAll, voteEach, findLatestPoll };
