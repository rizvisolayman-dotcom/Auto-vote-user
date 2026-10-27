const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");

(async () => {
  const apiId = parseInt(process.env.API_ID, 10);
  const apiHash = process.env.API_HASH;
  const phone = process.env.PHONE;
  const otp = process.env.OTP;

  if (!apiId || !apiHash || !phone || !otp) {
    console.log("Need: API_ID, API_HASH, PHONE, OTP");
    process.exit(1);
  }

  const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 2 });
  await client.connect();
  console.log("Connected. Sending code...");

  const result = await client.sendCode({ apiId, apiHash }, phone);
  console.log("Code sent. Signing in...");

  const signInResult = await client.invoke(
    new Api.auth.SignIn({
      phoneNumber: phone,
      phoneCodeHash: result.phoneCodeHash,
      phoneCode: otp,
    })
  );

  const sesh = client.session.save();
  console.log("\n=== SESSION_STRING ===");
  console.log(sesh);
  console.log("======================");
  require("fs").writeFileSync("/tmp/session_output", sesh);
  await client.disconnect();
})();
