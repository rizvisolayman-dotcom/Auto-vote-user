const OWNER = 'Solayman X Cheat';

const BOOT = window.__BOOT__ || {};

const CATEGORIES = BOOT.categories || ['All'];
let PRODUCTS = BOOT.products || [];
const COUPONS = {};
const COUPON_MIN = {};
(function () {
  const c = BOOT.coupons || {};
  Object.keys(c).forEach(k => { COUPONS[k] = c[k].pct; COUPON_MIN[k] = c[k].min; });
})();

const API = {
  async req(url, data, _retry) {
    let r;
    try {
      r = await fetch(url, {
        method: data ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json', 'X-CSRF': BOOT.csrf || '' },
        credentials: 'same-origin',
        body: data ? JSON.stringify(data) : undefined
      });
    } catch (e) { return { ok: false, msg: 'Network error — server unreachable' }; }
    let j = null;
    try { j = await r.json(); }
    catch (e) { return { ok: false, status: r.status, msg: 'Server error (' + r.status + ')' }; }
    if (j && typeof j === 'object') j.status = r.status;
    if (j && j.status === 403 && !_retry) {
      const m = await this.me();
      if (m && m.ok && m.csrf) { BOOT.csrf = m.csrf; return this.req(url, data, true); }
    }
    return j;
  },
  me() { return this.req('auth.php?action=me'); },
  auth(action, data) { return this.req('auth.php?action=' + action, data); },
  call(action, data) { return this.req('api.php?action=' + action, data); },
  checkout(data) { return this.req('checkout.php', data); }
};

const _RAW_PRODUCTS = [
  { n: "AlphaRegedit iOS", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "ZenReg External IOS", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "PHANTOM MOD ANDROID+IOS", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "ST MOD ROOT", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "XYZ CHEATS APKMOD", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "Zrex android panel", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "DELTA PROXY IOS", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "SLIENT CHEATS PROXY", c: "ANDROID PROXY", p: 0.8, v: 1, i: "globe", t: ["PROXY", "APK"] },
  { n: "VEXNEX IOS IPA", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "Angry mod root", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "Zytron Root", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "Scorpion Mods Lite Root", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "Fluorite FF iOS", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "Fluorite MLBB IOS", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "Fluorite 8BP IOS", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "MIGUL PRO IOS FF", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "MIGUL BASIC IOS FF", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "MIGUL PRO IOS FF INDIA", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "Gbox Esign Cert", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "DRIP APKMOD", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "DRIP PROXY APK", c: "ANDROID PROXY", p: 0.8, v: 1, i: "globe", t: ["PROXY", "APK"] },
  { n: "DRIP WIRE ANDROID + IOS", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "DRIP ROOT APK", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "DRIP AIMKILL PC", c: "PC HACK", p: 0.8, v: 1, i: "desktop", t: ["PC", "MENU"] },
  { n: "Reaper X Pro Root", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "DRIP 8BP EZTEAM", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "GPT STREAMING PANEL", c: "PC HACK", p: 0.8, v: 1, i: "desktop", t: ["PC", "MENU"] },
  { n: "HG APKMOD", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "HG PROXY APK", c: "ANDROID PROXY", p: 0.8, v: 1, i: "globe", t: ["PROXY", "APK"] },
  { n: "HG PRIME PROXY", c: "ANDROID PROXY", p: 0.8, v: 1, i: "globe", t: ["PROXY", "APK"] },
  { n: "PRIME APKMOD", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "PATO BLUE APKMOD", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "PATO ORANGE APKMOD", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "PATO REGEDIT PROXY", c: "ANDROID PROXY", p: 0.8, v: 1, i: "globe", t: ["PROXY", "APK"] },
  { n: "BR MODS PC SILENT", c: "PC HACK", p: 0.8, v: 1, i: "desktop", t: ["PC", "MENU"] },
  { n: "BR MODS ROOT", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "Haxxcker Pro Root", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "Terminal x PC Aimkill", c: "PC HACK", p: 0.8, v: 1, i: "desktop", t: ["PC", "MENU"] },
  { n: "Terminal x PC Aimkill cover", c: "PC HACK", p: 0.8, v: 1, i: "desktop", t: ["PC", "MENU"] },
  { n: "Cloud CODM IOS", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "8ball IOS GBD", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "Pubg Zolo Android", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "Silent Cheats ModApk", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "SILENT CHEATS SAFE", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "SILENT CHEATS BRUTAL", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "Lk team Root+Pc", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "King iOS", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "Wingmod Root", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "WizardiOS 8bp", c: "IOS HACK", p: 0.8, v: 1, i: "apple", t: ["IOS", "PAID"] },
  { n: "VOLUME STEAMER PRO", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "Rapid Core Root", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "HEX BLADES ROOT", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "Aim Ai Engine Carrom Pool", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "Xreg Android + IOS", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "STRICKS BR ROOT", c: "ANDROID ROOT", p: 0.8, v: 1, i: "terminal", t: ["ROOT", "ANDROID"] },
  { n: "ABCD MODAPK", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] },
  { n: "GUILD GLORY BOT", c: "GUILD GLORY", p: 0.8, v: 1, i: "trophy", t: ["GUILD", "RANK"] },
  { n: "Bala Mod", c: "ANDROID", p: 0.8, v: 1, i: "android", t: ["ANDROID", "MOD"] }
];
if (!PRODUCTS.length && _RAW_PRODUCTS.length) PRODUCTS = _RAW_PRODUCTS;

const ICONS = {
  android: 'fa-brands fa-android',
  mobile: 'fa-solid fa-mobile-screen',
  globe: 'fa-solid fa-globe',
  terminal: 'fa-solid fa-terminal',
  trophy: 'fa-solid fa-trophy',
  apple: 'fa-brands fa-apple',
  desktop: 'fa-solid fa-desktop',
  'user-shield': 'fa-solid fa-user-shield'
};

