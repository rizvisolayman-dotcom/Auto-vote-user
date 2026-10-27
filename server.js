require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

/* ---------- Database (SQLite) ---------- */
const DB_PATH = path.join(__dirname, 'data', 'store.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  balance REAL DEFAULT 0,
  role TEXT DEFAULT 'user',
  session_token TEXT DEFAULT NULL,
  session_expires INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  verified INTEGER DEFAULT 1,
  stock INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  product_id INTEGER,
  product_name TEXT,
  variant TEXT,
  quantity INTEGER DEFAULT 1,
  key_type TEXT DEFAULT 'direct',
  android_id TEXT DEFAULT '',
  coupon TEXT DEFAULT '',
  discount REAL DEFAULT 0,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'BDT',
  payment_method TEXT,
  trx_id TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at INTEGER DEFAULT (strftime('%s','now'))
);
CREATE TABLE IF NOT EXISTS cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  variant TEXT DEFAULT '1day',
  quantity INTEGER DEFAULT 1,
  key_type TEXT DEFAULT 'direct',
  android_id TEXT DEFAULT '',
  created_at INTEGER DEFAULT (strftime('%s','now')),
  UNIQUE(user_email, product_id, variant, key_type)
);
CREATE TABLE IF NOT EXISTS deposits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  amount REAL NOT NULL,
  trx TEXT NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at INTEGER DEFAULT (strftime('%s','now')),
  done_at INTEGER
);
CREATE TABLE IF NOT EXISTS wallets (
  user_email TEXT PRIMARY KEY,
  balance REAL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_percent REAL NOT NULL DEFAULT 0,
  active INTEGER DEFAULT 1
);
`);

// Seed coupons
db.prepare(`INSERT OR IGNORE INTO coupons (code, discount_percent, active) VALUES ('SAVE10', 10, 1), ('PANEL50', 50, 1)`).run();

// Seed products if empty
const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (count === 0) {
  const ins = db.prepare(`INSERT INTO products (name, category, price, description, verified, stock, image_url) VALUES (?,?,?,?,?,?,?)`);
  const products = [
    ['BALA MOD NON ROOT','ANDROID',25,'Non-root Android panel mod',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=BALA+MOD'],
    ['Drip Client-Non Root','ANDROID',60,'Drip client panel non-root',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=DRIP+CLIENT'],
    ['Hg Cheat','ANDROID',80,'Hg cheat panel for Android',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=HG+CHEAT'],
    ['Prime Mod','ANDROID',50,'Prime Android mod panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=PRIME+MOD'],
    ['AimHack Android + IOS','ANDROID',20,'Aimhack for Android and iOS',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=AIMHACK'],
    ['X-REG NON ROOT-IOS','ANDROID',20,'X-REG non-root iOS panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=X-REG'],
    ['Drip Proxy Apk','ANDROID PROXY',100,'Drip proxy APK panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=DRIP+PROXY'],
    ['HG Proxy Android','ANDROID PROXY',80,'Hg proxy panel Android',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=HG+PROXY'],
    ['HG Prime Proxy New','ANDROID PROXY',50,'New HG prime proxy',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=HG+PRIME'],
    ['ANGRY MOOD','ANDROID ROOT',70,'Angry mood root panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=ANGRY+MOOD'],
    ['HEX-BLADE ROOT','ANDROID ROOT',100,'Hex blade root panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=HEX+BLADE'],
    ['Drip Root Android','ANDROID ROOT',100,'Drip root Android panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=DRIP+ROOT'],
    ['GUILD BOT','GUILD GLORY',110,'Guild bot panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=GUILD+BOT'],
    ['FF GLORY PRO','GUILD GLORY',150,'Free Fire glory pro panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=FF+GLORY'],
    ['PHANTOM ANDROID-IOS','IOS HACK',2000,'Phantom Android-iOS panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=PHANTOM'],
    ['MIGUL PRO AIMKILL','IOS HACK',500,'Migul pro aimkill iOS',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=MIGUL+PRO'],
    ['Br Mod Pc','PC HACK',120,'Br mod PC panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=BR+MOD+PC'],
    ['ROCKET MOD KERNEL','PC HACK',150,'Rocket mod kernel PC',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=ROCKET+MOD'],
    ['E•SIGN-1 YEAR','PC HACK',500,'E-sign certificate 1 year',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=E+SIGN'],
    ['ZOLO CHEAT- PUBG','PC HACK',300,'Zolo cheat for PUBG',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=ZOLO+CHEAT'],
    ['ELITE MODZ','PC HACK',400,'Elite modz PC panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=ELITE+MODZ'],
    ['DOLPHIN PLUSH','PC HACK',250,'Dolphin plush panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=DOLPHIN'],
    ['Carrom Auto Play','PC HACK',100,'Carrom auto play panel',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=CARROM'],
    ['XYZ CHEATS NON ROOT','PC HACK',180,'XYZ cheats non-root PC',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=XYZ+CHEAT'],
    ['UNSEEN MOD ROOT','PC HACK',50,'Unseen mod root PC',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=UNSEEN+MOD'],
    ['PRIME MOD-NON ROOT','PC HACK',60,'Prime mod non-root PC',1,99,'https://via.placeholder.com/300x200/6f00ff/ffffff?text=PRIME+MOD']
  ];
  for (const p of products) ins.run(...p);
}

/* ---------- Helpers ---------- */
function ok(res, data) { return res.json({ success: true, ...data }); }
function fail(res, status, message) { return res.status(status).json({ success: false, message }); }
function genOrderId() { return 'PS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(); }
function genCode() { return 'SXC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }
function hashPw(pw) { return crypto.createHash('sha256').update(pw).digest('hex'); }
function genToken() { return crypto.randomBytes(32).toString('hex'); }

const CURRENCIES = {
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', rate: 1 },
  USDT: { symbol: 'USDT', name: 'US Dollar', rate: 125 },
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 1 }
};
const VARIANTS = [
  { key: '1day', label: '1 Day', mult: 1 },
  { key: '7day', label: '7 Days', mult: 5 },
  { key: '30day', label: '30 Days', mult: 15 }
];
const KEY_TYPES = [
  { key: 'direct', label: 'Direct Key' },
  { key: 'device', label: 'Device Bound + Android ID' }
];
const PAYMENTS = [
  { id: 'binance', label: 'Binance Pay', icon: 'fas fa-coins', hint: 'Send to Binance Pay ID' },
  { id: 'bkash', label: 'bKash', icon: 'fas fa-mobile-alt', hint: 'Personal / Merchant' },
  { id: 'nagad', label: 'Nagad', icon: 'fas fa-credit-card', hint: 'Merchant / Personal' },
  { id: 'usdt', label: 'USDT (TRC20)', icon: 'fab fa-bitcoin', hint: 'Crypto wallet' }
];

function requireAuth(req, res, next) {
  const token = req.headers['authorization'] || req.query.token || (req.body && req.body.token);
  if (!token) return fail(res, 401, 'Login required');
  const row = db.prepare('SELECT * FROM users WHERE session_token = ? AND session_expires > strftime(\'%s\',\'now\')').get(token);
  if (!row) return fail(res, 401, 'Invalid or expired session');
  req.user = row;
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return fail(res, 403, 'Admin only');
  next();
}

/* ---------- Auth ---------- */
app.post('/api/register', (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return fail(res, 400, 'All fields required');
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) return fail(res, 400, 'Email already registered');
    const token = genToken();
    db.prepare(`INSERT INTO users (name, email, password, role, session_token, session_expires) VALUES (?,?,?,'user',?, strftime('%s','now') + 7*86400)`)
      .run(name, email, hashPw(password), token, Date.now() / 1000 + 7*86400);
    db.prepare(`INSERT OR IGNORE INTO wallets (user_email, balance) VALUES (?, 0)`).run(email);
    return ok(res, { token, user: { name, email, role: 'user', balance: 0 } });
  } catch (e) { return fail(res, 500, e.message); }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return fail(res, 400, 'Email and password required');
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!row || row.password !== hashPw(password)) return fail(res, 401, 'Invalid credentials');
    const token = genToken();
    db.prepare('UPDATE users SET session_token = ?, session_expires = strftime(\'%s\',\'now\') + 7*86400 WHERE id = ?').run(token, row.id);
    return ok(res, { token, user: { id: row.id, name: row.name, email: row.email, role: row.role, balance: Number(row.balance || 0) } });
  } catch (e) { return fail(res, 500, e.message); }
});

app.post('/api/logout', requireAuth, (req, res) => {
  db.prepare('UPDATE users SET session_token = NULL, session_expires = 0 WHERE id = ?').run(req.user.id);
  return ok(res, { ok: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  return ok(res, { user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, balance: Number(req.user.balance || 0) } });
});

/* ---------- Products & Categories ---------- */
app.get('/api/products', (req, res) => {
  const { cat } = req.query;
  let sql = 'SELECT * FROM products WHERE stock > 0';
  const params = [];
  if (cat && cat !== 'All') { sql += ' AND category = ?'; params.push(cat); }
  sql += ' ORDER BY id DESC';
  const rows = db.prepare(sql).all(...params);
  return ok(res, { products: rows });
});

app.get('/api/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all();
  return ok(res, { categories: ['All', ...rows.map(r => r.category)] });
});

app.post('/api/products', requireAuth, requireAdmin, (req, res) => {
  try {
    const { name, category, price, description, image_url, verified, stock } = req.body || {};
    if (!name || !category || !price) return fail(res, 400, 'name, category, price required');
    const id = db.prepare(`INSERT INTO products (name, category, price, description, image_url, verified, stock) VALUES (?,?,?,?,?,?,?)`)
      .run(name, category, Number(price), description || '', image_url || '', verified ? 1 : 0, Number(stock) || 1).lastInsertRowid;
    return ok(res, { id, name, category, price: Number(price) });
  } catch (e) { return fail(res, 500, e.message); }
});

/* ---------- Cart ---------- */
app.get('/api/cart', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM cart WHERE user_email = ?').all(req.user.email);
  const products = db.prepare('SELECT id, name, category, price FROM products').all();
  const pMap = {}; for (const p of products) pMap[p.id] = p;
  const items = rows.map(r => {
    const p = pMap[r.product_id];
    const variant = VARIANTS.find(v => v.key === r.variant) || VARIANTS[0];
    const line = p.price * variant.mult * r.quantity;
    return { id: r.id, product: p, variant, quantity: r.quantity, key_type: r.key_type, android_id: r.android_id, line_total: line };
  });
  const total = items.reduce((s, i) => s + i.line_total, 0);
  return ok(res, { items, total: fmt(total) });
});

app.post('/api/cart/add', requireAuth, (req, res) => {
  try {
    const { product_id, variant = '1day', quantity = 1, key_type = 'direct', android_id = '' } = req.body || {};
    const p = db.prepare('SELECT * FROM products WHERE id = ? AND stock > 0').get(product_id);
    if (!p) return fail(res, 404, 'Product not found or out of stock');
    const existing = db.prepare('SELECT * FROM cart WHERE user_email = ? AND product_id = ? AND variant = ? AND key_type = ?').get(req.user.email, product_id, variant, key_type);
    if (existing) {
      db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').push(Number(quantity) || 1, existing.id).run();
    } else {
      db.prepare(`INSERT INTO cart (user_email, product_id, variant, quantity, key_type, android_id) VALUES (?,?,?,?,?,?)`)
        .run(req.user.email, product_id, variant, Number(quantity) || 1, key_type, android_id || '');
    }
    return ok(res, { ok: true });
  } catch (e) { return fail(res, 500, e.message); }
});

app.post('/api/cart/remove', requireAuth, (req, res) => {
  const { id } = req.body || {};
  db.prepare('DELETE FROM cart WHERE id = ? AND user_email = ?').run(id, req.user.email);
  return ok(res, { ok: true });
});

app.post('/api/cart/clear', requireAuth, (req, res) => {
  db.prepare('DELETE FROM cart WHERE user_email = ?').run(req.user.email);
  return ok(res, { ok: true });
});

function fmt(v) { return parseFloat(v || 0).toFixed(2); }

/* ---------- Coupons ---------- */
app.post('/api/coupon/validate', requireAuth, (req, res) => {
  const { code } = req.body || {};
  if (!code) return fail(res, 400, 'Coupon code required');
  const c = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(code.toUpperCase());
  if (!c) return fail(res, 404, 'Invalid coupon code');
  return ok(res, { code: c.code, discount_percent: c.discount_percent });
});

/* ---------- Checkout / Orders ---------- */
app.post('/api/checkout', requireAuth, (req, res) => {
  try {
    const { items, variant, key_type, android_id, coupon, payment_method } = req.body || {};
    if (!items || !Array.isArray(items) || items.length === 0) return fail(res, 400, 'Cart is empty');
    if (!payment_method) return fail(res, 400, 'Payment method required');

    let subtotal = 0;
    for (const it of items) {
      const p = db.prepare('SELECT * FROM products WHERE id = ? AND stock > 0').get(it.product_id);
      if (!p) return fail(res, 404, `Product ${it.product_id} not available`);
      subtotal += p.price * (VARIANTS.find(v => v.key === it.variant) || VARIANTS[0]).mult * it.quantity;
    }
    let discount = 0;
    if (coupon) {
      const c = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(coupon.toUpperCase());
      if (c) discount = subtotal * (c.discount_percent / 100);
    }
    const final = subtotal - discount;

    const orderId = genOrderId();
    for (const it of items) {
      const p = db.prepare('SELECT * FROM products WHERE id = ?').get(it.product_id);
      const variant = VARIANTS.find(v => v.key === it.variant) || VARIANTS[0];
      const lineTotal = p.price * variant.mult * it.quantity;
      db.prepare(`INSERT INTO orders (order_id, user_email, product_id, product_name, variant, quantity, key_type, android_id, coupon, discount, amount, currency, payment_method, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`)
        .run(orderId, req.user.email, p.id, p.name, variant.key, it.quantity, key_type, it.android_id || '', coupon || '', c ? c.discount_percent : 0, lineTotal, req.user.currency || 'BDT', payment_method);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(it.quantity, p.id);
    }
    db.prepare('DELETE FROM cart WHERE user_email = ?').run(req.user.email);

    return ok(res, { order_id: orderId, amount: fmt(final), currency: state.currency || 'BDT', payment_method, items_count: items.length });
  } catch (e) { return fail(res, 500, e.message); }
});

let state = { currency: 'BDT' };

app.get('/api/orders', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_email = ? ORDER BY created_at DESC').all(req.user.email);
  return ok(res, { orders: rows });
});

app.get('/api/orders/:orderId', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE order_id = ? AND user_email = ?').get(req.params.orderId, req.user.email);
  if (!row) return fail(res, 404, 'Order not found');
  return ok(res, { order: row });
});

/* ---------- Payments ---------- */
app.post('/api/payment/verify-bkash', requireAuth, async (req, res) => {
  try {
    const { trxId, amount } = req.body || {};
    if (!trxId) return fail(res, 400, 'trxId required');
    const result = await verifyBkash(trxId, amount);
    if (result.configured === false && process.env.MOCK_PAY !== '1') return fail(res, 503, 'bKash not configured');
    if (!result.verified) return fail(res, 400, result.reason || 'Verification failed');
    return ok(res, { provider: 'bkash', trxId, amount: result.amount, status: result.status });
  } catch (e) { return fail(res, 500, e.message || 'Server error'); }
});

app.post('/api/payment/verify-nagad', requireAuth, async (req, res) => {
  try {
    const { trxId, amount } = req.body || {};
    if (!trxId) return fail(res, 400, 'trxId required');
    const result = await verifyNagad(trxId, amount);
    if (result.configured === false && process.env.MOCK_PAY !== '1') return fail(res, 503, 'Nagad not configured');
    if (!result.verified) return fail(res, 400, result.reason || 'Verification failed');
    return ok(res, { provider: 'nagad', trxId, amount: result.amount, status: result.status });
  } catch (e) { return fail(res, 500, e.message || 'Server error'); }
});

async function bkashGrantToken() {
  const base = process.env.BKASH_BASE_URL;
  const username = process.env.BKASH_USERNAME;
  const password = process.env.BKASH_PASSWORD;
  const appKey = process.env.BKASH_APP_KEY;
  const appSecret = process.env.BKASH_APP_SECRET;
  if (!base || !username || !password || !appKey || !appSecret) return null;
  const r = await fetch(`${base}/tokenized/checkout/token/grant`, {
    method: 'POST', headers: { username, password, 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_key: appKey, app_secret: appSecret })
  });
  const j = await r.json();
  if (!r.ok || !j.id_token) return null;
  return { token: j.id_token, appKey };
}
async function verifyBkash(trxId, amount) {
  if (process.env.MOCK_PAY === '1') return { verified: true, status: 'MockVerified', amount: Number(amount) || 0 };
  const ctx = await bkashGrantToken();
  if (!ctx) return { configured: false };
  const base = process.env.BKASH_BASE_URL;
  const r = await fetch(`${base}/tokenized/checkout/general/searchTransaction`, {
    method: 'POST', headers: { Authorization: ctx.token, 'X-APP-Key': ctx.appKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ trxID: trxId })
  });
  const j = await r.json();
  if (!r.ok) return { verified: false, reason: j.statusMessage || 'bKash search failed' };
  const status = j.transactionStatus || j.trxStatus || j.status;
  const paid = Number(j.amount || j.paidAmount || 0);
  if (status !== 'Completed') return { verified: false, reason: 'Transaction not completed' };
  if (amount && paid && Math.abs(paid - Number(amount)) > 0.01) return { verified: false, reason: 'Amount mismatch' };
  return { verified: true, status, amount: paid };
}
async function verifyNagad(trxId, amount) {
  if (process.env.MOCK_PAY === '1') return { verified: true, status: 'MockVerified', amount: Number(amount) || 0 };
  const base = process.env.NAGAD_BASE_URL;
  const merchantId = process.env.NAGAD_MERCHANT_ID;
  if (!base || !merchantId) return { configured: false };
  const url = process.env.NAGAD_VERIFY_URL || `${base}/verify/${encodeURIComponent(trxId)}`;
  const r = await fetch(url, { method: 'GET', headers: { 'X-Merchant-Id': merchantId, 'Content-Type': 'application/json' } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { verified: false, reason: j.message || 'Nagad verify failed' };
  const status = j.status || j.transactionStatus;
  const paid = Number(j.amount || j.paidAmount || 0);
  if (status !== 'Success' && status !== 'Completed') return { verified: false, reason: 'Transaction not successful' };
  if (amount && paid && Math.abs(paid - Number(amount)) > 0.01) return { verified: false, reason: 'Amount mismatch' };
  return { verified: true, status, amount: paid };
}

/* ---------- Wallet / Deposit ---------- */
app.get('/api/wallet', requireAuth, (req, res) => {
  const w = db.prepare('SELECT balance FROM wallets WHERE user_email = ?').get(req.user.email);
  return ok(res, { balance: Number((w && w.balance) || 0) });
});

app.post('/api/deposit', requireAuth, (req, res) => {
  try {
    const { amount, trx, method } = req.body || {};
    const amt = Number(amount);
    if (!amt || amt <= 0) return fail(res, 400, 'Invalid amount');
    if (!trx || String(trx).length < 8) return fail(res, 400, 'Invalid transaction ID');
    const code = genCode();
    db.prepare(`INSERT INTO deposits (code, user_email, amount, trx, method, status) VALUES (?,?,?,?,?,'pending')`)
      .run(code, req.user.email, amt, trx, method || 'Binance Pay');
    return ok(res, { code, amount: amt, status: 'pending', msg: 'Deposit submitted for admin approval' });
  } catch (e) { return fail(res, 500, e.message); }
});

/* ---------- Admin ---------- */
function isAdmin(req) { return req.user && req.user.role === 'admin'; }
app.get('/api/admin/deposits', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM deposits ORDER BY created_at DESC').all();
  return ok(res, { list: rows });
});
app.post('/api/admin/deposits/act', requireAuth, requireAdmin, (req, res) => {
  const { code, action } = req.body || {};
  const d = db.prepare('SELECT * FROM deposits WHERE code = ?').get(code);
  if (!d) return fail(res, 404, 'Deposit not found');
  if (d.status !== 'pending') return fail(res, 400, 'Already ' + d.status);
  if (action === 'reject') {
    db.prepare('UPDATE deposits SET status = \'rejected\', done_at = strftime(\'%s\',\'now\') WHERE code = ?').run(code);
    return ok(res, { status: 'rejected' });
  }
  if (action !== 'approve') return fail(res, 400, 'action must be approve or reject');
  db.prepare('UPDATE deposits SET status = \'credited\', done_at = strftime(\'%s\',\'now\') WHERE code = ?').run(code);
  const w = db.prepare('SELECT * FROM wallets WHERE user_email = ?').get(d.user_email);
  if (w) {
    db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_email = ?').run(d.amount, d.user_email);
  } else {
    db.prepare('INSERT INTO wallets (user_email, balance) VALUES (?, ?)').run(d.user_email, d.amount);
  }
  return ok(res, { status: 'credited', balance: Number((w && w.balance) || 0) + d.amount });
});
app.get('/api/admin/orders', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return ok(res, { orders: rows });
});
app.post('/api/admin/orders/act', requireAuth, requireAdmin, (req, res) => {
  const { orderId, status } = req.body || {};
  if (!orderId || !status) return fail(res, 400, 'orderId and status required');
  db.prepare('UPDATE orders SET status = ? WHERE order_id = ?').run(status, orderId);
  return ok(res, { ok: true });
});
app.get('/api/admin/stats', requireAuth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const products = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  const orders = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  const revenue = db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM orders WHERE status = 'completed'").get().total;
  const pendingDeposits = db.prepare("SELECT COUNT(*) AS c FROM deposits WHERE status = 'pending'").get().c;
  return ok(res, { users, products, orders, revenue: Number(revenue || 0), pendingDeposits });
});

// Seed admin user
const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@panelsell.store');
if (!admin) {
  const token = genToken();
  db.prepare(`INSERT INTO users (name, email, password, role, session_token, session_expires) VALUES (?,?,?,'admin',?, strftime('%s','now') + 7*86400)`)
    .run('Admin', 'admin@panelsell.store', hashPw('admin123'), token);
  db.prepare(`INSERT OR IGNORE INTO wallets (user_email, balance) VALUES (?, 0)`).run('admin@panelsell.store');
  console.log('Admin created: admin@panelsell.store / admin123');
}

app.listen(PORT, () => console.log(`Panel Sell API listening on ${PORT}`));
