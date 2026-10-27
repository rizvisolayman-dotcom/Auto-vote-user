const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");
const fs = require("fs");

(async () => {
  const apiId = parseInt(process.env.API_ID, 10);
  const apiHash = process.env.API_HASH;
  const phone = fs.readFileSync("/tmp/phone_input", "utf8").trim();

  const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 3 });
  await client.connect();
  console.log("Connected. Sending code...");

  const result = await client.sendCode({ apiId, apiHash }, phone);
  console.log("Code sent! OTP pathaice Telegram e. OTP code ta likhun:");

  // Wait for OTP
  const otp = await new Promise(resolve => {
    const check = () => {
      try {
        const d = fs.readFileSync("/tmp/otp_input", "utf8").trim();
        if (d) resolve(d);
        else setTimeout(check, 1000);
      } catch { setTimeout(check, 1000); }
    };
    check();
  });

  console.log("Signing in...");
  await client.invoke(new Api.auth.SignIn({
    phoneNumber: phone,
    phoneCodeHash: result.phoneCodeHash,
    phoneCode: otp,
  }));

  const sesh = client.session.save();
  console.log("\n=== SESSION_STRING ===");
  console.log(sesh);
  console.log("======================");
  fs.writeFileSync("/tmp/session_string", sesh);
  fs.writeFileSync("/tmp/session_done", "1");
  await client.disconnect();
  process.exit(0);
})().catch(e => { console.error("Error:", e.message || e); process.exit(1); });