const CAT_HUE = { 'ANDROID': '0deg', 'ANDROID PROXY': '60deg', 'ANDROID ROOT': '120deg', 'GUILD GLORY': '35deg', 'IOS HACK': '285deg', 'PC HACK': '195deg' };
function e(s){ return String(s===''?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

const store = {
  get(k, d) {
    try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; }
  },
  set(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
  },
  del(k) {
    try { localStorage.removeItem(k); } catch (e) {}
  }
};

function migrateKeys() {
  const map = {
    mxh_user: 'sxc_user', mxh_accounts: 'sxc_accounts', mxh_orders: 'sxc_orders',
    mxh_theme: 'sxc_theme', mxh_announce: 'sxc_announce'
  };
  try {
    Object.keys(map).forEach(k => {
      const v = localStorage.getItem(k);
      if (v !== null && localStorage.getItem(map[k]) === null) localStorage.setItem(map[k], v);
      localStorage.removeItem(k);
    });
  } catch (e) {}
}
migrateKeys();

function loadUser() { return BOOT.user || null; }

const state = {
  cat: 'All',
  product: null,
  variant: null,
  qty: 1,
  coupon: null,
  user: loadUser(),
  orders: [],
  deposits: [],
  demo: !!BOOT.demo,
  resetEmail: '',
  resetToken: '',
  resetLink: '',
  order: null,
  pay: 'binance',
  acctTab: 'purchases'
};

async function refreshMe() {
  try {
    const j = await API.call('me');
    if (j && j.ok) {
      state.user = j.user;
      state.orders = j.orders || [];
      state.deposits = j.deposits || [];
      state.demo = !!j.demo;
      if (j.csrf) BOOT.csrf = j.csrf;
    } else {
      state.user = null; state.orders = []; state.deposits = [];
    }
  } catch (e) {}
  syncHeader(); syncSignOut();
  return state.user;
}
function setSessionUser(u) {
  state.user = u;
  state.orders = []; state.deposits = [];
  syncHeader(); syncSignOut();
}

const money = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function monogram(name) {
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return 'SC';
}

/* ---------- catalog ---------- */
function renderTabs() {
  const el = document.getElementById('catTabs');
  el.innerHTML = CATEGORIES.map(c => `
    <button class="cat-tab ${c === state.cat ? 'active' : ''}" onclick="setCat('${c.replace(/'/g, "\\'")}')">
      <i class="${c === 'All' ? 'fa-solid fa-border-all' : 'fa-solid fa-folder'}"></i> ${c}
    </button>`).join('');
}

function setCat(c) {
  state.cat = c;
  renderTabs();
  renderCatalog();
  const t = document.querySelector('.section-title');
  if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function moneyBDT(usd){ return new Intl.NumberFormat('bn-BD',{style:'currency',currency:'BDT',minimumFractionDigits:0,maximumFractionDigits:0}).format(usd*122); }
function renderCatalog() {
  const cats = state.cat === 'All' ? CATEGORIES.slice(1) : [state.cat];
  document.getElementById('catalog').innerHTML = cats.map(cat => {
    const items = PRODUCTS.filter(p => p.c === cat);
    if (!items.length) return '';
    return `
      <section class="cat-section">
        <div class="cat-header">
          <div class="cat-header-line"></div>
          <div class="cat-header-text">${cat}</div>
          <div class="cat-header-line"></div>
        </div>
        <div class="products">
          ${items.map(p => {
            const idx = PRODUCTS.indexOf(p);
            const short = monogram(p.n);
            const bd = moneyBDT(p.p);
            const stock = p.variants.reduce((a,v)=>a+v.stock,0);
            const disc = p.disc || 0;
            const maint = p.maint || false;
            return `
            <article class="product">
              <div class="product-img-wrap" style="--ph:${CAT_HUE[cat] || '0deg'}">
                ${p.img ? `<img class="p-img" src="${p.img}" alt="${e(p.n)}" loading="lazy">` : `<span class="ph">${short}</span>`}
                ${disc>0?`<div class="product-badge"><span class="badge disc">-${disc}%</span></div>`:''}
                ${maint?`<div class="product-badge"><span class="badge maint">MAINTENANCE</span></div>`:''}
              </div>
              <div class="product-card-body">
                <div class="product-name" title="${e(p.n)}">${e(p.n)}</div>
                <div class="product-meta"><span>${stock} available</span>${p.v?'<span>Verified</span>':''}</div>
                <div class="product-tags">${p.t.map(t => `<span class="tag">${e(t)}</span>`).join('')}</div>
              </div>
              <div class="product-card-footer">
                <div class="product-price"><span class="bdt">${bd}</span><small>BDT</small></div>
                <button class="product-buy" onclick="openPurchase(${idx})">Buy Now</button>
              </div>
            </article>`;
          }).join('')}
        </div>
      </section>`;
  }).join('');
}

/* ---------- slider ---------- */
let slideIdx = 0, slideTimer;
function slides() { return [...document.querySelectorAll('.slide')]; }
function goSlide(i) {
  const s = slides();
  if (!s.length) return;
  slideIdx = (i + s.length) % s.length;
  s.forEach((el, k) => el.classList.toggle('active', k === slideIdx));
  document.querySelectorAll('.slider-dot').forEach((d, k) => d.classList.toggle('active', k === slideIdx));
}
function nextSlide() { goSlide(slideIdx + 1); restartAuto(); }
function prevSlide() { goSlide(slideIdx - 1); restartAuto(); }
function restartAuto() { clearInterval(slideTimer); slideTimer = setInterval(() => goSlide(slideIdx + 1), 5000); }
function initSlider() {
  const n = slides().length;
  document.getElementById('sliderDots').innerHTML =
    Array.from({ length: n }, (_, i) => `<div class="slider-dot ${i === 0 ? 'active' : ''}" onclick="goSlide(${i})"></div>`).join('');
  restartAuto();
}

/* ---------- modals ---------- */
function openModal(id) {
  const el = document.getElementById(id);
  el.classList.add('active');
  el._openedAt = Date.now();
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

/* ---------- purchase ---------- */
function openPurchase(idx) {
  state.product = PRODUCTS[idx];
  state.qty = 1;
  state.variant = null;
  state.coupon = null;
  state.order = null;
  document.getElementById('qtyInput').value = 1;
  document.getElementById('couponInput').value = '';
  document.getElementById('couponMsg').textContent = '';
  document.getElementById('androidId').value = '';
  document.getElementById('trxId').value = '';
  document.getElementById('trxFrom').value = '';
  document.getElementById('payConfirm').checked = false;
  document.getElementById('payShot').value = '';
  document.getElementById('fileName').textContent = 'Choose screenshot';
  document.getElementById('shotPreview').style.display = 'none';
  document.getElementById('payErr').style.display = 'none';
  document.querySelector('input[name="keytype"][value="direct"]').checked = true;
  syncKeyType();
  setPay('binance');

  const base = state.product.p;
  const variants = state.product.variants || [];
  state.variant = null;
  document.getElementById('variantSelect').innerHTML =
    '<option value="">-- Choose Variant --</option>' +
    variants.map(v => `<option value="${v.mult}" data-vid="${v.id}" data-label="${v.label}" data-stock="${v.stock}">${v.label} — ${money(base * v.mult)}</option>`).join('');
  document.getElementById('variantInfo').classList.remove('show');
  const vsel = document.getElementById('variantSelect');
  const firstOk = variants.findIndex(v => (Number(v.stock) || 0) > 0);
  if (firstOk >= 0) { vsel.selectedIndex = firstOk + 1; vsel.dispatchEvent(new Event('change')); }
  setStep1Next(true);

  gotoStep(1);
  openModal('purchaseOverlay');
}

function stockText(s) {
  if (s <= 0) return 'Out of stock';
  if (s >= 999) return 'In stock — unlimited';
  if (s <= 3) return 'Only ' + s + ' left in stock';
  return 'In stock: ' + s + ' available';
}
function setStep1Next(on) {
  const b = document.getElementById('step1Next');
  if (!b) return;
  b.disabled = !on;
  b.classList.toggle('is-off', !on);
  b.innerHTML = on ? 'Continue <i class="fas fa-arrow-right"></i>' : '<i class="fas fa-ban"></i> Out of stock';
}
function selectVariant() {
  const sel = document.getElementById('variantSelect');
  if (!sel.value) {
    state.variant = null;
    document.getElementById('variantInfo').classList.remove('show');
    setStep1Next(true);
    return;
  }
  const opt = sel.selectedOptions[0];
  const stock = Number(opt.dataset.stock) || 0;
  state.variant = { vid: Number(opt.dataset.vid) || 0, mult: Number(opt.value), label: opt.dataset.label, stock };
  document.getElementById('selVariantName').textContent = state.variant.label;
  document.getElementById('selVariantStock').textContent = stockText(stock);
  document.getElementById('selVariantPrice').textContent = money(state.product.p * state.variant.mult);
  document.getElementById('variantInfo').classList.add('show');
  const max = Math.max(1, Math.min(50, stock || 50));
  const inp = document.getElementById('qtyInput');
  inp.max = max;
  if (state.qty > max) { state.qty = max; inp.value = max; updateTotals(); }
  setStep1Next(stock > 0);
}

function changeQty(d) {
  const inp = document.getElementById('qtyInput');
  const cap = Math.min(50, Number(inp.max) || 50);
  state.qty = Math.min(cap, Math.max(1, state.qty + d));
  inp.value = state.qty;
  updateTotals();
}

function gotoStep(n) {
  if (n > 1 && !state.variant) {
    const sel = document.getElementById('variantSelect');
    if (!sel.value) { toast('Please choose a variant first', 'err'); sel.focus(); return; }
    state.variant = { vid: Number(sel.selectedOptions[0].dataset.vid) || 0, mult: Number(sel.value), label: sel.selectedOptions[0].dataset.label, stock: Number(sel.selectedOptions[0].dataset.stock) || 0 };
  }
  if (n > 1 && state.variant && state.variant.stock <= 0) { toast('This variant is out of stock', 'err'); return; }
  if (n > 2 && !state.user) n = 2;
  if (n > 4 && !state.order) n = 3;
  if (n === 3 && document.querySelector('input[name="keytype"]:checked').value === 'device') {
    const aid = document.getElementById('androidId').value.trim();
    if (aid.length < 8) { toast('Enter a valid Android ID', 'err'); document.getElementById('androidId').focus(); return; }
  }

  document.querySelectorAll('.step-panel').forEach(p => p.classList.toggle('active', Number(p.dataset.panel) === n));
  document.querySelectorAll('.step-dot').forEach(d => {
    const s = Number(d.dataset.step);
    d.classList.toggle('active', s === n);
    d.classList.toggle('done', s < n);
  });
  document.querySelectorAll('.step-line').forEach(l => {
    l.classList.toggle('done', Number(l.dataset.line) < n);
  });

  if (n === 2) {
    document.querySelector('.account-required').style.display = state.user ? 'none' : 'block';
    document.getElementById('loggedInBox').style.display = state.user ? 'block' : 'none';
    if (state.user) {
      document.getElementById('custName').textContent = state.user.name || state.user.email;
      document.getElementById('custEmail').textContent = state.user.email;
      document.getElementById('custPhone').textContent = state.user.phone || '—';
      document.getElementById('custPhoneRow').style.display = state.user.phone ? 'flex' : 'none';
    }
  }
  if (n === 3) { refreshPayGateways(); updateTotals(); }
  if (n === 4) {
    updateTotals();
    const total = currentTotal();
    const binance = state.pay !== 'balance';
    document.getElementById('binancePayBox').style.display = binance ? 'block' : 'none';
    document.getElementById('balancePayBox').style.display = binance ? 'none' : 'block';
    if (binance) {
      document.getElementById('payAmount').textContent = money(total);
      document.getElementById('payErr').style.display = 'none';
      setTimeout(() => document.getElementById('trxId').focus(), 80);
    } else {
      const bal = balance();
      document.getElementById('balCur').textContent = money(bal);
      document.getElementById('balDue').textContent = money(total);
      document.getElementById('balAfter').textContent = money(Math.max(0, bal - total));
      document.getElementById('balShort').style.display = bal < total ? 'block' : 'none';
      document.getElementById('balErr').style.display = 'none';
      document.getElementById('balConfirm').checked = false;
      setTimeout(() => document.getElementById('balConfirm').focus(), 80);
    }
  }
  if (n === 5) fillOrderDone();
}

function currentTotal() {
  const sub = currentLineTotal();
  const disc = state.coupon ? sub * (COUPONS[state.coupon] / 100) : 0;
  return Math.max(0, sub - disc);
}

function refreshPayGateways() {
  const card = document.getElementById('payCardBalance');
  const hint = document.getElementById('balPayHint');
  const bal = balance();
  const total = currentTotal();
  const can = !!state.user;
  card.classList.toggle('disabled', !can);
  hint.textContent = !can
    ? 'Sign in to use your balance'
    : (bal >= total && total > 0
        ? 'Balance: ' + money(bal) + ' · instant delivery'
        : 'Balance: ' + money(bal) + ' · not enough for this order');
  if (!can && state.pay === 'balance') setPay('binance');
  if (can && state.pay === 'balance' && bal < total) {
    hint.textContent = 'Balance ' + money(bal) + ' is less than ' + money(total);
  }
}

function setPay(method) {
  if (method === 'balance' && !state.user) { toast('Please login to use your balance', 'err'); return; }
  state.pay = method;
  document.querySelectorAll('input[name="pay"]').forEach(r => { r.checked = r.value === method; });
  document.getElementById('payCardBinance').classList.toggle('selected', method === 'binance');
  document.getElementById('payCardBalance').classList.toggle('selected', method === 'balance');
}

function currentLineTotal() {
  if (!state.product || !state.variant) return 0;
  return state.product.p * state.variant.mult * state.qty;
}

function updateTotals() {
  const sub = currentLineTotal();
  const disc = state.coupon ? sub * (COUPONS[state.coupon] / 100) : 0;
  document.getElementById('sumItem').textContent = state.product
    ? `${state.product.n} · ${state.variant ? state.variant.label : ''}` : '—';
  document.getElementById('sumQty').textContent = state.qty;
  document.getElementById('sumDisc').textContent = '-' + money(disc);
  document.getElementById('discRow').style.display = disc ? 'flex' : 'none';
  document.getElementById('sumTotal').textContent = money(sub - disc);
}

function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  const msg = document.getElementById('couponMsg');
  if (!code) { state.coupon = null; msg.textContent = ''; updateTotals(); return; }
  if (COUPONS[code]) {
    const min = COUPON_MIN[code] || 0;
    const sub = currentLineTotal();
    if (min && sub < min) {
      state.coupon = null;
      msg.innerHTML = '<i class="fas fa-times"></i> Minimum order ' + money(min) + ' required for this coupon';
      msg.style.color = 'var(--danger)';
      updateTotals();
      return;
    }
    state.coupon = code;
    msg.innerHTML = '<i class="fas fa-check"></i> Coupon applied — ' + COUPONS[code] + '% off';
    msg.style.color = 'var(--success)';
    toast(`Coupon ${code} applied`, 'ok');
  } else {
    state.coupon = null;
    msg.textContent = 'Invalid coupon code';
    msg.style.color = 'var(--danger)';
  }
  updateTotals();
}

function copyEl(id, msg) {
  const el = document.getElementById(id);
  const text = (el.textContent || '').trim();
  if (!text) return;
  const done = () => toast(msg || 'Copied', 'ok');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(el, done));
  } else fallbackCopy(el, done);
}

