<?php
require_once __DIR__ . '/lib.php';
session_start_safe();
$isAdmin = !empty($_SESSION['admin']);
$csrf = csrf_token();
$pay = pay_details();
if (!function_exists('e')) { function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); } }
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Admin — SOLAYMAN X CHEAT</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--primary:#6f00ff;--primary-light:#a866ff;--success:#10b981;--danger:#ef4444;--warning:#f59e0b;
--bg:#0a0f12;--card:#111820;--card2:#151d26;--input:#0d1319;--text:#f1f5f4;--text2:#94a3b8;
--border:rgba(255,255,255,.08);--hover:rgba(111,0,255,.08)}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;min-height:100vh}
a{color:var(--primary-light)}
.wrap{max-width:1100px;margin:0 auto;padding:20px 14px}
.top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:20px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:17px;letter-spacing:.5px}
.brand i{color:var(--primary-light)}
.brand small{display:block;font-size:10px;color:var(--text2);font-weight:600;letter-spacing:2px}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:16px}
h2{font-size:15px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
h2 i{color:var(--primary-light)}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.tab{background:var(--card);border:1px solid var(--border);color:var(--text2);padding:9px 14px;border-radius:9px;cursor:pointer;font-size:12.5px;font-weight:700}
.tab i{margin-right:6px}
.tab.active{background:var(--primary);border-color:var(--primary);color:#fff;box-shadow:0 0 16px rgba(111,0,255,.35)}
.pane{display:none}
.pane.show{display:block}
label.f{display:block;margin-bottom:12px}
label.f span{display:block;font-size:11.5px;color:var(--text2);font-weight:700;margin-bottom:5px;letter-spacing:.4px}
input[type=text],input[type=password],input[type=number]{width:100%;background:var(--input);border:1px solid var(--border);color:var(--text);padding:11px 12px;border-radius:9px;font-size:14px;outline:none}
input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(111,0,255,.2)}
.btn{background:var(--primary);color:#fff;border:none;padding:11px 18px;border-radius:9px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:7px}
.btn:hover{background:var(--primary-light)}
.btn:disabled{opacity:.5;cursor:wait}
.btn.sec{background:var(--card2);border:1px solid var(--border);color:var(--text)}
.btn.ok{background:var(--success)}
.btn.bad{background:var(--danger)}
.btn.sm{padding:6px 11px;font-size:11.5px;border-radius:7px}
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(80px);background:var(--card2);border:1px solid var(--border);color:var(--text);padding:12px 20px;border-radius:10px;font-size:13px;font-weight:700;opacity:0;transition:.3s;z-index:99;max-width:90vw;text-align:center}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.toast.ok{border-color:var(--success);color:var(--success)}
.toast.err{border-color:var(--danger);color:var(--danger)}
.grid{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:800px){.grid.c2{grid-template-columns:1fr 1fr}.grid.c3{grid-template-columns:1fr 1fr 1fr}}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th,td{text-align:left;padding:9px 8px;border-bottom:1px solid var(--border);vertical-align:middle}
th{color:var(--text2);font-size:10.5px;letter-spacing:.6px;text-transform:uppercase}
td b{font-weight:800}
.badge{font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:20px}
.badge.pending{background:rgba(245,158,11,.15);color:var(--warning)}
.badge.processing{background:rgba(59,130,246,.15);color:#3b82f6}
.badge.approved,.badge.delivered{background:rgba(16,185,129,.15);color:var(--success)}
.badge.rejected,.badge.cancelled{background:rgba(239,68,68,.15);color:var(--danger)}
.badge.other{background:rgba(148,163,184,.15);color:var(--text2)}
.tbl-wrap{overflow-x:auto}
.search{max-width:340px;margin-bottom:12px}
.prow{display:grid;grid-template-columns:64px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
@media(min-width:800px){.prow{grid-template-columns:64px 1.6fr .8fr auto}}
.pthumb{width:64px;height:64px;border-radius:10px;background:var(--card2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.pthumb img{width:100%;height:100%;object-fit:cover}
.pthumb i{color:var(--text2);font-size:20px}
.pfields{display:flex;flex-direction:column;gap:7px}
@media(min-width:800px){.pfields{display:grid;grid-template-columns:1.6fr .8fr;gap:7px}}
.pmeta{font-size:10.5px;color:var(--text2);margin-top:2px}
.pactions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
@media(min-width:800px){.pactions{grid-column:1/-1;justify-content:flex-end}}
.imgpick{position:relative;overflow:hidden}
.imgpick input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.login-box{max-width:400px;margin:60px auto}
.hint{font-size:11.5px;color:var(--text2);margin-top:5px}
.empty{color:var(--text2);font-size:13px;text-align:center;padding:22px}
.stat{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.stat div{background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-size:12px;color:var(--text2)}
.stat b{display:block;font-size:18px;color:var(--text)}
.trunc{max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:bottom}
</style>
</head>
<body>
<div class="wrap">

<?php if (!$isAdmin): ?>
<div class="login-box card">
  <h2><i class="fas fa-user-shield"></i> Admin Login</h2>
  <label class="f"><span>Username</span><input type="text" id="lgUser" autocomplete="username" value="<?= e(setting_get('admin_user', 'admin')) ?>"></label>
  <label class="f"><span>Password</span><input type="password" id="lgPass" autocomplete="current-password" placeholder="••••••••"></label>
  <button class="btn" id="lgBtn" type="button" style="width:100%;justify-content:center"><i class="fas fa-right-to-bracket"></i> Login</button>
  <p class="hint">Product name/price, photos, payment details — sab kichu ekhane change korte parben.</p>
</div>
<?php else: ?>

<div class="top">
  <div class="brand"><i class="fas fa-shield-halved"></i><div>ADMIN PANEL<small>SOLAYMAN X CHEAT</small></div></div>
  <div style="display:flex;gap:8px">
    <a class="btn sec sm" href="./"><i class="fas fa-store"></i> View Store</a>
    <button class="btn sec sm" id="logoutBtn" type="button"><i class="fas fa-right-from-bracket"></i> Logout</button>
  </div>
</div>

<div class="tabs">
  <button class="tab active" data-pane="products" type="button"><i class="fas fa-box"></i> Products</button>
  <button class="tab" data-pane="payment" type="button"><i class="fas fa-credit-card"></i> Payment Details</button>
  <button class="tab" data-pane="deposits" type="button"><i class="fas fa-sack-dollar"></i> Deposits</button>
  <button class="tab" data-pane="orders" type="button"><i class="fas fa-key"></i> Orders</button>
  <button class="tab" data-pane="keys" type="button"><i class="fas fa-ticket"></i> License Keys</button>
  <button class="tab" data-pane="account" type="button"><i class="fas fa-lock"></i> Admin Password</button>
</div>

<!-- PRODUCTS -->
<div class="pane show" id="pane-products">
  <div class="card">
    <h2><i class="fas fa-box"></i> Products <span id="pCount" style="color:var(--text2);font-weight:600;font-size:12px"></span></h2>
    <input type="text" class="search" id="pSearch" placeholder="Search product...">
    <div id="prodList"><div class="empty"><i class="fas fa-spinner fa-spin"></i> Loading...</div></div>
  </div>
</div>

<!-- PAYMENT -->
<div class="pane" id="pane-payment">
  <div class="card">
    <h2><i class="fas fa-credit-card"></i> Payment Details (checkout & deposit e dekhabe)</h2>
    <div class="grid c3">
      <label class="f"><span>Binance Pay ID</span><input type="text" id="payBinance" value="<?= e($pay['binance']) ?>"></label>
      <label class="f"><span>Merchant Name</span><input type="text" id="payMerchant" value="<?= e($pay['merchant']) ?>"></label>
      <label class="f"><span>Seller Name</span><input type="text" id="paySeller" value="<?= e($pay['seller']) ?>"></label>
    </div>
    <button class="btn" id="paySave" type="button"><i class="fas fa-floppy-disk"></i> Save Payment Details</button>
    <p class="hint">Ei details customer checkout step 4 ar Add Balance modal e show hoy.</p>
  </div>
</div>

<!-- DEPOSITS -->
<div class="pane" id="pane-deposits">
  <div class="card">
    <h2><i class="fas fa-sack-dollar"></i> Deposit Requests (last 100)</h2>
    <div class="tbl-wrap"><table id="depTbl">
      <thead><tr><th>Date</th><th>User</th><th>Code</th><th>Amount</th><th>Method</th><th>TrxID</th><th>Status</th><th></th></tr></thead>
      <tbody></tbody>
    </table></div>
  </div>
</div>

<!-- ORDERS -->
<div class="pane" id="pane-orders">
  <div class="card">
    <h2><i class="fas fa-key"></i> Orders (last 100)</h2>
    <div class="tbl-wrap"><table id="ordTbl">
      <thead><tr><th>Date</th><th>User</th><th>Code</th><th>Product</th><th>Amount</th><th>Status</th><th>Key</th><th></th></tr></thead>
      <tbody></tbody>
    </table></div>
  </div>
</div>

<!-- LICENSE KEYS -->
<div class="pane" id="pane-keys">
  <div class="card">
    <h2><i class="fas fa-ticket"></i> License Key Stock <span id="kCount" style="color:var(--text2);font-weight:600;font-size:12px"></span></h2>
    <p class="hint" style="margin-bottom:10px">Key gulo paste koren (notun line-e ekta key) — customer order deliver hole stock theke automatic key chole jabe. licencedashboard theke generate kore ekhane paste koren.</p>
    <textarea id="keyInput" rows="5" placeholder="AAAA-BBBB-CCCC-DDDD&#10;EEEE-FFFF-0000-1111&#10;... or comma separated" style="width:100%;background:var(--input);border:1px solid var(--border);color:var(--text);padding:11px 12px;border-radius:9px;font-size:13.5px;font-family:ui-monospace,monospace;outline:none;resize:vertical"></textarea>
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
      <button class="btn" id="keyAdd" type="button"><i class="fas fa-plus"></i> Add Keys to Stock</button>
      <button class="btn sec" id="keyClear" type="button"><i class="fas fa-trash"></i> Clear Input</button>
    </div>
    <div class="tbl-wrap" style="margin-top:14px"><table id="keyTbl">
      <thead><tr><th>#</th><th>Key</th><th>Status</th><th>Order</th><th>Added</th><th></th></tr></thead>
      <tbody></tbody>
    </table></div>
  </div>
</div>

<!-- ACCOUNT -->
<div class="pane" id="pane-account">
  <div class="card" style="max-width:440px">
    <h2><i class="fas fa-lock"></i> Change Admin Password</h2>
    <label class="f"><span>New password (min 6 chars)</span><input type="password" id="newPass" placeholder="••••••••"></label>
    <button class="btn" id="passSave" type="button"><i class="fas fa-floppy-disk"></i> Update Password</button>
  </div>
</div>

<?php endif; ?>
</div>

<div class="toast" id="toast"></div>

<script>
window.__ADM__ = { csrf: <?= json_encode($csrf) ?>, admin: <?= $isAdmin ? 'true' : 'false' ?>,
  pay: <?= json_encode($pay, JSON_UNESCAPED_UNICODE) ?> };
</script>
<script>
(function () {
  const ADM = window.__ADM__;
  let toastT;
  function toast(m, ok) {
    const t = document.getElementById('toast');
    t.textContent = m; t.className = 'toast show ' + (ok ? 'ok' : 'err');
    clearTimeout(toastT); toastT = setTimeout(() => t.className = 'toast', 3200);
  }
  async function api(action, data) {
    let r;
    try {
      r = await fetch('api.php?action=' + action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF': ADM.csrf },
        credentials: 'same-origin',
        body: JSON.stringify(data || {})
      });
    } catch (e) { return { ok: false, msg: 'Network error' }; }
    try { return await r.json(); } catch (e) { return { ok: false, msg: 'Server error (' + r.status + ')' }; }
  }
  async function upload(action, formData) {
    formData.append('_t', Date.now());
    let r;
    try {
      r = await fetch('api.php?action=' + action, {
        method: 'POST', headers: { 'X-CSRF': ADM.csrf }, credentials: 'same-origin', body: formData
      });
    } catch (e) { return { ok: false, msg: 'Network error' }; }
    try { return await r.json(); } catch (e) { return { ok: false, msg: 'Server error (' + r.status + ')' }; }
  }
  function money(v) { return '$' + Number(v || 0).toFixed(2); }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ---------- login ---------- */
  const lgBtn = document.getElementById('lgBtn');
  if (lgBtn) {
    async function doLogin() {
      const user = document.getElementById('lgUser').value.trim();
      const pass = document.getElementById('lgPass').value;
      if (!user || !pass) { toast('Username & password dilein', false); return; }
      lgBtn.disabled = true;
      const j = await api('admin_login', { user, pass });
      lgBtn.disabled = false;
      if (!j.ok) { toast(j.msg || 'Login failed', false); return; }
      location.reload();
    }
    lgBtn.addEventListener('click', doLogin);
    document.getElementById('lgPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  }

  if (!ADM.admin) return;

  /* ---------- tabs ---------- */
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
    document.querySelectorAll('.pane').forEach(p => p.classList.toggle('show', p.id === 'pane-' + t.dataset.pane));
    if (['deposits', 'orders', 'products', 'keys'].includes(t.dataset.pane) && window.__admLoad) window.__admLoad();
  }));

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await api('admin_logout'); location.reload();
  });

  /* ---------- products ---------- */
  let PRODUCTS = [];
  function renderProducts() {
    const q = (document.getElementById('pSearch').value || '').toLowerCase();
    const list = PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    document.getElementById('pCount').textContent = PRODUCTS.length + ' total';
    const box = document.getElementById('prodList');
    if (!list.length) { box.innerHTML = '<div class="empty">No product found</div>'; return; }
    box.innerHTML = list.map(p => `
      <div class="prow" data-id="${p.id}">
        <div class="pthumb" title="Click to change photo">
          ${p.image ? `<img src="${esc(p.image)}" alt="">` : '<i class="fas fa-image"></i>'}
          <label class="imgpick" style="position:absolute;inset:0" title="Upload photo">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-img="${p.id}">
          </label>
        </div>
        <div class="pfields">
          <input type="text" data-name="${p.id}" value="${esc(p.name)}">
          <input type="number" data-price="${p.id}" value="${p.price}" min="0" step="1">
          <div class="pmeta">${esc(p.category)}</div>
          <div class="vlist" style="margin-top:6px">
            ${p.variants.map(v => `
              <div class="vrow" style="display:flex;gap:6px;margin-bottom:4px;align-items:center">
                <input type="text" data-vlabel="${v.id}" value="${esc(v.label)}" style="width:110px" placeholder="Label">
                <input type="number" data-vmult="${v.id}" value="${v.mult}" min="0.1" step="0.1" style="width:65px" title="Multiplier (1 = base price)">
                <input type="number" data-vstock="${v.id}" value="${v.stock}" min="0" step="1" style="width:55px" title="Stock">
                <button class="btn sm" data-vsave="${v.id}" data-vpid="${p.id}" type="button" title="Save variant"><i class="fas fa-floppy-disk"></i></button>
                <button class="btn sec sm" data-vdel="${v.id}" type="button" title="Delete"><i class="fas fa-trash"></i></button>
              </div>`).join('') || '<div class="pmeta">No variants</div>'}
            <div style="margin-top:4px;display:flex;gap:6px;align-items:center">
              <input type="text" data-nvlabel="${p.id}" placeholder="New label" style="width:110px">
              <input type="number" data-nvmult="${p.id}" placeholder="×" min="0.1" step="0.1" style="width:65px" title="Multiplier">
              <input type="number" data-nvstock="${p.id}" placeholder="Stock" min="0" step="1" style="width:55px">
              <button class="btn sm" data-vadd="${p.id}" type="button"><i class="fas fa-plus"></i> Add</button>
            </div>
          </div>
        </div>
        <div class="pactions">
          <button class="btn sm" data-save="${p.id}" type="button"><i class="fas fa-floppy-disk"></i> Save</button>
          ${p.image ? `<button class="btn sec sm" data-rmimg="${p.id}" type="button" title="Remove photo"><i class="fas fa-trash"></i></button>` : ''}
        </div>
      </div>`).join('');
  }
  document.getElementById('pSearch').addEventListener('input', renderProducts);

  document.getElementById('prodList').addEventListener('click', async ev => {
    // Variant save
    const vsave = ev.target.closest('[data-vsave]');
    if (vsave) {
      const vid = Number(vsave.dataset.vsave);
      const label = document.querySelector(`[data-vlabel="${vid}"]`).value.trim();
      const mult = Number(document.querySelector(`[data-vmult="${vid}"]`).value);
      const stock = Number(document.querySelector(`[data-vstock="${vid}"]`).value);
      if (!label || !(mult > 0) || stock < 0) { toast('All fields required', false); return; }
      vsave.disabled = true;
      const j = await api('admin_variant_save', { vid, label, mult, stock });
      vsave.disabled = false;
      if (!j.ok) { toast(j.msg || 'Failed', false); return; }
      const p = PRODUCTS.find(x => x.id === Number(vsave.dataset.vpid));
      if (p) { const v = p.variants.find(v => v.id === vid); if (v) { v.label = label; v.mult = mult; v.stock = stock; } }
      toast('Variant saved', true);
      return;
    }
    // Variant delete
    const vdel = ev.target.closest('[data-vdel]');
    if (vdel) {
      const vid = Number(vdel.dataset.vdel);
      vdel.disabled = true;
      const j = await api('admin_variant_delete', { vid });
      vdel.disabled = false;
      if (!j.ok) { toast(j.msg || 'Failed', false); return; }
      for (const p of PRODUCTS) { p.variants = p.variants.filter(v => v.id !== vid); }
      renderProducts();
      toast('Variant deleted', true);
      return;
    }
    // Variant add
    const vadd = ev.target.closest('[data-vadd]');
    if (vadd) {
      const pid = Number(vadd.dataset.vadd);
      const label = document.querySelector(`[data-nvlabel="${pid}"]`).value.trim();
      const mult = Number(document.querySelector(`[data-nvmult="${pid}"]`).value) || 1;
      const stock = Number(document.querySelector(`[data-nvstock="${pid}"]`).value) || 0;
      if (!label) { toast('Label required', false); return; }
      vadd.disabled = true;
      const j = await api('admin_variant_add', { pid, label, mult, stock });
      vadd.disabled = false;
      if (!j.ok) { toast(j.msg || 'Failed', false); return; }
      const p = PRODUCTS.find(x => x.id === pid);
      if (p) p.variants.push({ id: Number(j.vid), label, mult, stock });
      renderProducts();
      toast('Variant added', true);
      return;
    }
    const save = ev.target.closest('[data-save]');
    if (save) {
      const id = Number(save.dataset.save);
      const p = PRODUCTS.find(x => x.id === id);
      const name = document.querySelector(`[data-name="${id}"]`).value.trim();
      const price = Number(document.querySelector(`[data-price="${id}"]`).value);
      if (!name || !(price >= 0)) { toast('Name & price required', false); return; }
      save.disabled = true;
      const j = await api('admin_product_save', { id, name, price });
      save.disabled = false;
      if (!j.ok) { toast(j.msg || 'Failed', false); return; }
      p.name = name; p.price = price;
      toast('Saved: ' + name, true);
      return;
    }
    const rm = ev.target.closest('[data-rmimg]');
    if (rm) {
      const id = Number(rm.dataset.rmimg);
      rm.disabled = true;
      const fd = new FormData(); fd.append('id', id);
      const j = await upload('admin_product_image', fd);
      rm.disabled = false;
      if (!j.ok) { toast(j.msg || 'Failed', false); return; }
      PRODUCTS.find(x => x.id === id).image = '';
      renderProducts(); toast('Photo removed', true);
    }
  });

  document.getElementById('prodList').addEventListener('change', async ev => {
    const inp = ev.target.closest('[data-img]');
    if (!inp || !inp.files || !inp.files[0]) return;
    const id = Number(inp.dataset.img);
    const fd = new FormData();
    fd.append('id', id);
    fd.append('image', inp.files[0]);
    toast('Uploading photo...', true);
    const j = await upload('admin_product_image', fd);
    if (!j.ok) { toast(j.msg || 'Upload failed', false); return; }
    PRODUCTS.find(x => x.id === id).image = j.img;
    renderProducts();
    toast('Photo updated', true);
  });

  /* ---------- payment ---------- */
  document.getElementById('paySave').addEventListener('click', async function () {
    this.disabled = true;
    const j = await api('admin_pay_save', {
      binance: document.getElementById('payBinance').value.trim(),
      merchant: document.getElementById('payMerchant').value.trim(),
      seller: document.getElementById('paySeller').value.trim()
    });
    this.disabled = false;
    toast(j.ok ? 'Payment details saved' : (j.msg || 'Failed'), j.ok);
  });

  /* ---------- password ---------- */
  document.getElementById('passSave').addEventListener('click', async function () {
    const p = document.getElementById('newPass').value;
    if (p.length < 6) { toast('Min 6 characters', false); return; }
    this.disabled = true;
    const j = await api('admin_pass_save', { pass: p });
    this.disabled = false;
    if (j.ok) { document.getElementById('newPass').value = ''; toast('Password changed', true); }
    else toast(j.msg || 'Failed', false);
  });

  /* ---------- tables ---------- */
  function badge(s) {
    const cls = ['approved', 'delivered', 'pending', 'rejected', 'cancelled', 'processing'].includes(s) ? s : 'other';
    return `<span class="badge ${cls}">${esc(s)}</span>`;
  }
  function renderDeps(list) {
    const tb = document.querySelector('#depTbl tbody');
    if (!list.length) { tb.innerHTML = '<tr><td colspan="8" class="empty">No deposits yet</td></tr>'; return; }
    tb.innerHTML = list.map(d => `<tr>
      <td>${esc(d.date)}</td><td class="trunc" title="${esc(d.email)}">${esc(d.email)}</td><td><b>${esc(d.code)}</b></td>
      <td><b>${money(d.amount)}</b></td><td>${esc(d.method)}</td><td class="trunc" title="${esc(d.trx)}">${esc(d.trx || '—')}</td>
      <td>${badge(d.status)}</td>
      <td>${d.status === 'pending'
        ? `<button class="btn ok sm" data-depok="${d.id}"><i class="fas fa-check"></i> Approve</button>
           <button class="btn bad sm" data-depno="${d.id}"><i class="fas fa-xmark"></i></button>`
        : ''}</td></tr>`).join('');
  }
  function renderOrds(list) {
    const tb = document.querySelector('#ordTbl tbody');
    if (!list.length) { tb.innerHTML = '<tr><td colspan="8" class="empty">No orders yet</td></tr>'; return; }
    tb.innerHTML = list.map(o => `<tr>
      <td>${esc(o.date)}</td><td class="trunc" title="${esc(o.email)}">${esc(o.email)}</td><td><b>${esc(o.code)}</b></td>
      <td class="trunc" title="${esc(o.product)}">${esc(o.product)}${o.variant ? ' · ' + esc(o.variant) : ''}</td>
      <td><b>${money(o.amount)}</b></td><td>${badge(o.status)}</td>
      <td>${o.key ? '<code>' + esc(o.key) + '</code>' : '—'}</td>
      <td>${o.status !== 'delivered' ? `<button class="btn ok sm" data-ordok="${o.id}"><i class="fas fa-key"></i> ${o.status === 'processing' ? 'Retry' : 'Deliver'}</button>` : ''}</td>
    </tr>`).join('');
  }
  document.addEventListener('click', async ev => {
    const a = ev.target.closest('[data-depok],[data-depno],[data-ordok]');
    if (!a) return;
    a.disabled = true;
    if (a.dataset.depok) {
      const j = await api('admin_deposit_approve', { id: Number(a.dataset.depok) });
      toast(j.msg || (j.ok ? 'Approved' : 'Failed'), j.ok);
      if (j.ok) load();
    } else if (a.dataset.depno) {
      const j = await api('admin_deposit_reject', { id: Number(a.dataset.depno) });
      toast(j.msg || (j.ok ? 'Rejected' : 'Failed'), j.ok);
      if (j.ok) load();
    } else {
      const j = await api('admin_order_approve', { id: Number(a.dataset.ordok) });
      toast(j.msg || (j.ok ? 'Delivered' : 'Failed'), j.ok);
      if (j.ok) load();
    }
  });

  /* ---------- license keys ---------- */
  let KEYS = { unused: 0, used: 0, list: [] };
  function renderKeys() {
    document.getElementById('kCount').textContent = KEYS.unused + ' unused · ' + KEYS.used + ' used';
    const tb = document.querySelector('#keyTbl tbody');
    if (!KEYS.list.length) { tb.innerHTML = '<tr><td colspan="6" class="empty">No keys in stock — paste keys above</td></tr>'; return; }
    tb.innerHTML = KEYS.list.map(k => `<tr>
      <td style="color:var(--text2)">${k.id}</td>
      <td><code>${esc(k.key)}</code></td>
      <td>${badge(k.status)}</td>
      <td>${k.order ? 'ORD#' + k.order : '—'}</td>
      <td style="color:var(--text2)">${esc(k.date)}</td>
      <td>${k.status === 'unused' ? `<button class="btn bad sm" data-keydel="${k.id}" type="button"><i class="fas fa-xmark"></i></button>` : ''}</td>
    </tr>`).join('');
  }
  document.getElementById('keyAdd').addEventListener('click', async function () {
    const raw = document.getElementById('keyInput').value.trim();
    if (!raw) { toast('Key paste koren first', false); return; }
    this.disabled = true;
    const j = await api('admin_keys_add', { keys: raw });
    this.disabled = false;
    if (!j.ok) { toast(j.msg || 'Failed', false); return; }
    KEYS = j.keys || KEYS;
    renderKeys();
    document.getElementById('keyInput').value = '';
    toast(j.msg, true);
  });
  document.getElementById('keyClear').addEventListener('click', () => { document.getElementById('keyInput').value = ''; });
  document.addEventListener('click', async ev => {
    const del = ev.target.closest('[data-keydel]');
    if (!del) return;
    del.disabled = true;
    const j = await api('admin_keys_del', { id: Number(del.dataset.keydel) });
    if (!j.ok) { toast(j.msg || 'Failed', false); return; }
    KEYS = j.keys || KEYS;
    renderKeys();
    toast('Key removed', true);
  });

  /* ---------- boot ---------- */
  async function load() {
    const j = await api('admin_state', {});
    if (!j.ok) { if (j.status === 401) location.reload(); return; }
    PRODUCTS = j.products || [];
    renderProducts();
    renderDeps(j.deposits || []);
    renderOrds(j.orders || []);
    if (j.keys) { KEYS = j.keys; renderKeys(); }
    if (j.pay) {
      document.getElementById('payBinance').value = j.pay.binance || '';
      document.getElementById('payMerchant').value = j.pay.merchant || '';
      document.getElementById('paySeller').value = j.pay.seller || '';
    }
  }
  window.__admLoad = load;
  load();
})();
</script>
</body>
</html>
