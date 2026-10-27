// vote-bot.js
// Runs on a schedule (via GitHub Actions). Checks the target chat for recent
// polls and auto-votes on the option specified by TARGET_OPTION.
//
// Required env vars (set as GitHub Actions secrets/variables):
//   API_ID          - from my.telegram.org
//   API_HASH        - from my.telegram.org
//   SESSION_STRING  - generated once via generate-session.js
//   CHAT_ID         - the group/channel username (e.g. "@mygroup") or numeric ID
//   TARGET_OPTION   - which option to vote for. Either:
//                       - a number like "1", "2", "3" (1-based option position), or
//                       - a text match, e.g. "Yes" (matches option text, case-insensitive)
//   LOOKBACK_MINUTES (optional) - how far back to scan for polls, default 15
//
// Persists which poll IDs have already been voted on in voted-polls.json,
// which the GitHub Actions workflow commits back to the repo so votes are
// never repeated.

const fs = require("fs");
const path = require("path");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");

const VOTED_FILE = path.join(__dirname, "voted-polls.json");

function loadVoted() {
  try {
    return new Set(JSON.parse(fs.readFileSync(VOTED_FILE, "utf8")));
  } catch {
    return new Set();
  }
}

function saveVoted(votedSet) {
  fs.writeFileSync(VOTED_FILE, JSON.stringify([...votedSet], null, 2));
}

function pickOptionIndex(poll, targetOption) {
  const options = poll.answers; // array of PollAnswer { text, option (Buffer) }
  const trimmed = (targetOption || "").trim();

  // Numeric match: "1" => first option
  if (/^\d+$/.test(trimmed)) {
    const idx = parseInt(trimmed, 10) - 1;
    if (idx >= 0 && idx < options.length) return idx;
  }

  // Text match (case-insensitive substring)
  const lower = trimmed.toLowerCase();
  const foundIdx = options.findIndex((opt) =>
    (opt.text?.text || opt.text || "").toString().toLowerCase().includes(lower)
  );
  return foundIdx; // -1 if not found
}

(async () => {
  const apiId = parseInt(process.env.API_ID || "0", 10);
  const apiHash = process.env.API_HASH || "";
  const sessionString = process.env.SESSION_STRING || "";
  const chatId = process.env.CHAT_ID || "";
  const targetOption = process.env.TARGET_OPTION || "";
  const lookbackMinutes = parseInt(process.env.LOOKBACK_MINUTES || "15", 10);

  if (!apiId || !apiHash || !sessionString || !chatId || !targetOption) {
    console.error(
      "Missing required env vars. Need API_ID, API_HASH, SESSION_STRING, CHAT_ID, TARGET_OPTION."
    );
    process.exit(1);
  }

  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 3,
  });

  await client.connect();

  const voted = loadVoted();
  const cutoff = Date.now() / 1000 - lookbackMinutes * 60;

  const messages = await client.getMessages(chatId, { limit: 30 });

  let votedCount = 0;

  for (const msg of messages) {
    if (!msg.media || msg.media.className !== "MessageMediaPoll") continue;
    if (msg.date < cutoff) continue;

    const pollId = msg.media.poll.id.toString();
    if (voted.has(pollId)) continue;

    // Skip if poll already closed
    if (msg.media.poll.closed) {
      voted.add(pollId);
      continue;
    }

    const optionIdx = pickOptionIndex(msg.media.poll, targetOption);
    if (optionIdx === -1) {
      console.log(`Poll ${pollId}: no option matched TARGET_OPTION="${targetOption}", skipping.`);
      continue;
    }

    const optionBytes = msg.media.poll.answers[optionIdx].option;

    try {
      await client.invoke(
        new Api.messages.SendVote({
          peer: chatId,
          msgId: msg.id,
          options: [optionBytes],
        })
      );
      console.log(`Voted on poll ${pollId} -> option ${optionIdx + 1}`);
      voted.add(pollId);
      votedCount++;
    } catch (err) {
      console.error(`Failed to vote on poll ${pollId}:`, err.message);
    }
  }

  saveVoted(voted);
  console.log(`Done. Votes cast this run: ${votedCount}`);

  await client.disconnect();
  process.exit(0);
})();