const Orders = {
  all() { return state.orders || []; },
  get(code) { return this.all().find(o => o.code === code) || null; }
};

/* wallet now server-backed (see refreshMe) */
function balance() {
  return state.user ? (Number(state.user.balance) || 0) : 0;
}

function parseAmount(txt) {
  const n = Number(String(txt || '').replace(/[^0-9.]/g, ''));
  return isFinite(n) ? n : 0;
}

function submitPayment() {
  if (!state.user) { toast('Please login first', 'err'); gotoStep(2); return; }
  const errBox = document.getElementById('payErr');
  const trx = document.getElementById('trxId').value.trim();
  const from = document.getElementById('trxFrom').value.trim();
  const shot = document.getElementById('payShot').files[0];
  const confirmed = document.getElementById('payConfirm').checked;
  const fail = m => { fieldErr('payErr', m); return false; };

  fieldErrOff('payErr');
  if (trx.length < 8 || !/[a-z0-9]/i.test(trx)) return fail('Enter the Transaction ID (TrxID) from your Binance payment — at least 8 characters.');
  if (shot && shot.size > 3 * 1024 * 1024) return fail('Screenshot must be smaller than 3 MB.');
  if (!confirmed) return fail('Please confirm that you have sent the payment.');

  const btn = document.getElementById('paySubmitBtn');
  busy(btn, true);
  API.checkout({
    product_id: state.product.id,
    variant_id: state.variant.vid,
    qty: state.qty,
    coupon: state.coupon || '',
    method: 'binance',
    keytype: document.querySelector('input[name="keytype"]:checked').value,
    android_id: document.getElementById('androidId').value.trim(),
    trx, from_id: from, shot: shot ? shot.name : ''
  }).then(j => {
    busy(btn, false);
    if (!j.ok) { fail(j.msg || 'Could not place the order'); return; }
    state.order = {
      code: j.code,
      product: state.product ? state.product.n : '—',
      variant: state.variant ? state.variant.label : '—',
      qty: state.qty,
      amount: money(j.amount),
      trx, from, status: 'pending', key: '', created: Date.now()
    };
    refreshMe();
    gotoStep(5);
    toast('Payment submitted · ' + j.code, 'ok');
  });
  return true;
}

