require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

function ok(res, data) { return res.json({ success: true, ...data }); }
function fail(res, status, message) { return res.status(status).json({ success: false, message }); }

async function bkashGrantToken() {
  const base = process.env.BKASH_BASE_URL;
  const username = process.env.BKASH_USERNAME;
  const password = process.env.BKASH_PASSWORD;
  const appKey = process.env.BKASH_APP_KEY;
  const appSecret = process.env.BKASH_APP_SECRET;
  if (!base || !username || !password || !appKey || !appSecret) return null;
  const r = await fetch(`${base}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: { username, password, 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_key: appKey, app_secret: appSecret })
  });
  const j = await r.json();
  if (!r.ok || !j.id_token) throw new Error(j.statusMessage || j.message || 'bKash token grant failed');
  return { token: j.id_token, appKey };
}

async function verifyBkash(trxId, amount) {
  if (process.env.MOCK_PAY === '1') return { verified: true, status: 'MockVerified', amount: Number(amount) || 0 };
  const ctx = await bkashGrantToken();
  if (!ctx) return { configured: false };
  const base = process.env.BKASH_BASE_URL;
  const r = await fetch(`${base}/tokenized/checkout/general/searchTransaction`, {
    method: 'POST',
    headers: {
      Authorization: ctx.token,
      'X-APP-Key': ctx.appKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trxID: trxId })
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.statusMessage || j.message || 'bKash search failed');
  const status = j.transactionStatus || j.trxStatus || j.status;
  const paid = Number(j.amount || j.paidAmount || 0);
  const invoice = j.merchantInvoiceNumber || j.invoiceNumber;
  if (status !== 'Completed') return { verified: false, reason: 'Transaction not completed', raw: j };
  if (amount && paid && Math.abs(paid - Number(amount)) > 0.01) return { verified: false, reason: 'Amount mismatch', raw: j };
  return { verified: true, status, amount: paid, invoice, raw: j };
}

async function verifyNagad(trxId, amount) {
  if (process.env.MOCK_PAY === '1') return { verified: true, status: 'MockVerified', amount: Number(amount) || 0 };
  const base = process.env.NAGAD_BASE_URL;
  const merchantId = process.env.NAGAD_MERCHANT_ID;
  if (!base || !merchantId) return { configured: false };
  const url = process.env.NAGAD_VERIFY_URL || `${base}/verify/${encodeURIComponent(trxId)}`;
  const r = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Merchant-Id': merchantId,
      'Content-Type': 'application/json'
    }
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.message || 'Nagad verify failed');
  const status = j.status || j.transactionStatus;
  const paid = Number(j.amount || j.paidAmount || 0);
  if (status !== 'Success' && status !== 'Completed') return { verified: false, reason: 'Transaction not successful', raw: j };
  if (amount && paid && Math.abs(paid - Number(amount)) > 0.01) return { verified: false, reason: 'Amount mismatch', raw: j };
  return { verified: true, status, amount: paid, raw: j };
}

app.get('/health', (req, res) => ok(res, { status: 'up' }));

/* ---------- SSLCommerz hosted gateway (bKash / Nagad / Card) ---------- */
const fs = require('fs');
const path = require('path');
const LEDGER = path.join(__dirname, 'data', 'ledger.json');

function readLedger() {
  try { return JSON.parse(fs.readFileSync(LEDGER, 'utf8')); }
  catch (e) { return { wallets: {}, payments: {} }; }
}
function writeLedger(d) {
  fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
  fs.writeFileSync(LEDGER, JSON.stringify(d, null, 2));
}
function sszCfg() {
  const sandbox = process.env.SSLC_SANDBOX === '1';
  return {
    id: process.env.SSLC_STORE_ID,
    pw: process.env.SSLC_STORE_PASSWD,
    gw: process.env.SSLC_GW_URL || (sandbox ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php' : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'),
    validator: process.env.SSLC_VALIDATOR || (sandbox ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php' : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'),
    sandbox
  };
}
function baseUrl() {
  return process.env.BASE_URL || ('http://127.0.0.1:' + PORT);
}

app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, purpose = 'deposit', email, name, code } = req.body || {};
    const amt = Number(amount);
    if (!email) return fail(res, 400, 'email is required');
    if (!isFinite(amt) || amt <= 0) return fail(res, 400, 'amount is invalid');
    const cfg = sszCfg();
    if (!cfg.id || !cfg.pw) return fail(res, 503, 'Gateway not configured — add SSLC_STORE_ID and SSLC_STORE_PASSWD to .env');
    const tranId = (String(code || ('SXC' + Date.now().toString(36))).toUpperCase()).replace(/[^A-Z0-9-]/g, '');
    const params = new URLSearchParams({
      store_id: cfg.id,
      store_passwd: cfg.pw,
      total_amount: amt.toFixed(2),
      currency: 'BDT',
      tran_id: tranId,
      success_url: baseUrl() + '/payment/success',
      fail_url: baseUrl() + '/payment/fail',
      cancel_url: baseUrl() + '/payment/cancel',
      ipn_url: baseUrl() + '/payment/ipn',
      cus_name: String(name || email).slice(0, 60),
      cus_email: String(email).slice(0, 60),
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
      shipping_method: 'NO',
      product_name: purpose === 'deposit' ? 'Wallet Add Money' : 'Store Order',
      product_category: purpose === 'deposit' ? 'Wallet' : 'Store',
      product_profile: 'general',
      value_a: purpose,
      value_b: String(email),
      value_c: amt.toFixed(2),
      response_type: 'json'
    });
    const r = await fetch(cfg.gw, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const j = await r.json().catch(() => ({}));
    const url = j.GWURL || j.redirectGatewayURL || j.gwUrl;
    if (!url) return fail(res, 502, j.failedreason || j.statusMessage || 'Gateway session failed');
    const L = readLedger();
    L.payments[tranId] = { amount: amt, purpose, email, status: 'initiated', created: Date.now() };
    writeLedger(L);
    return ok(res, { payment_url: url, tran_id: tranId });
  } catch (e) {
    return fail(res, 500, e.message || 'Server error');
  }
});

async function validateSsl(valId) {
  const cfg = sszCfg();
  const u = new URL(cfg.validator);
  u.searchParams.set('val_id', valId);
  u.searchParams.set('store_id', cfg.id);
  u.searchParams.set('store_passwd', cfg.pw);
  u.searchParams.set('format', 'json');
  const r = await fetch(u);
  const j = await r.json().catch(() => ({}));
  return j;
}

async function settlePayment(valId) {
  const j = await validateSsl(valId);
  const valid = j.status === 'VALID' || j.status === 'VALIDATED';
  const tranId = String(j.tran_id || '').toUpperCase();
  const amt = Number(j.currency_amount || j.amount || 0);
  if (!valid || !tranId) return { ok: false, reason: j.status || 'Invalid transaction' };
  const L = readLedger();
  const p = L.payments[tranId];
  if (!p) return { ok: false, reason: 'Unknown transaction' };
  if (p.status === 'credited') return { ok: true, purpose: p.purpose, amount: p.amount, email: p.email, already: true };
  if (Math.abs(amt - p.amount) > 0.01) return { ok: false, reason: 'Amount mismatch' };
  p.status = 'credited';
  p.val_id = valId;
  p.paid = Date.now();
  if (p.purpose === 'deposit') {
    const w = L.wallets[p.email] || { balance: 0, deposits: [] };
    w.balance = (Number(w.balance) || 0) + p.amount;
    w.deposits = w.deposits || [];
    w.deposits.unshift({ code: tranId, amount: p.amount, trx: valId, method: 'Instant Pay', status: 'credited', created: Date.now() });
    w.deposits = w.deposits.slice(0, 50);
    L.wallets[p.email] = w;
  }
  L.deposits = L.deposits || [];
  if (!L.deposits.find(x => x.code === tranId)) {
    L.deposits.unshift({
      code: tranId, email: p.email, amount: p.amount, trx: valId || tranId,
      method: 'Instant Pay (Gateway)', status: p.purpose === 'deposit' ? 'auto-verified' : 'paid',
      created: Date.now()
    });
    L.deposits = L.deposits.slice(0, 300);
  }
  writeLedger(L);
  return { ok: true, purpose: p.purpose, amount: p.amount, email: p.email };
}

function returnUrl(res, paid, extra) {
  const q = new URLSearchParams({ paid: paid ? '1' : '0', ...extra });
  res.redirect('/?' + q.toString());
}

app.get('/payment/success', async (req, res) => {
  try {
    const { val_id } = req.query;
    if (!val_id) return returnUrl(res, false, { msg: 'missing val_id' });
    const r = await settlePayment(val_id);
    return returnUrl(res, r.ok, { purpose: r.purpose || '', amount: r.amount || 0, tran: req.query.tran_id || '' , msg: r.ok ? 'ok' : (r.reason || 'fail') });
  } catch (e) {
    return returnUrl(res, false, { msg: e.message });
  }
});

app.post('/payment/ipn', async (req, res) => {
  try {
    const val_id = req.body.val_id || req.query.val_id;
    if (!val_id) return fail(res, 400, 'val_id required');
    const r = await settlePayment(val_id);
    return ok(res, { settled: r.ok, reason: r.reason || '' });
  } catch (e) {
    return fail(res, 500, e.message);
  }
});

app.get('/payment/fail', (req, res) => returnUrl(res, false, { msg: 'failed' }));
app.get('/payment/cancel', (req, res) => returnUrl(res, false, { msg: 'cancelled' }));

app.get('/api/wallet', (req, res) => {
  const email = req.query.email;
  if (!email) return fail(res, 400, 'email is required');
  const L = readLedger();
  const w = L.wallets[email] || { balance: 0, deposits: [] };
  return ok(res, { balance: Number(w.balance) || 0, deposits: w.deposits || [] });
});

/* ---------- admin: manual deposit approve ---------- */
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
function isAdmin(req) {
  const k = (req.body && req.body.key) || req.query.key || '';
  return String(k) === String(ADMIN_KEY);
}
function noAdmin(res) { return fail(res, 401, 'Wrong admin key'); }

app.post('/api/deposits', (req, res) => {
  const { email, amount, trx, method } = req.body || {};
  const amt = Number(amount);
  if (!email) return fail(res, 400, 'email is required');
  if (!isFinite(amt) || amt <= 0) return fail(res, 400, 'amount invalid');
  if (!trx || String(trx).length < 8) return fail(res, 400, 'trx invalid');
  const code = 'SXC-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const L = readLedger();
  L.deposits = L.deposits || [];
  L.deposits.unshift({ code, email, amount: amt, trx: String(trx), method: method || 'Binance Pay', status: 'pending', created: Date.now() });
  L.deposits = L.deposits.slice(0, 300);
  writeLedger(L);
  return ok(res, { code });
});

app.post('/api/deposit/auto', async (req, res) => {
  try {
    const { email, amount, trx, provider } = req.body || {};
    const amt = Number(amount);
    if (!email) return fail(res, 400, 'email is required');
    if (!isFinite(amt) || amt <= 0) return fail(res, 400, 'amount invalid');
    if (!trx || String(trx).length < 8) return fail(res, 400, 'trx invalid');
    const result = provider === 'nagad' ? await verifyNagad(trx, amt) : await verifyBkash(trx, amt);
    if (result.configured === false && process.env.MOCK_PAY !== '1') return fail(res, 503, 'Verification API not configured');
    if (!result.verified) return fail(res, 400, result.reason || 'Verification failed');
    const L = readLedger();
    const w = L.wallets[email] || { balance: 0, deposits: [] };
    w.balance = (Number(w.balance) || 0) + amt;
    w.deposits = w.deposits || [];
    const code = 'SXC-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    w.deposits.unshift({ code, amount: amt, trx: String(trx), method: (provider === 'nagad' ? 'Nagad' : 'bKash') + ' Send Money', status: 'credited', created: Date.now() });
    w.deposits = w.deposits.slice(0, 50);
    L.wallets[email] = w;
    L.deposits = L.deposits || [];
    L.deposits.unshift({ code, email, amount: amt, trx: String(trx), method: (provider === 'nagad' ? 'Nagad' : 'bKash') + ' Send Money', status: 'auto-verified', created: Date.now() });
    L.deposits = L.deposits.slice(0, 300);
    writeLedger(L);
    return ok(res, { code, balance: w.balance });
  } catch (e) {
    return fail(res, 500, e.message || 'Server error');
  }
});

app.get('/api/admin/deposits', (req, res) => {
  if (!isAdmin(req)) return noAdmin(res);
  const L = readLedger();
  return ok(res, { list: L.deposits || [] });
});

app.post('/api/admin/deposits/act', (req, res) => {
  if (!isAdmin(req)) return noAdmin(res);
  const { code, action } = req.body || {};
  const L = readLedger();
  L.deposits = L.deposits || [];
  const d = L.deposits.find(x => x.code === code);
  if (!d) return fail(res, 404, 'Deposit not found');
  if (d.status !== 'pending') return fail(res, 400, 'Already ' + d.status);
  if (action === 'reject') {
    d.status = 'rejected';
    d.done = Date.now();
    writeLedger(L);
    return ok(res, { status: 'rejected' });
  }
  if (action !== 'approve') return fail(res, 400, 'action must be approve or reject');
  d.status = 'credited';
  d.done = Date.now();
  const w = L.wallets[d.email] || { balance: 0, deposits: [] };
  w.balance = (Number(w.balance) || 0) + d.amount;
  w.deposits = w.deposits || [];
  w.deposits.unshift({ code: d.code, amount: d.amount, trx: d.trx, method: d.method, status: 'credited', created: d.created });
  w.deposits = w.deposits.slice(0, 50);
  L.wallets[d.email] = w;
  writeLedger(L);
  return ok(res, { status: 'credited', balance: w.balance });
});

app.post('/verify-bkash', async (req, res) => {
  try {
    const { trxId, amount } = req.body || {};
    if (!trxId) return fail(res, 400, 'trxId is required');
    const result = await verifyBkash(trxId, amount);
    if (result.configured === false) return fail(res, 503, 'bKash credentials not configured');
    if (!result.verified) return fail(res, 400, result.reason || 'Verification failed');
    return ok(res, { provider: 'bkash', trxId, amount: result.amount, status: result.status });
  } catch (e) {
    return fail(res, 500, e.message || 'Server error');
  }
});

app.post('/verify-nagad', async (req, res) => {
  try {
    const { trxId, amount } = req.body || {};
    if (!trxId) return fail(res, 400, 'trxId is required');
    const result = await verifyNagad(trxId, amount);
    if (result.configured === false) return fail(res, 503, 'Nagad credentials not configured');
    if (!result.verified) return fail(res, 400, result.reason || 'Verification failed');
    return ok(res, { provider: 'nagad', trxId, amount: result.amount, status: result.status });
  } catch (e) {
    return fail(res, 500, e.message || 'Server error');
  }
});

app.listen(PORT, () => console.log(`Payment server listening on ${PORT}`));
