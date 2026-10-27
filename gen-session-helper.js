const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const fs = require("fs");

function waitForFile(path) {
  return new Promise(resolve => {
    const check = () => {
      try {
        const data = fs.readFileSync(path, "utf8").trim();
        if (data) resolve(data);
        else setTimeout(check, 1000);
      } catch { setTimeout(check, 1000); }
    };
    check();
  });
}

(async () => {
  const apiId = parseInt(process.env.API_ID || "0", 10);
  const apiHash = process.env.API_HASH || "";
  if (!apiId || !apiHash) { console.log("Missing API_ID/API_HASH"); process.exit(1); }
  console.log("Connecting to Telegram...");
  const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });
  await client.start({
    phoneNumber: async () => {
      const phone = await waitForFile("/tmp/phone_input");
      console.log("Phone:", phone);
      return phone;
    },
    password: async () => { try { return fs.readFileSync("/tmp/password_input", "utf8").trim(); } catch { return ""; } },
    phoneCode: async () => {
      console.log("OTP sent. Enter OTP below:");
      const code = await waitForFile("/tmp/otp_input");
      return code;
    },
    onError: (err) => console.log(err),
  });
  const sessionStr = client.session.save();
  console.log("\n=== SESSION_STRING ===");
  console.log(sessionStr);
  fs.writeFileSync("/tmp/session_output", sessionStr);
  await client.disconnect();
  process.exit(0);
})();