function fillOrderDone() {
  const o = state.order;
  if (!o) return;
  document.getElementById('orderCode').textContent = o.code;
  document.getElementById('ordProduct').textContent = o.product;
  document.getElementById('ordVariant').textContent = o.variant;
  document.getElementById('ordQty').textContent = o.qty;
  document.getElementById('ordAmount').textContent = o.amount;
  document.getElementById('ordTrx').textContent = o.trx;
  const keyRow = document.getElementById('ordKeyRow');
  keyRow.style.display = o.key ? 'flex' : 'none';
  if (o.key) document.getElementById('ordKey').textContent = o.key;
  const badge = document.getElementById('ordStatus');
  badge.textContent = statusLabel(o.status);
  badge.className = 'badge ' + statusClass(o.status);
  const done = o.status === 'delivered';
  const proc = o.status === 'processing';
  document.getElementById('doneTitle').textContent = done ? 'Order Delivered' : proc ? 'Key Generating' : 'Payment Submitted';
  document.getElementById('doneSub').textContent = done
    ? 'Your balance payment was verified instantly. Keep this order code.'
    : proc ? 'Balance payment done — license key toiri hocche. Ektu por orders-e auto asbe.'
    : 'Your payment is queued for verification. Keep this order code.';
  document.getElementById('doneIcon').className = done ? 'fas fa-circle-check' : proc ? 'fas fa-gear fa-spin' : 'fas fa-hourglass-half';
  document.getElementById('doneHint').innerHTML = done
    ? '<i class="fas fa-bolt"></i> Paid from balance — the license key above is ready to use now.'
    : proc ? '<i class="fas fa-bolt"></i> Paid from balance — key usually arrives within 1 minute. Orders list khule dekhte paren.'
    : '<i class="fas fa-clock"></i> Delivery usually takes 5–30 minutes after the payment is verified.';
}

function payWithBalance() {
  if (!state.user) { toast('Please login first', 'err'); gotoStep(2); return; }
  const errBox = document.getElementById('balErr');
  const confirmed = document.getElementById('balConfirm').checked;
  const fail = m => { fieldErr('balErr', m); return false; };

  fieldErrOff('balErr');
  const total = currentTotal();
  const bal = balance();
  if (total <= 0 || !state.product) { toast('Something went wrong — start again', 'err'); return false; }
  if (bal < total) {
    fail('Your balance (' + money(bal) + ') is lower than the order total (' + money(total) + ').');
    return false;
  }
  if (!confirmed) return fail('Confirm that you want to pay from your balance.');

  const btn = document.getElementById('balPayBtn');
  busy(btn, true);
  API.checkout({
    product_id: state.product.id,
    variant_id: state.variant.vid,
    qty: state.qty,
    coupon: state.coupon || '',
    method: 'balance',
    keytype: document.querySelector('input[name="keytype"]:checked').value,
    android_id: document.getElementById('androidId').value.trim()
  }).then(j => {
    busy(btn, false);
    if (!j.ok) { fail(j.msg || 'Payment failed'); return; }
    if (j.balance !== undefined && state.user) state.user.balance = j.balance;
    state.order = {
      code: j.code,
      product: state.product ? state.product.n : '—',
      variant: state.variant ? state.variant.label : '—',
      qty: state.qty,
      amount: money(j.amount),
      trx: 'BALANCE', from: '', status: 'processing', key: '', created: Date.now()
    };
    refreshMe();
    syncHeader();
    gotoStep(5);
    toast('Paid from balance · key generate hocche…', 'ok');
  });
  return true;
}

function statusLabel(st) {
  if (st === 'delivered') return 'Delivered';
  if (st === 'approved') return 'Approved';
  if (st === 'processing') return 'Preparing key…';
  return 'Pending review';
}
function statusClass(st) {
  return st === 'delivered' || st === 'approved' ? 'badge-ok' : 'badge-pending';
}

async function openOrders() {
  await refreshMe();
  const list = Orders.all();
  const box = document.getElementById('ordersList');
  const empty = document.getElementById('ordersEmpty');
  empty.style.display = list.length ? 'none' : 'block';
  box.innerHTML = list.map(o => `
    <div class="order-card">
      <div class="order-card-top">
        <b>${o.code}</b><span class="badge ${statusClass(o.status)}">${statusLabel(o.status)}</span>
      </div>
      <div class="order-card-body">
        <div class="sum-row"><span>Item</span><b>${o.product} · ${o.variant} ×${o.qty}</b></div>
        <div class="sum-row"><span>Amount</span><b>${o.amount && String(o.amount).includes('$') ? o.amount : money(o.amount)}</b></div>
        <div class="sum-row"><span>TrxID</span><b>${o.trx || o.method || '—'}</b></div>
        <div class="sum-row"><span>Placed</span><b>${o.date || (o.created ? new Date(o.created).toLocaleString() : '—')}</b></div>
        ${o.key ? `<div class="sum-row"><span>License Key</span><b class="key-val">${o.key}</b></div>` : ''}
      </div>
      <div class="order-card-foot">
        ${o.status === 'pending'
          ? (state.demo ? `<button class="link-btn" type="button" onclick="demoApprove('${o.code}')"><i class="fas fa-wand-magic-sparkles"></i> Demo: approve this order</button>` : `<span class="hint" style="margin:0"><i class="fas fa-clock"></i> Awaiting payment verification</span>`)
          : o.status === 'processing'
          ? `<span class="hint" style="margin:0"><i class="fas fa-gear fa-spin"></i> Key generate hocche — ektu por asbe</span>`
          : `<button class="link-btn" type="button" onclick="copyText('${o.key}','Key copied')"><i class="far fa-copy"></i> Copy key</button>`}
      </div>
    </div>`).join('');
  openModal('ordersOverlay');
}

