const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");
const fs = require("fs");

const phone = fs.readFileSync("/tmp/phone_input", "utf8").trim();
const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;

async function waitForOTP() {
  return new Promise(resolve => {
    const check = () => {
      try {
        const data = fs.readFileSync("/tmp/otp_input", "utf8").trim();
        if (data) { resolve(data); return; }
      } catch {}
      setTimeout(check, 2000);
    };
    check();
  });
}

(async () => {
  console.log("Connecting...");
  const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });
  await client.connect();

  console.log("Sending code...");
  let result;
  while (true) {
    try {
      result = await client.sendCode({ apiId, apiHash }, phone);
      break;
    } catch (e) {
      if (e.errorMessage === "FLOOD" && e.seconds) {
        const wait = Math.min(e.seconds, 60);
        console.log(`Flood wait ${e.seconds}s, waiting ${wait}s...`);
        await new Promise(r => setTimeout(r, wait * 1000));
      } else {
        throw e;
      }
    }
  }

  console.log("Code sent! Enter OTP in /tmp/otp_input");
  const otp = await waitForOTP();

  console.log("Signing in...");
  while (true) {
    try {
      await client.invoke(new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash: result.phoneCodeHash,
        phoneCode: otp,
      }));
      break;
    } catch (e) {
      if (e.errorMessage === "FLOOD" && e.seconds) {
        const wait = Math.min(e.seconds, 60);
        console.log(`SignIn flood ${e.seconds}s, waiting ${wait}s...`);
        await new Promise(r => setTimeout(r, wait * 1000));
      } else if (e.errorMessage === "PHONE_CODE_INVALID") {
        console.log("OTP expired. New OTP sent. Write new code to /tmp/otp_input");
        otp = await waitForOTP();
        // Need a new code hash
        result = await client.sendCode({ apiId, apiHash }, phone);
      } else {
        throw e;
      }
    }
  }

  const sesh = client.session.save();
  console.log("\n=== SESSION_STRING ===");
  console.log(sesh);
  console.log("======================");
  fs.writeFileSync("/tmp/session_obj", sesh);
  fs.writeFileSync("/tmp/session_done", "1");
  await client.disconnect();
  process.exit(0);
})().catch(e => { console.error("Fatal:", e.message ? e.message : e); process.exit(1); });
