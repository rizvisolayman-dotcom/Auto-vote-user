// generate-session.js
// Run this ONCE on your own computer (NOT in GitHub Actions).
// It logs into YOUR personal Telegram account (phone + OTP) and prints a
// session string. Save that string as a GitHub Actions secret (SESSION_STRING).
//
// Get API_ID and API_HASH from https://my.telegram.org -> API Development Tools

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = parseInt(process.env.API_ID || "0", 10);
const apiHash = process.env.API_HASH || "";

(async () => {
  if (!apiId || !apiHash) {
    console.log("Set API_ID and API_HASH environment variables first, e.g.:");
    console.log("  API_ID=123456 API_HASH=abcdef... node generate-session.js");
    process.exit(1);
  }

  console.log("Logging in to your Telegram account...");
  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Phone number (with country code, e.g. +8801XXXXXXXXX): "),
    password: async () => await input.text("2FA password (leave blank if none): "),
    phoneCode: async () => await input.text("OTP code sent to Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("\nLogin successful!\n");
  console.log("=== SAVE THIS AS GitHub SECRET 'SESSION_STRING' ===");
  console.log(client.session.save());
  console.log("=====================================================");

  await client.disconnect();
  process.exit(0);
})();