async function demoApprove(code) {
  const j = await API.call('order_approve', { code });
  if (!j.ok) { toast(j.msg || 'Could not approve', 'err'); return; }
  if (state.order && state.order.code === code) { state.order.status = 'processing'; state.order.key = ''; }
  await refreshMe();
  if (state.user) {
    const acctOpen = document.getElementById('accountOverlay').classList.contains('active');
    if (acctOpen) renderAccount(); else openOrders();
  }
  toast('Key generation started — auto-deliver', 'ok');
}

function copyText(text, msg) {
  const done = () => toast(msg || 'Copied', 'ok');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => toast('Copy failed', 'err'));
  else toast('Copy failed', 'err');
}

/* ---------- accounts (local, salted SHA-256) ---------- */
const normEmail = e => String(e || '').trim().toLowerCase();
const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
function fieldErr(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}
function fieldErrOff(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

function showCode(code) {
  document.getElementById('codeBig').textContent = code;
  openModal('codeOverlay');
}
function copyRecovery(fromModal) {
  const el = document.getElementById(fromModal ? 'codeBig' : 'recoveryCode');
  const text = (el.textContent || '').trim();
  if (!text || text === '\u2014') { toast('No recovery code to copy', 'err'); return; }
  const done = () => toast('Recovery code copied', 'ok');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(el, done));
  } else fallbackCopy(el, done);
}
function fallbackCopy(el, done) {
  try {
    const ta = document.createElement('textarea');
    ta.value = el.textContent;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    done();
  } catch (e) { toast('Copy failed — select the code manually', 'err'); }
}

