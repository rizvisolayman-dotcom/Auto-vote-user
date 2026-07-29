const {TelegramClient} = require('telegram');
const {StringSession} = require('telegram/sessions');
const {Api} = require('telegram');
const { accounts, API_ID, API_HASH, CHAT_ID } = require('./config.js');

(async() => {
  const target = process.argv[2] || '10';
  console.log(`Voting for: "${target}"`);

  const t = (target||'').trim();
  const byteVal = /^\d+$/.test(t) && ((n=parseInt(t,10)) >= 2 && n <= 12) ? 0x30 + (n - 2) : -1;
  if (byteVal === -1) { console.log('Invalid option'); return; }
  const optionBytes = Buffer.from([byteVal]);
  console.log(`Option byte: 0x${byteVal.toString(16)}`);

  // Phase 1: find pollId from the most recent poll
  let pollId = null;
  for (const acc of accounts) {
    try {
      const c = new TelegramClient(new StringSession(acc.s), API_ID, API_HASH, {connectionRetries:3});
      await c.connect();
      const msgs = await c.getMessages(CHAT_ID, {limit:30});
      for (const m of msgs) {
        if (m.media && m.media.className === 'MessageMediaPoll') {
          pollId = m.media.poll.id.toString();
          break;
        }
        if (m.media && m.media.className === 'MessageMediaUnsupported') {
          try {
            const r = await c.invoke(new Api.messages.GetPollResults({peer: CHAT_ID, msgId: m.id}));
            const pid = r?.updates?.[0]?.pollId?.toString();
            if (pid) { pollId = pid; break; }
          } catch {}
        }
      }
      await c.disconnect();
      if (pollId) break;
    } catch {}
  }

  if (!pollId) { console.log('No poll found'); return; }
  console.log(`Found poll, voting for ${t}`);

  // Phase 2: each account finds the poll by pollId and votes
  await Promise.all(accounts.map(async (acc) => {
    try {
      const c = new TelegramClient(new StringSession(acc.s), API_ID, API_HASH, {connectionRetries:3});
      await c.connect();
      const msgs = await c.getMessages(CHAT_ID, {limit:30});
      for (const m of msgs) {
        let match = false;
        if (m.media && m.media.className === 'MessageMediaPoll') {
          match = m.media.poll.id.toString() === pollId;
        } else if (m.media && m.media.className === 'MessageMediaUnsupported') {
          try {
            const r = await c.invoke(new Api.messages.GetPollResults({peer: CHAT_ID, msgId: m.id}));
            match = r?.updates?.[0]?.pollId?.toString() === pollId;
          } catch {}
        }
        if (match) {
          await c.invoke(new Api.messages.SendVote({peer: CHAT_ID, msgId: m.id, options: [optionBytes]}));
          console.log(`Voted: ${acc.n}`);
          break;
        }
      }
      await c.disconnect();
    } catch(e) {
      console.log(`Fail: ${acc.n} -> ${e.message.substring(0,50)}`);
    }
  }));

  console.log('Done');
})();
