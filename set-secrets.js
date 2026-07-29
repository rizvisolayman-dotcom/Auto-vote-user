const https = require("https");
const sodium = require("libsodium-wrappers");

const TOKEN = process.env.GH_TOKEN;
const REPO = "rizvisolayman-dotcom/Auto-vote-user";

async function getPublicKey() {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: "api.github.com",
      path: `/repos/${REPO}/actions/secrets/public-key`,
      headers: {
        "Authorization": `token ${TOKEN}`,
        "User-Agent": "node",
        "Accept": "application/vnd.github.v3+json",
      },
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

async function setSecret(name, value, keyId, key) {
  await sodium.ready;
  const keyBytes = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
  const encryptedBytes = sodium.crypto_box_seal(value, keyBytes);
  const encryptedValue = sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ encrypted_value: encryptedValue, key_id: keyId });
    const opts = {
      hostname: "api.github.com",
      path: `/repos/${REPO}/actions/secrets/${name}`,
      method: "PUT",
      headers: {
        "Authorization": `token ${TOKEN}`,
        "User-Agent": "node",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(opts, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => console.log(`${name}: ${res.statusCode}`));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  const pubKey = await getPublicKey();
  console.log("Key ID:", pubKey.key_id);
  await setSecret("API_ID", "31158295", pubKey.key_id, pubKey.key);
  await setSecret("API_HASH", "2a3fe631cac9b34f645532db4da4f47d", pubKey.key_id, pubKey.key);
})();