/* ---------- account ---------- */
function openAccount(tab) {
  syncSignOut();
  if (state.user) {
    if (tab) state.acctTab = tab;
    renderAccount();
    showAcctTab(state.acctTab);
  } else showAuth('login');
  openModal('accountOverlay');
}
function syncSignOut() {
  const on = !!state.user;
  document.getElementById('acctDash').style.display = on ? 'block' : 'none';
  document.getElementById('signOutBar').style.display = on ? 'flex' : 'none';
  document.getElementById('authTabs').style.display = on ? 'none' : 'flex';
  document.querySelectorAll('.auth-panel').forEach(p => { p.style.display = on ? 'none' : ''; });
  const row = document.getElementById('codeRow');
  const code = on ? state.user.recovery_code : '';
  row.style.display = (on && code) ? 'flex' : 'none';
  if (on && code) document.getElementById('recoveryCode').textContent = code;
  if (on) document.getElementById('signOutEmail').textContent = state.user.email;
  if (on) renderAccount();
}
function showAcctTab(t) {
  state.acctTab = t || 'purchases';
  document.querySelectorAll('#acctTabs .tab').forEach(b => b.classList.toggle('active', b.dataset.atab === state.acctTab));
  document.querySelectorAll('.tab-content[data-atabc]').forEach(c => c.classList.toggle('active', c.dataset.atabc === state.acctTab));
}
function renderAccount() {
  if (!state.user) return;
  const email = state.user.email;
  const mine = Orders.all();
  const spent = mine
    .filter(o => o.status === 'delivered' || o.status === 'approved' || o.status === 'processing')
    .reduce((s, o) => s + parseAmount(o.amount), 0);

  document.getElementById('profAvatar').textContent = (state.user.name || email)[0].toUpperCase();
  document.getElementById('profName').textContent = state.user.name || email;
  document.getElementById('profEmail').textContent = email;
  const ph = document.getElementById('profPhone');
  ph.style.display = state.user.phone ? 'flex' : 'none';
  if (state.user.phone) ph.innerHTML = '<i class="fas fa-phone"></i> ' + state.user.phone;
  document.getElementById('stOrders').textContent = mine.length;
  document.getElementById('stSpent').textContent = money(spent);
  document.getElementById('stBal').textContent = money(balance());

  renderAcctOrders(mine);
  renderAcctDeps();
  showAcctTab(state.acctTab);
}
function renderAcctOrders(mine) {
  if (!mine) mine = Orders.all();
  const box = document.getElementById('acctOrders');
  const empty = document.getElementById('acctOrdersEmpty');
  empty.style.display = mine.length ? 'none' : 'block';
  box.style.display = mine.length ? 'flex' : 'none';
  box.innerHTML = mine.map(o => `
    <div class="order-card">
      <div class="order-card-top">
        <b>${o.code}</b><span class="badge ${statusClass(o.status)}">${statusLabel(o.status)}</span>
      </div>
      <div class="order-card-body">
        <div class="sum-row"><span>Item</span><b>${o.product} · ${o.variant} ×${o.qty}</b></div>
        <div class="sum-row"><span>Amount</span><b>${o.amount && String(o.amount).includes('$') ? o.amount : money(o.amount)}</b></div>
        <div class="sum-row"><span>Method</span><b>${(o.method === 'balance' || o.trx === 'BALANCE') ? 'Account Balance' : 'Binance Pay'}</b></div>
        <div class="sum-row"><span>Placed</span><b>${o.date || (o.created ? new Date(o.created).toLocaleString() : '—')}</b></div>
        ${o.key ? `<div class="sum-row"><span>License Key</span><b class="key-val">${o.key}</b></div>` : ''}
      </div>
      <div class="order-card-foot">
        ${o.status === 'pending'
          ? `<button class="link-btn" type="button" onclick="demoApprove('${o.code}')"><i class="fas fa-wand-magic-sparkles"></i> Demo: approve this order</button>`
          : o.status === 'processing'
          ? `<span class="hint" style="margin:0"><i class="fas fa-gear fa-spin"></i> Key generate hocche — ektu por asbe</span>`
          : `<button class="link-btn" type="button" onclick="copyText('${o.key}','Key copied')"><i class="far fa-copy"></i> Copy key</button>`}
      </div>
    </div>`).join('');
}
function renderAcctDeps() {
  const list = state.deposits || [];
  const box = document.getElementById('acctDeps');
  const empty = document.getElementById('acctDepsEmpty');
  empty.style.display = list.length ? 'none' : 'block';
  box.style.display = list.length ? 'flex' : 'none';
  box.innerHTML = list.map(d => `
    <div class="order-card">
      <div class="order-card-top">
        <b>${d.code}</b><span class="badge ${d.status === 'pending' ? 'badge-pending' : 'badge-ok'}">${d.status === 'pending' ? 'Pending review' : 'Credited'}</span>
      </div>
      <div class="order-card-body">
        <div class="sum-row"><span>Amount</span><b>${money(d.amount)}</b></div>
        <div class="sum-row"><span>Method</span><b>Binance Pay</b></div>
        <div class="sum-row"><span>TrxID</span><b>${d.trx || '—'}</b></div>
        <div class="sum-row"><span>Placed</span><b>${d.date || (d.created ? new Date(d.created).toLocaleString() : '—')}</b></div>
      </div>
      <div class="order-card-foot">
        ${d.status === 'pending'
          ? (state.demo ? `<button class="link-btn" type="button" onclick="demoApproveDep('${d.code}')"><i class="fas fa-wand-magic-sparkles"></i> Demo: approve this deposit</button>` : `<span class="hint" style="margin:0"><i class="fas fa-clock"></i> Awaiting review</span>`)
          : `<span class="hint" style="margin:0"><i class="fas fa-circle-check"></i> Added to balance</span>`}
      </div>
    </div>`).join('');
}
async function demoApproveDep(code) {
  if (!state.user) return;
  const j = await API.call('deposit_approve', { code });
  if (!j.ok) { toast(j.msg || 'Could not approve', 'err'); return; }
  if (j.balance !== undefined) state.user.balance = j.balance;
  await refreshMe();
  syncHeader();
  renderAccount();
  toast('Deposit ' + code + ' credited', 'ok');
}
function logout() {
  state.user = null;
  state.orders = []; state.deposits = [];
  syncHeader();
  syncSignOut();
  toast('Signed out', 'ok');
  closeModal('accountOverlay');
  if (document.getElementById('purchaseOverlay').classList.contains('active')) gotoStep(2);
  API.auth('logout', {}).then(() => API.me()).then(j => {
    if (j && j.ok && j.csrf) BOOT.csrf = j.csrf;
  }).catch(() => {});
}
function showAuth(which) {
  fieldErrOff('loginErr'); fieldErrOff('regErr');
  fieldErrOff('resetErr1'); fieldErrOff('resetErr3');
  if (state.user) { syncSignOut(); return; }
  document.querySelectorAll('#authTabs button').forEach(b => b.classList.toggle('active', b.dataset.auth === which));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.toggle('active', p.dataset.authPanel === which));
}
function saveUser(user, msg) {
  setSessionUser(user);
  toast(msg || ('Welcome, ' + (user.name || user.email)), 'ok');
}
function doLogin(e) {
  e.preventDefault();
  const email = normEmail(document.getElementById('loginEmail').value);
  const pass = document.getElementById('loginPass').value;
  fieldErrOff('loginErr');
  if (!validEmail(email)) { fieldErr('loginErr', 'Enter a valid email address'); return false; }
  const btn = e.target.querySelector('button[type="submit"]');
  busy(btn, true);
  API.auth('login', { email, password: pass }).then(j => {
    busy(btn, false);
    if (!j.ok) { fieldErr('loginErr', j.msg || 'Login failed'); return; }
    saveUser(j.user, j.msg);
    document.getElementById('loginPass').value = '';
    closeModal('accountOverlay');
    if (document.getElementById('purchaseOverlay').classList.contains('active')) gotoStep(2);
  });
  return false;
}
function doRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = normEmail(document.getElementById('regEmail').value);
  const phone = document.getElementById('regPhone').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  fieldErrOff('regErr');
  if (!name) { fieldErr('regErr', 'Enter your name'); return false; }
  if (pass.length < 6) { fieldErr('regErr', 'Password must be at least 6 characters'); return false; }
  if (pass !== pass2) { fieldErr('regErr', 'Passwords do not match'); return false; }
  const btn = e.target.querySelector('button[type="submit"]');
  busy(btn, true);
  API.auth('register', { name, email, phone, password: pass }).then(j => {
    busy(btn, false);
    if (!j.ok) {
      if (j.status === 409 || /already exists/i.test(j.msg || '')) {
        showAuth('login');
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPass').value = '';
        fieldErr('loginErr', j.msg);
      } else fieldErr('regErr', j.msg || 'Could not create the account');
      return;
    }
    saveUser(j.user, j.msg);
    document.getElementById('regPass').value = '';
    document.getElementById('regPass2').value = '';
    closeModal('accountOverlay');
    if (j.user && j.user.recovery_code) showCode(j.user.recovery_code);
  });
  return false;
}
function resetStep1(e) {
  e.preventDefault();
  const email = normEmail(document.getElementById('forgotEmail').value);
  fieldErrOff('resetErr1');
  if (!validEmail(email)) { fieldErr('resetErr1', 'Enter a valid email address'); return false; }
  const btn = e.target.querySelector('button[type="submit"]');
  busy(btn, true);
  API.auth('forgot', { email }).then(j => {
    busy(btn, false);
    if (!j.ok) { fieldErr('resetErr1', j.msg || 'Could not send the link'); return; }
    state.resetEmail = email;
    state.resetLink = j.dev_link || '';
    document.getElementById('resetWho').textContent = email;
    document.getElementById('resetWho2').textContent = email;
    document.getElementById('resetLinkBox').textContent = state.resetLink || '—';
    showAuth('forgot2');
    toast(j.msg, 'ok');
  });
  return false;
}
function copyResetLink() {
  const link = state.resetLink || (document.getElementById('resetLinkBox').textContent || '').trim();
  if (!link || link === '—') { toast('Reset link was emailed — check your inbox', 'err'); return; }
  copyText(link, 'Reset link copied');
}
function openResetLink() {
  const link = state.resetLink || (document.getElementById('resetLinkBox').textContent || '').trim();
  if (!link || link === '—') { toast('Reset link was emailed — check your inbox', 'err'); return; }
  location.href = link;
}
function applyResetBoot() {
  if (BOOT.reset_err) {
    if (state.user) { API.auth('logout', {}); state.user = null; state.orders = []; state.deposits = []; syncHeader(); syncSignOut(); }
    if (!document.getElementById('accountOverlay').classList.contains('active')) openModal('accountOverlay');
    showAuth('forgot1');
    fieldErr('resetErr1', BOOT.reset_err);
    toast(BOOT.reset_err, 'err');
    return false;
  }
  if (!BOOT.reset || !BOOT.reset.email) return false;
  if (state.user) { API.auth('logout', {}); state.user = null; state.orders = []; state.deposits = []; syncHeader(); syncSignOut(); }
  state.resetEmail = BOOT.reset.email;
  state.resetToken = BOOT.reset.token;
  document.getElementById('resetWho').textContent = BOOT.reset.email;
  document.getElementById('forgotEmail').value = BOOT.reset.email;
  if (!document.getElementById('accountOverlay').classList.contains('active')) openModal('accountOverlay');
  showAuth('forgot3');
  toast('Link verified — set a new password', 'ok');
  setTimeout(() => document.getElementById('newPass').focus(), 140);
  return true;
}
function resetStep3(e) {
  e.preventDefault();
  const pass = document.getElementById('newPass').value;
  const pass2 = document.getElementById('newPass2').value;
  fieldErrOff('resetErr3');
  if (pass.length < 6) { fieldErr('resetErr3', 'Password must be at least 6 characters'); return false; }
  if (pass !== pass2) { fieldErr('resetErr3', 'Passwords do not match'); return false; }
  const btn = e.target.querySelector('button[type="submit"]');
  busy(btn, true);
  API.auth('reset', { token: state.resetToken, password: pass }).then(j => {
    busy(btn, false);
    if (!j.ok) { fieldErr('resetErr3', j.msg || 'Reset failed'); return; }
    document.getElementById('newPass').value = '';
    document.getElementById('newPass2').value = '';
    showAuth('login');
    document.getElementById('loginEmail').value = state.resetEmail;
    document.getElementById('loginPass').value = '';
    toast(j.msg, 'ok');
    try {
      const u = new URL(location.href);
      if (u.searchParams.has('reset')) { u.searchParams.delete('reset'); history.replaceState(null, '', u.pathname + u.search); }
    } catch (e2) {}
  });
  return false;
}
function showGoogleStep(n) {
  document.querySelectorAll('[data-gstep]').forEach(p => p.classList.toggle('active', Number(p.dataset.gstep) === n));
}
function googleAuth() {
  document.getElementById('gEmail').value = '';
  document.getElementById('gPass').value = '';
  document.getElementById('gErr1').style.display = 'none';
  document.getElementById('gErr2').style.display = 'none';
  showGoogleStep(1);
  openModal('googleOverlay');
  setTimeout(() => document.getElementById('gEmail').focus(), 120);
}
function googleErr(id, msg) {
  const e = document.getElementById(id);
  e.textContent = msg;
  e.style.display = 'block';
}
function googleStep1() {
  const inp = document.getElementById('gEmail');
  let v = inp.value.trim();
  if (!v) { googleErr('gErr1', 'Enter an email address'); return inp.focus(); }
  if (!v.includes('@')) v += '@gmail.com';
  if (!validEmail(v)) { googleErr('gErr1', 'Enter a valid email address'); return inp.focus(); }
  inp.value = v;
  document.getElementById('gErr1').style.display = 'none';
  const name = v.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  document.getElementById('gMail').textContent = v;
  document.getElementById('gGreet').textContent = 'Hi ' + name;
  document.getElementById('gAvatar').textContent = (name[0] || 'M').toUpperCase();
  document.getElementById('gPass').value = '';
  document.getElementById('gErr2').style.display = 'none';
  showGoogleStep(2);
  setTimeout(() => document.getElementById('gPass').focus(), 80);
}
function googleBack() { showGoogleStep(1); document.getElementById('gEmail').focus(); }
function googleStep2() {
  const pass = document.getElementById('gPass').value;
  if (!pass) { googleErr('gErr2', 'Enter your password'); return document.getElementById('gPass').focus(); }
  const email = normEmail(document.getElementById('gEmail').value);
  const btn = document.querySelector('[data-gstep="2"] .g-next');
  busy(btn, true);
  API.auth('login', { email, password: pass }).then(async j => {
    if (j.ok) {
      busy(btn, false);
      closeModal('googleOverlay');
      closeModal('accountOverlay');
      saveUser(j.user, j.msg);
      return;
    }
    const name = document.getElementById('gGreet').textContent.replace(/^Hi\s*/, '') || email.split('@')[0];
    const r = await API.auth('register', { email, name, phone: '', password: pass });
    busy(btn, false);
    if (!r.ok) { googleErr('gErr2', r.msg || 'Could not sign in'); return; }
    closeModal('googleOverlay');
    closeModal('accountOverlay');
    saveUser(r.user, r.msg);
    if (r.user && r.user.recovery_code) showCode(r.user.recovery_code);
  });
}

