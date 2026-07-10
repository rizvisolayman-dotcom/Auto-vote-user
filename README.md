# Telegram Auto Vote (তোমার নিজের Ludo Poll-এর জন্য)

তোমার personal Telegram account দিয়ে নিজের group/channel-এর poll-এ automatic vote দেওয়ার সিস্টেম।

## ধাপ ১: API_ID / API_HASH নাও
1. https://my.telegram.org -> লগইন করো তোমার নাম্বার দিয়ে
2. "API Development Tools" -> একটা app বানাও -> `api_id` আর `api_hash` কপি করো

## ধাপ ২: Session String বানাও (একবারই, নিজের কম্পিউটারে)
```bash
npm install
API_ID=123456 API_HASH=your_hash node generate-session.js
```
- Phone number দাও (country code সহ)
- OTP আসলে সেটা দাও
- শেষে একটা লম্বা string প্রিন্ট হবে — এটাই তোমার `SESSION_STRING`

⚠️ এই string যার কাছে যাবে সে তোমার Telegram account পুরোপুরি access পাবে। এটা কখনো public repo-তে বা কোড-এ hardcode করবে না — শুধু GitHub Secret হিসেবে রাখবে।

## ধাপ ৩: GitHub repo বানাও (Private রাখবে)
এই ফোল্ডারের সব ফাইল push করো একটা private GitHub repo-তে।

## ধাপ ৪: Secrets ও Variables সেট করো
Repo -> Settings -> Secrets and variables -> Actions

**Secrets** (গোপন জিনিস):
- `API_ID`
- `API_HASH`
- `SESSION_STRING`

**Variables** (দিনে দিনে বদলাতে পারবে, GitHub UI থেকেই):
- `CHAT_ID` — যে গ্রুপ/চ্যানেলে poll আসে, তার username (যেমন `@mygroup`) অথবা numeric ID
- `TARGET_OPTION` — আজকে কোন option-এ ভোট দিবে। উদাহরণ:
  - `1` → প্রথম option
  - `2` → দ্বিতীয় option
  - `Six` → যে option-এর টেক্সটে "Six" আছে সেটায় ভোট দিবে

## প্রতিদিন যা করবে
শুধু `TARGET_OPTION` variable-এর মান বদলে দাও (Settings -> Secrets and variables -> Actions -> Variables ট্যাব)। কোনো code push লাগবে না।

## কীভাবে কাজ করে
- প্রতি ৫ মিনিটে GitHub Actions script চালায় (cron)
- শেষ ১৫ মিনিটের মধ্যে আসা poll খুঁজে বের করে
- `TARGET_OPTION` অনুযায়ী option বাছাই করে ভোট দেয়
- কোন poll-এ ভোট দিয়েছে তার হিসাব `voted-polls.json`-এ রাখে যাতে বারবার ভোট না হয়

## Manual test
GitHub repo -> Actions ট্যাব -> "Telegram Auto Vote" workflow -> "Run workflow" বাটনে চাপলে সাথে সাথে test করতে পারবে, ৫ মিনিট অপেক্ষা করা লাগবে না।

## নিরাপত্তা নোট
- Repo অবশ্যই **Private** রাখবে
- `SESSION_STRING` কারো সাথে শেয়ার করলে সে তোমার Telegram account পুরোপুরি নিয়ন্ত্রণ করতে পারবে — এটা password-এর মতোই গুরুত্বপূর্ণ
