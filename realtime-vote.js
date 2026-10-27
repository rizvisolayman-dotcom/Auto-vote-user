// realtime-vote.js
// Runs continuously (24/7) and listens for new polls in real time.
// The moment a poll appears in the target chat, it votes immediately -
// no waiting for a scheduled check, so there's no delay.
//
// Required env vars:
//   API_ID, API_HASH, SESSION_STRING, CHAT_ID
//
// TARGET_OPTION is read from target-option.txt in this folder EVERY TIME
// a poll comes in, so you can change it any time without restarting the
// script - just edit that file.
//
// Start it with:
//   API_ID=xxx API_HASH=xxx SESSION_STRING=xxx CHAT_ID=xxx node realtime-vote.js
//
// Keep it running in the background (see README for nohup/tmux instructions).

const fs = require("fs");
const path = require("path");
const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

const TARGET_FILE = path.join(__dirname, "target-option.txt");
const VOTED_FILE = path.join(__dirname, "voted-polls.json");

function getTargetOption() {
  try {
    return fs.readFileSync(TARGET_FILE, "utf8").trim();
  } catch {
    return "";
  }
}

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
  const options = poll.answers;
  const trimmed = (targetOption || "").trim();

  if (/^\d+$/.test(trimmed)) {
    const idx = parseInt(trimmed, 10) - 1;
    if (idx >= 0 && idx < options.length) return idx;
  }

  const lower = trimmed.toLowerCase();
  return options.findIndex((opt) =>
    (opt.text?.text || opt.text || "").toString().toLowerCase().includes(lower)
  );
}

(async () => {
  const apiId = parseInt(process.env.API_ID || "0", 10);
  const apiHash = process.env.API_HASH || "";
  const sessionString = process.env.SESSION_STRING || "";
  const chatId = process.env.CHAT_ID || "";

  if (!apiId || !apiHash || !sessionString || !chatId) {
    console.error("Missing required env vars: API_ID, API_HASH, SESSION_STRING, CHAT_ID.");
    process.exit(1);
  }

  if (!fs.existsSync(TARGET_FILE)) {
    fs.writeFileSync(TARGET_FILE, "1");
    console.log("Created target-option.txt with default value '1'. Edit this file to change it.");
  }

  const voted = loadVoted();

  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 10,
    retryDelay: 2000,
    autoReconnect: true,
  });

  await client.connect();
  console.log("Connected. Listening for new polls in real time...");
  console.log(`Watching chat: ${chatId}`);
  console.log(`Current target option: ${getTargetOption()}`);

  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (!msg || !msg.media || msg.media.className !== "MessageMediaPoll") return;

    const pollId = msg.media.poll.id.toString();
    if (voted.has(pollId)) return;

    if (msg.media.poll.closed) {
      voted.add(pollId);
      saveVoted(voted);
      return;
    }

    const targetOption = getTargetOption();
    const optionIdx = pickOptionIndex(msg.media.poll, targetOption);

    if (optionIdx === -1) {
      console.log(`Poll ${pollId}: no option matched TARGET_OPTION="${targetOption}", skipping.`);
      return;
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
      console.log(`[${new Date().toISOString()}] Voted on poll ${pollId} -> option ${optionIdx + 1}`);
      voted.add(pollId);
      saveVoted(voted);
    } catch (err) {
      console.error(`Failed to vote on poll ${pollId}:`, err.message);
    }
  }, new NewMessage({ chats: [chatId] }));

  // Keep the process alive until stopped (Ctrl+C locally, or the
  // workflow's `timeout` command sending SIGTERM at the end of the window)
  const shutdown = async () => {
    console.log("Shutting down...");
    try {
      await client.disconnect();
    } catch {}
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();