/* ---------- video / howto / legal ---------- */
function openTutorial(kind, name) {
  const binance = kind === 'binance';
  document.getElementById('videoTitle').textContent = binance
    ? 'How to pay with Binance Pay'
    : (name ? name + ' — Demo Video' : 'Demo Video');
  document.getElementById('videoFrame').src = (binance
    ? 'https://www.youtube.com/embed/XhPS81ADeYE?autoplay=1&rel=0'
    : 'https://www.youtube.com/embed/3tFzqnpdpJs?autoplay=1&rel=0');
  openModal('videoOverlay');
}
function closeTutorial() {
  document.getElementById('videoFrame').src = '';
  closeModal('videoOverlay');
}
function openHowToBuy() { openModal('howtoOverlay'); }

const LEGAL = {
  privacy: {
    t: 'Privacy Policy',
    b: `<p>We only collect the information needed to deliver your order: your email address, name, phone number and (for device-bound keys) the Android ID you provide.</p>
        <h5>What we store</h5><p>Account details, order history and support messages. Payment is handled by Binance Pay — we never see or store your card or wallet credentials.</p>
        <h5>What we never do</h5><p>We do not sell, rent or share your personal data with third parties for marketing purposes.</p>
        <h5>Cookies</h5><p>We use local storage to keep you signed in and to remember your theme preference.</p>
        <h5>Contact</h5><p>Reach ${OWNER} any time through our Telegram channel for data deletion requests.</p>`
  },
  terms: {
    t: 'Terms of Service',
    b: `<h5>1. Digital delivery</h5><p>All products are digital license keys. Delivery is automatic and usually completes within seconds of a confirmed payment.</p>
        <h5>2. Refunds</h5><p>Because keys are delivered instantly, sales are final once a key is revealed, except where a key is proven non-working and support confirms it.</p>
        <h5>3. Responsible use</h5><p>You are responsible for how you use your license. We do not support misuse of third-party platforms or services.</p>
        <h5>4. Availability</h5><p>Stock, pricing and variant durations may change without prior notice.</p>
        <h5>5. Support</h5><p>Support is provided 24/7 through Telegram — message ${OWNER} directly. Include your order ID in every message.</p>`
  }
};
function openLegal(which) {
  const l = LEGAL[which];
  document.getElementById('legalTitle').textContent = l.t;
  document.getElementById('legalBody').innerHTML = l.b;
  openModal('legalOverlay');
}

/* ---------- header user menu ---------- */
function toggleUserMenu() {
  document.getElementById('userMenu').classList.toggle('open');
  document.getElementById('userBtn').setAttribute('aria-expanded', document.getElementById('userMenu').classList.contains('open'));
}
function closeUserMenu() {
  document.getElementById('userMenu').classList.remove('open');
  document.getElementById('userBtn').setAttribute('aria-expanded', 'false');
}
function syncHeader() {
  const on = !!state.user;
  const name = on ? (state.user.name || state.user.email) : 'Account';
  document.getElementById('userBtnLabel').textContent = name;
  document.getElementById('userAvatar').innerHTML = on
    ? name.charAt(0).toUpperCase()
    : '<i class="fas fa-user"></i>';
  document.getElementById('ddName').textContent = on ? state.user.name || state.user.email : 'Guest';
  document.getElementById('ddEmail').textContent = on ? state.user.email : 'Not signed in';
  document.getElementById('ddPrivate').style.display = on ? 'block' : 'none';
  document.getElementById('ddAuth').style.display = on ? 'none' : 'flex';
  document.getElementById('ddBalVal').textContent = money(balance());
}

