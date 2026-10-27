<?php
const SITE = [
  'name'    => 'SOLAYMAN X CHEAT',
  'owner'   => 'Solayman X Cheat',
  'tagline' => 'DIGITAL KEY STORE',
  'telegram'=> 'https://t.me/DCFsolayman',
  'yt'      => 'https://youtube.com/shorts/XhPS81ADeYE',
  'yt_why'  => '3tFzqnpdpJs',
  'binance_pay_id' => '8812345678',
  'merchant'=> 'SOLAYMAN X CHEAT STORE',
  'base_url'=> '', // auto-detected when empty
  'email_from_name' => 'SOLAYMAN X CHEAT',
  'support_email' => 'solaymanrigve12345678@gmail.com',
  'phone'   => '01902214912',
  'demo_approve' => true, // demo site: order/deposit approve buttons
];

// bKash/Nagad auto gateway (ZR PAY BD). Fill keys + enabled=true to go live.
const RUPANTOR = [
  'api_key'   => '[REDACTED_RUPANTOR_KEY]',
  'checkout'  => 'https://payment.rupantorpay.com/api/payment/checkout',
  'verify'    => 'https://payment.rupantorpay.com/api/payment/verify-payment',
  'rate'      => 122, // 1 USD = 122 BDT
];

const GATEWAY = [
  'enabled'   => false,
  'base'      => 'https://pay.zrpaybd.xyz/api',
  'api_key'   => '',
  'secret_key'=> '',
  'brand_key' => '',
];

// Auto-restock webhook secret (userscript -> stock_push/stock_status/stock_dump)
const STOCK_SECRET = '[REDACTED_STOCK_SECRET]';

// 'emailjs' = real email via EmailJS API | 'mail' = PHP mail() | 'none' = show link in UI
const MAIL_MODE = 'emailjs';

const EMAILJS = [
  'public_key'  => 'wTPjQp9cXU4XL1Nzg',
  'private_key' => '[REDACTED_EMAILJS_KEY]',
  'service_id'  => 'service_qcb6hcb',
  'template_id' => 'template_ii07c2b',
];

// DB_DRIVER: 'sqlite' (default — only data/ folder needed) or 'mysql' (shared hosting)
// MySQL holo panel theke peyecho credentials ekhane boshao:
const DB_DRIVER = 'sqlite';
const DB_HOST   = 'sql304.infinityfree.com';
const DB_NAME   = 'if0_43202417';
const DB_USER   = 'if0_43202417';
const DB_PASS   = '[REDACTED_DB_PASS]';

const DB_FILE = __DIR__ . '/data/store.sqlite';

function email_from(): string {
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  return 'no-reply@' . preg_replace('/:\\d+$/', '', $host);
}
