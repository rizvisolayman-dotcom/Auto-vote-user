const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, r)); }

(async () => {
  const apiId = parseInt(process.env.API_ID, 10);
  const apiHash = process.env.API_HASH;
  if (!apiId || !apiHash) { console.log("Set API_ID and API_HASH"); process.exit(1); }

  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 3,
    useWSS: false,
    deviceModel: "Termux",
    systemVersion: "Android",
    appVersion: "1.0.0",
  });
  await client.connect();

  const phone = await ask("Phone number (with country code, e.g. +8801XXXXXXXXX): ");
  const result = await client.sendCode({ apiId, apiHash }, phone);
  const code = await ask("OTP code sent to Telegram: ");
  let pwd = await ask("2FA password (leave blank if none): ");
  if (!pwd) pwd = "";

  try {
    await client.invoke(new Api.auth.SignIn({
      phoneNumber: phone,
      phoneCodeHash: result.phoneCodeHash,
      phoneCode: code,
    }));
  } catch (e) {
    if (e.errorMessage === "SESSION_PASSWORD_NEEDED") {
      await client.invoke(new Api.account.CheckPassword({ password: new Api.InputCheckPasswordSRP({ srpId: 0, srpB: Buffer.alloc(0), password: pwd }) }));
    } else {
      throw e;
    }
  }

  console.log("\n=== SESSION_STRING ===");
  console.log(client.session.save());
  console.log("======================");
  rl.close();
  process.exit(0);
})().catch(e => { console.error("Error:", e.message); process.exit(1); });