/* ---------- add balance ---------- */
function balStep(n) {
  document.querySelectorAll('.bal-step').forEach(p => p.classList.toggle('active', Number(p.dataset.balstep) === n));
}
function openBalance() {
  if (!state.user) {
    closeUserMenu();
    openAccount();
    toast('Login to add balance', 'err');
    return;
  }
  balStep(1);
  document.getElementById('balNow').textContent = money(balance());
  document.getElementById('amtErr').style.display = 'none';
  document.getElementById('depErr').style.display = 'none';
  document.getElementById('depTrx').value = '';
  document.getElementById('depConfirm').checked = false;
  openModal('balanceOverlay');
}
function setAmount(v) {
  document.getElementById('amtInput').value = v;
  document.querySelectorAll('.amt-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.amt) === Number(v)));
}
function startDeposit() {
  const inp = document.getElementById('amtInput');
  const amt = Math.round(Number(inp.value));
  const err = document.getElementById('amtErr');
  err.style.display = 'none';
  if (!isFinite(amt) || amt < 2) { err.textContent = 'Minimum deposit is $2.00'; err.style.display = 'block'; return; }
  if (amt > 1000) { err.textContent = 'Maximum deposit is $1,000.00'; err.style.display = 'block'; return; }
  if (!state.user) { closeModal('balanceOverlay'); openAccount(); return; }
  state.depositAmount = amt;
  const btn = document.querySelector('#balanceOverlay .primary-btn');
  busy(btn, true);
  API.call('deposit_rupantor', { amount: amt }).then(j => {
    busy(btn, false);
    if (!j.ok) { err.textContent = j.msg || 'Could not create payment link'; err.style.display = 'block'; return; }
    // redirect to RupantorPay payment page
    window.location.href = j.payment_url;
  }).catch(() => {
    busy(btn, false);
    err.textContent = 'Network error. Please try again.';
    err.style.display = 'block';
  });
}
function submitDeposit() {
  if (!state.user) { closeModal('balanceOverlay'); openAccount(); return; }
  const trx = document.getElementById('depTrx').value.trim();
  const confirmed = document.getElementById('depConfirm').checked;
  const fail = m => { fieldErr('depErr', m); return false; };
  fieldErrOff('depErr');
  if (trx.length < 8 || !/[a-z0-9]/i.test(trx)) return fail('Enter the Transaction ID (TrxID) from your Binance payment — at least 8 characters.');
  if (!confirmed) return fail('Please confirm that you have sent the payment.');
  const amt = Number(state.depositAmount) || 0;
  if (amt < 2) { balStep(1); return false; }

  const btn = document.querySelector('[data-balstep="2"] button[type="submit"], [data-balstep="2"] .primary-btn');
  busy(btn, true);
  API.call('deposit_create', { amount: amt, method: 'binance', trx }).then(async j => {
    busy(btn, false);
    if (!j.ok) { fail(j.msg || 'Could not submit the deposit'); return; }
    state.deposit = { code: j.code, amount: amt, trx, status: 'pending', created: Date.now() };
    document.getElementById('depCode').textContent = j.code;
    document.getElementById('depDoneAmt').textContent = money(amt);
    document.getElementById('depDoneTrx').textContent = trx;
    document.getElementById('depStatus').textContent = 'Pending review';
    document.getElementById('depStatus').className = 'badge badge-pending';
    balStep(3);
    await refreshMe();
    syncHeader();
    if (document.getElementById('accountOverlay').classList.contains('active')) renderAcctDeps();
    toast('Deposit submitted · ' + j.code, 'ok');
  });
  return true;
}

/* ---------- misc ---------- */
let toastT;
function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 3500);
}

function busy(btn, on) {
  if (!btn) return;
  if (on) {
    if (!btn._orig) btn._orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
  } else {
    btn.disabled = false;
    if (btn._orig) { btn.innerHTML = btn._orig; btn._orig = null; }
  }
}

function pasteToInput(id) {
  const inp = document.getElementById(id);
  if (!inp) return;
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText().then(t => {
      if (t) { inp.value = t; inp.dispatchEvent(new Event('input', { bubbles: true })); }
      inp.focus();
    }).catch(() => toast('Clipboard blocked — paste with Ctrl+V', 'err'));
  } else toast('Clipboard not available — paste with Ctrl+V', 'err');
}

function applyThemeAttr(next) {
  const r = document.documentElement;
  r.classList.add('theme-anim-off');
  r.setAttribute('data-theme', next);
  void r.offsetHeight;
  r.classList.remove('theme-anim-off');
}

function initTheme() {
  const saved = store.get('sxc_theme', 'dark');
  applyThemeAttr(saved);
  document.getElementById('themeIcon').className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyThemeAttr(next);
  store.set('sxc_theme', next);
  document.getElementById('themeIcon').className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function syncKeyType() {
  const v = (document.querySelector('input[name="keytype"]:checked') || {}).value || 'direct';
  document.getElementById('androidIdField').style.display = v === 'device' ? 'block' : 'none';
  document.getElementById('deviceHint').style.display = v === 'device' ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();

  try {
    const u = new URL(location.href);
    if (u.searchParams.has('reset')) {
      u.searchParams.delete('reset');
      history.replaceState(null, '', u.pathname + u.search);
    }
  } catch (e) {}

  renderTabs();
  renderCatalog();
  initSlider();

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  document.getElementById('userBtn').addEventListener('click', e => { e.stopPropagation(); toggleUserMenu(); });
  document.getElementById('ddAuth').addEventListener('click', () => { closeUserMenu(); openAccount(); });
  document.getElementById('ddBalance').addEventListener('click', () => { closeUserMenu(); openBalance(); });
  document.getElementById('ddOrders').addEventListener('click', () => { closeUserMenu(); openAccount('purchases'); });
  document.getElementById('ddProfile').addEventListener('click', () => { closeUserMenu(); openAccount('purchases'); });
  document.getElementById('ddLogout').addEventListener('click', () => { closeUserMenu(); logout(); });
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('#userMenu')) return;
    closeUserMenu();
  });

  document.querySelectorAll('#acctTabs .tab').forEach(b =>
    b.addEventListener('click', () => showAcctTab(b.dataset.atab)));

  document.querySelectorAll('input[name="pay"]').forEach(r =>
    r.addEventListener('change', () => { if (r.checked) setPay(r.value); }));

  document.querySelectorAll('.amt-btn').forEach(b =>
    b.addEventListener('click', () => setAmount(b.dataset.amt)));
  document.getElementById('amtInput').addEventListener('input', () => {
    const v = Number(document.getElementById('amtInput').value);
    document.querySelectorAll('.amt-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.amt) === v));
  });

  document.querySelectorAll('#authTabs button').forEach(b =>
    b.addEventListener('click', () => showAuth(b.dataset.auth)));

  document.querySelectorAll('input[name="keytype"]').forEach(r => r.addEventListener('change', syncKeyType));
  syncKeyType();

  document.getElementById('variantSelect').addEventListener('change', selectVariant);

  document.addEventListener('input', e => {
    const panel = e.target.closest && e.target.closest('.auth-panel');
    if (panel) panel.querySelectorAll('.form-err').forEach(x => { x.style.display = 'none'; });
    const g = e.target.closest && e.target.closest('.g-step');
    if (g) g.querySelectorAll('.g-err').forEach(x => { x.style.display = 'none'; });
  });

  const shot = document.getElementById('payShot');
  shot.addEventListener('change', () => {
    const f = shot.files[0];
    const label = document.getElementById('fileName');
    const prev = document.getElementById('shotPreview');
    if (!f) { label.textContent = 'Choose screenshot'; prev.style.display = 'none'; return; }
    label.textContent = f.name;
    if (f.size > 3 * 1024 * 1024) fieldErr('payErr', 'Screenshot must be smaller than 3 MB.');
    const r = new FileReader();
    r.onload = ev => { prev.src = ev.target.result; prev.style.display = 'block'; };
    r.onerror = () => { prev.style.display = 'none'; };
    r.readAsDataURL(f);
  });

  document.querySelectorAll('.overlay').forEach(o =>
    o.addEventListener('click', e => {
      if (e.target !== o) return;
      if (Date.now() - (o._openedAt || 0) < 400) return;
      closeModal(o.id);
    }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeUserMenu();
      document.querySelectorAll('.overlay.active').forEach(o => closeModal(o.id));
    }
  });

  await refreshMe();
  syncHeader();
  syncSignOut();
  if (BOOT.reset || BOOT.reset_err) applyResetBoot();

  const hideAnnounce = () => { document.getElementById('announceBar').classList.remove('show'); store.set('sxc_announce', 'ok'); };
  if (store.get('sxc_announce', '') !== 'ok') {
    setTimeout(() => document.getElementById('announceBar').classList.add('show'), 700);
  }
  const ab = document.getElementById('announceBar');
  document.getElementById('announceClose').addEventListener('click', hideAnnounce);
  document.getElementById('announceOk').addEventListener('click', hideAnnounce);
  ab.addEventListener('click', e => { if (e.target === ab) hideAnnounce(); });

  setTimeout(() => document.getElementById('loader').classList.add('done'), 900);
});
