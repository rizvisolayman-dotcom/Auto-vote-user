const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const { accounts, API_ID, API_HASH, CHAT_ID } = require('./config.js');

async function findPollMsg(c) {
  const msgs = await c.getMessages(CHAT_ID, { limit: 30 });
  for (const m of msgs) {
    if (m.media && m.media.className === 'MessageMediaPoll') return m;
    if (m.media && m.media.className === 'MessageMediaUnsupported') {
      try {
        const r = await c.invoke(new Api.messages.GetPollResults({ peer: CHAT_ID, msgId: m.id }));
        if (r?.updates?.[0]?.pollId) return m;
      } catch {}
    }
  }
  return null;
}

(async () => {
  const results = [];
  await Promise.all(accounts.map(async (acc) => {
    try {
      const c = new TelegramClient(new StringSession(acc.s), API_ID, API_HASH, { connectionRetries: 3, autoReconnect: false });
      await c.connect();
      const pollMsg = await findPollMsg(c);
      if (!pollMsg) throw new Error('no poll found');
      const target = String(3 + accounts.indexOf(acc));
      const optionBytes = Buffer.from([0x30 + (parseInt(target, 10) - 3)]);
      await c.invoke(new Api.messages.SendVote({ peer: CHAT_ID, msgId: pollMsg.id, options: [optionBytes] }));
      results.push(acc.n + ' -> option ' + target);
      await c.disconnect();
    } catch (e) { results.push(acc.n + ' FAILED: ' + (e.message || e).substring(0, 60)); }
  }));
  console.log(results.join(' | '));
  process.exit(0);
})();
