const OWNER = 'Solayman X Cheat';
const API_BASE = (typeof window !== 'undefined' && window.API_BASE) ? window.API_BASE : 'http://localhost:3000';

const PAY_CONFIG = {
  bkash: {
    brand: 'bkash',
    head: 'Send Money with bKash',
    icon: 'fa-solid fa-mobile-screen-button',
    idLabel: 'bKash Personal Number',
    number: (window.BKASH_MERCHANT_NUMBER || '01XXXXXXXXX'),
    merchant: 'SOLAYMAN X CHEAT STORE',
    seller: 'Solayman X Cheat',
    fromLabel: 'Sender bKash Number <em>Optional</em>',
    fromPlaceholder: '01XXXXXXXXX',
    trxPlaceholder: 'bKash TrxID (e.g. BKA2510171234ABCD)',
    warn: 'Send the exact amount to the bKash number above, then paste the TrxID. Verification is automatic.',
    tut: 'How to pay with bKash?'
  },
  nagad: {
    brand: 'nagad',
    head: 'Send Money with Nagad',
    icon: 'fa-solid fa-mobile-screen-button',
    idLabel: 'Nagad Personal Number',
    number: (window.NAGAD_MERCHANT_NUMBER || '01XXXXXXXXX'),
    merchant: 'SOLAYMAN X CHEAT STORE',
    seller: 'Solayman X Cheat',
    fromLabel: 'Sender Nagad Number <em>Optional</em>',
    fromPlaceholder: '01XXXXXXXXX',
    trxPlaceholder: 'Nagad TrxID (e.g. NGD2510171234ABCD)',
    warn: 'Send the exact amount to the Nagad number above, then paste the TrxID. Verification is automatic.',
    tut: 'How to pay with Nagad?'
  },
  binance: {
    head: 'Send payment with Binance Pay',
    icon: 'fab fa-bitcoin',
    idLabel: 'Binance Pay ID',
    number: '8812345678',
    merchant: 'SOLAYMAN X CHEAT STORE',
    seller: 'Solayman X Cheat',
    fromLabel: 'Sender Binance ID / Phone <em>Optional</em>',
    fromPlaceholder: '@yourbinanceid or 01XXXXXXXXX',
    trxPlaceholder: 'e.g. 3847592104837465',
    warn: 'Send the exact amount only. A wrong amount delays verification.',
    tut: 'How to pay with Binance?'
  }
};

function updatePayBox() {
  const c = PAY_CONFIG[state.pay];
  if (!c) return;
  document.getElementById('payHeadText').textContent = c.head;
  document.getElementById('payHeadIcon').className = c.icon;
  document.getElementById('payIdLabel').textContent = c.idLabel;
  document.getElementById('payIdVal').textContent = c.number;
  document.getElementById('payMerchantVal').textContent = c.merchant;
  document.getElementById('paySellerVal').textContent = c.seller;
  document.getElementById('payWarnText').textContent = c.warn;
  document.getElementById('payTutText').textContent = c.tut;
  document.getElementById('trxFromLabel').innerHTML = c.fromLabel;
  document.getElementById('trxFrom').placeholder = c.fromPlaceholder;
  document.getElementById('trxId').placeholder = c.trxPlaceholder;
  const brand = c.brand || '';
  const box = document.getElementById('payBox');
  if (box) box.className = 'pay-box' + (brand ? ' brand-' + brand : '');
  const auto = !!brand;
  const amtBar = document.getElementById('amtBar');
  if (amtBar) {
    amtBar.style.display = auto ? 'flex' : 'none';
    document.getElementById('amtBarVal').textContent = money(typeof currentTotal === 'function' ? currentTotal() : 0);
  }
  const tiles = document.getElementById('autoTiles');
  if (tiles) tiles.style.display = auto ? 'grid' : 'none';
  const tb = document.getElementById('tileBkash');
  const tn = document.getElementById('tileNagad');
  if (tb) tb.classList.toggle('active', state.pay === 'bkash');
  if (tn) tn.classList.toggle('active', state.pay === 'nagad');
  const sn = document.getElementById('sendNote');
  if (sn) sn.style.display = auto ? 'block' : 'none';
}

function switchAutoMethod(m) {
  if (m !== 'bkash' && m !== 'nagad') return;
  state.pay = m;
  document.querySelectorAll('input[name="pay"]').forEach(r => { r.checked = r.value === m; });
  document.querySelectorAll('.step-panel [data-panel="3"] .pay-card').forEach(card => {
    const inp = card.querySelector('input[name="pay"]');
    card.classList.toggle('selected', !!(inp && inp.value === m));
  });
  updatePayBox();
}

const CATEGORIES = ['All', 'ANDROID', 'ANDROID PROXY', 'ANDROID ROOT', 'GUILD GLORY', 'IOS HACK', 'PC HACK'];

const PRODUCTS = [
  { n: 'BALAMOD ANDROID', c: 'ANDROID', p: 25, v: 1, i: 'android', t: ['ANDROID', 'MOD'] },
  { n: 'Drip Android ApkMod', c: 'ANDROID', p: 60, v: 1, i: 'android', t: ['ANDROID', 'APK'] },
  { n: 'Hg Cheat ApkMod', c: 'ANDROID', p: 80, v: 1, i: 'android', t: ['ANDROID', 'APK'] },
  { n: 'Prime Apkmod', c: 'ANDROID', p: 50, v: 1, i: 'android', t: ['ANDROID', 'APK'] },
  { n: 'Abcd Mod Apk', c: 'ANDROID', p: 60, v: 1, i: 'android', t: ['ANDROID', 'APK'] },
  { n: 'Pato Blue ApkMod', c: 'ANDROID', p: 200, v: 1, i: 'android', t: ['ANDROID', 'PAID'] },
  { n: 'Pato Green ApkMod', c: 'ANDROID', p: 200, v: 1, i: 'android', t: ['ANDROID', 'PAID'] },
  { n: 'Pato Orange ApkMod', c: 'ANDROID', p: 300, v: 1, i: 'android', t: ['ANDROID', 'PAID'] },
  { n: 'Pato Yellow', c: 'ANDROID', p: 200, v: 1, i: 'android', t: ['ANDROID', 'PAID'] },
  { n: 'AimHack Android + IOS', c: 'ANDROID', p: 20, v: 1, i: 'mobile', t: ['ANDROID', 'IOS'] },
  { n: 'Drip Wire Android', c: 'ANDROID', p: 50, v: 0, i: 'android', t: ['ANDROID'] },
  { n: 'Xreg Android + IOS', c: 'ANDROID', p: 20, v: 1, i: 'mobile', t: ['ANDROID', 'IOS'] },

  { n: 'Drip Proxy Apk', c: 'ANDROID PROXY', p: 100, v: 1, i: 'globe', t: ['PROXY', 'APK'] },
  { n: 'Hg Proxy Android', c: 'ANDROID PROXY', p: 80, v: 1, i: 'globe', t: ['PROXY', 'ANDROID'] },
  { n: 'HG Prime Proxy New', c: 'ANDROID PROXY', p: 50, v: 1, i: 'globe', t: ['PROXY', 'NEW'] },

  { n: 'ANGRY MOD', c: 'ANDROID ROOT', p: 70, v: 1, i: 'terminal', t: ['ROOT', 'MOD'] },
  { n: 'HAXXCKER ROOT INDIA', c: 'ANDROID ROOT', p: 800, v: 1, i: 'terminal', t: ['ROOT', 'PRO'] },
  { n: 'BrMod Root Android', c: 'ANDROID ROOT', p: 70, v: 1, i: 'terminal', t: ['ROOT', 'ANDROID'] },
  { n: 'Drip Root Android', c: 'ANDROID ROOT', p: 100, v: 1, i: 'terminal', t: ['ROOT', 'ANDROID'] },
  { n: 'Hex Blade Root', c: 'ANDROID ROOT', p: 100, v: 1, i: 'terminal', t: ['ROOT'] },
  { n: 'LKTEAM Root + PC', c: 'ANDROID ROOT', p: 80, v: 1, i: 'terminal', t: ['ROOT', 'PC'] },
  { n: 'Reaper X Pro', c: 'ANDROID ROOT', p: 250, v: 1, i: 'terminal', t: ['ROOT', 'PRO'] },
  { n: 'RapidCore Root Injector', c: 'ANDROID ROOT', p: 100, v: 1, i: 'terminal', t: ['ROOT', 'INJECTOR'] },
  { n: 'Unseen Mods Root', c: 'ANDROID ROOT', p: 50, v: 0, i: 'terminal', t: ['ROOT'] },
  { n: 'Crack Master Root', c: 'ANDROID ROOT', p: 50, v: 1, i: 'terminal', t: ['ROOT'] },

  { n: 'GUILD GLORY', c: 'GUILD GLORY', p: 110, v: 1, i: 'trophy', t: ['GUILD', 'RANK'] },

  { n: 'MIGUL IOS PANEL', c: 'IOS HACK', p: 2000, v: 1, i: 'apple', t: ['IOS', 'PANEL'] },
  { n: 'Gbox Esign Cert', c: 'IOS HACK', p: 500, v: 1, i: 'apple', t: ['IOS', 'CERT'] },

  { n: 'Brmod SilentAim PC', c: 'PC HACK', p: 120, v: 1, i: 'desktop', t: ['PC', 'MENU'] },
  { n: 'Brmod X86 Menu', c: 'PC HACK', p: 150, v: 1, i: 'desktop', t: ['PC', 'MENU'] },
  { n: 'Drip Aimkill Pc', c: 'PC HACK', p: 110, v: 1, i: 'desktop', t: ['PC'] },
  { n: 'Dustu AimKill PC', c: 'PC HACK', p: 100, v: 1, i: 'desktop', t: ['PC'] },
  { n: 'MI ACCOUNT', c: 'PC HACK', p: 1000, v: 1, i: 'user-shield', t: ['ACCOUNT', 'PC'] }
];

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

const COUPONS = { SAVE10: 10, SOLAY15: 15, CHEAT20: 20 };
const COUPON_MIN = { SAVE10: 100, SOLAY15: 300, CHEAT20: 600 };
const CAT_HUE = { 'ANDROID': '0deg', 'ANDROID PROXY': '60deg', 'ANDROID ROOT': '120deg', 'GUILD GLORY': '35deg', 'IOS HACK': '285deg', 'PC HACK': '195deg' };

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

function loadUser() {
  try { return JSON.parse(store.get('sxc_user', 'null')) || null; } catch (e) { return null; }
}

const state = {
  cat: 'All',
  product: null,
  variant: null,
  qty: 1,
  coupon: null,
  user: loadUser(),
  resetEmail: '',
  order: null,
  pay: 'binance',
  depGw: 'binance',
  acctTab: 'purchases'
};

const money = n => '৳' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
            return `
            <article class="product">
              <div class="product-header">
                <div class="product-icon"><i class="${ICONS[p.i] || 'fa-solid fa-cube'}"></i></div>
                <div class="product-title">
                  <span class="product-name" title="${p.n}">${p.n}</span>
                  <span class="product-verified ${p.v ? '' : 'unverified'}">
                    ${p.v ? '<i class="fas fa-check-circle"></i> Verified' : 'Standard'}
                  </span>
                </div>
              </div>
              <div class="product-img" style="--ph:${CAT_HUE[cat] || '0deg'}"><span class="ph">${short}</span></div>
              <div class="product-body">
                <div class="product-tags">${p.t.map(t => `<span class="tag">${t}</span>`).join('')}</div>
              </div>
              <div class="product-footer">
                <div class="product-price"><i class="fas fa-tag"></i> From <span>${money(p.p)}</span></div>
                <div class="product-buttons">
                  <button class="buy-btn" onclick="openPurchase(${idx})"><i class="fas fa-shopping-cart"></i> Buy</button>
                  <button class="demo-btn" title="Demo Video" onclick="openTutorial('product', '${p.n}')"><i class="fas fa-play"></i></button>
                </div>
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
  const variants = [
    { label: '1 Day', mult: 1, stock: 12 },
    { label: '7 Days', mult: 5, stock: 6 },
    { label: '30 Days', mult: 15, stock: 3 }
  ];
  document.getElementById('variantSelect').innerHTML =
    '<option value="">-- Choose Variant --</option>' +
    variants.map(v => `<option value="${v.mult}" data-label="${v.label}" data-stock="${v.stock}">${v.label} — ${money(base * v.mult)}</option>`).join('');
  document.getElementById('variantInfo').classList.remove('show');
  setStep1Next(true);

  gotoStep(1);
  openModal('purchaseOverlay');
}

function stockText(s) {
  if (s <= 0) return 'Out of stock';
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
  state.variant = { mult: Number(opt.value), label: opt.dataset.label, stock };
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
    state.variant = { mult: Number(sel.value), label: sel.selectedOptions[0].dataset.label, stock: Number(sel.selectedOptions[0].dataset.stock) || 0 };
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
      const rec = Accounts.get(state.user.email) || {};
      document.getElementById('custName').textContent = state.user.name || state.user.email;
      document.getElementById('custEmail').textContent = state.user.email;
      document.getElementById('custPhone').textContent = rec.phone || '—';
      document.getElementById('custPhoneRow').style.display = rec.phone ? 'flex' : 'none';
    }
  }
  if (n === 3) { refreshPayGateways(); updateTotals(); }
  if (n === 4) {
    updateTotals();
    updatePayBox();
    const total = currentTotal();
    const binance = state.pay !== 'balance';
    document.getElementById('binancePayBox').style.display = binance ? 'block' : 'none';
    document.getElementById('balancePayBox').style.display = binance ? 'none' : 'block';
    if (binance) {
      document.getElementById('payAmount').textContent = money(total);
      document.getElementById('amtBarVal').textContent = money(total);
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
  document.getElementById('payCardBkash').classList.toggle('selected', method === 'bkash');
  document.getElementById('payCardNagad').classList.toggle('selected', method === 'nagad');
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
  all() {
    try { const v = JSON.parse(store.get('sxc_orders', '[]')); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  },
  save(list) {
    try { localStorage.setItem('sxc_orders', JSON.stringify(list.slice(0, 50))); return null; }
    catch (e) { return 'Browser storage is blocked or full — order not saved.'; }
  },
  add(o) { const list = this.all(); list.unshift(o); return this.save(list); },
  get(code) { return this.all().find(o => o.code === code) || null; },
  set(code, patch) {
    const list = this.all();
    const i = list.findIndex(o => o.code === code);
    if (i < 0) return null;
    Object.assign(list[i], patch);
    this.save(list);
    return list[i];
  }
};

function makeOrderCode() {
  const d = new Date();
  const stamp = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  return 'SXC-' + stamp + '-' + Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, 'X');
}

/* ---------- wallet (balance + deposits) ---------- */
const Wallet = {
  all() {
    try { const v = JSON.parse(store.get('sxc_wallets', '{}')); return v && typeof v === 'object' ? v : {}; }
    catch (e) { return {}; }
  },
  save(map) {
    try { localStorage.setItem('sxc_wallets', JSON.stringify(map)); return null; }
    catch (e) { return 'Browser storage is blocked or full — balance not saved.'; }
  },
  get(email) {
    if (!email) return { balance: 0, deposits: [] };
    const m = this.all();
    const w = m[email] || { balance: 0, deposits: [] };
    if (!Array.isArray(w.deposits)) w.deposits = [];
    w.balance = Number(w.balance) || 0;
    return w;
  },
  put(email, w) {
    const m = this.all();
    m[email] = w;
    return this.save(m);
  },
  setBalance(email, v) { const w = this.get(email); w.balance = Math.max(0, v); return this.put(email, w); },
  addDeposit(email, d) { const w = this.get(email); w.deposits.unshift(d); w.deposits = w.deposits.slice(0, 50); return this.put(email, w); },
  credit(email, amount) { const w = this.get(email); w.balance += amount; return this.put(email, w); }
};

function balance() {
  return state.user ? Wallet.get(state.user.email).balance : 0;
}
function parseAmount(txt) {
  const n = Number(String(txt || '').replace(/[^0-9.]/g, ''));
  return isFinite(n) ? n : 0;
}

async function submitPayment() {
  if (!state.user) { toast('Please login first', 'err'); gotoStep(2); return; }
  const errBox = document.getElementById('payErr');
  const trx = document.getElementById('trxId').value.trim();
  const from = document.getElementById('trxFrom').value.trim();
  const shot = document.getElementById('payShot').files[0];
  const confirmed = document.getElementById('payConfirm').checked;
  const fail = m => { fieldErr('payErr', m); return false; };

  fieldErrOff('payErr');
  const pname = state.pay === 'bkash' ? 'bKash' : state.pay === 'nagad' ? 'Nagad' : 'Binance';
  if (trx.length < 8 || !/[a-z0-9]/i.test(trx)) return fail('Enter the Transaction ID (TrxID) from your ' + pname + ' payment — at least 8 characters.');
  if (shot && shot.size > 3 * 1024 * 1024) return fail('Screenshot must be smaller than 3 MB.');
  if (!confirmed) return fail('Please confirm that you have sent the payment.');

  const amount = document.getElementById('sumTotal').textContent;
  const numericAmount = parseAmount(amount);
  const subBtn = document.querySelector('[data-panel="4"] .primary-btn.pay');

  if (state.pay === 'bkash' || state.pay === 'nagad') {
    const endpoint = state.pay === 'bkash' ? '/verify-bkash' : '/verify-nagad';
    const pname2 = state.pay === 'bkash' ? 'bKash' : 'Nagad';
    const ov = document.getElementById('autoCheck');
    const msg = document.getElementById('autoCheckMsg');
    if (msg) msg.textContent = 'Verifying TrxID with ' + pname2 + '…';
    if (ov) ov.style.display = 'flex';
    if (subBtn) subBtn.disabled = true;
    const started = Date.now();
    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trxId: trx, amount: numericAmount })
      });
      const data = await res.json();
      const left = Math.max(0, 1400 - (Date.now() - started));
      if (left) await new Promise(r => setTimeout(r, left));
      if (!res.ok || !data.success) {
        return fail(data.message || 'Payment verification failed');
      }
      if (msg) msg.textContent = 'Payment verified — ' + pname2;
    } catch (e) {
      return fail('Verification server unreachable');
    } finally {
      if (ov) ov.style.display = 'none';
      if (subBtn) subBtn.disabled = false;
    }
  }

  const order = {
    code: makeOrderCode(),
    email: state.user.email,
    product: state.product ? state.product.n : '—',
    variant: state.variant ? state.variant.label : '—',
    qty: state.qty,
    amount,
    trx,
    from,
    shot: shot ? shot.name : '',
    status: (state.pay === 'bkash' || state.pay === 'nagad') ? 'verified' : 'pending',
    key: '',
    created: Date.now()
  };
  const saveErr = Orders.add(order);
  if (saveErr) return fail(saveErr);
  state.order = order;
  gotoStep(5);
  toast((order.status === 'verified' ? 'TrxID auto-verified · ' : 'Payment submitted · ') + order.code, 'ok');
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
  const verified = o.status === 'verified';
  document.getElementById('doneTitle').textContent = done ? 'Order Delivered' : verified ? 'Payment Verified (Auto)' : 'Payment Submitted';
  document.getElementById('doneSub').textContent = done
    ? 'Your balance payment was verified instantly. Keep this order code.'
    : verified
      ? (state.pay === 'nagad' ? 'Nagad TrxID verified automatically. Keep this order code.' : 'bKash TrxID verified automatically. Keep this order code.')
      : 'Your payment is queued for verification. Keep this order code.';
  document.getElementById('doneIcon').className = done ? 'fas fa-circle-check' : verified ? 'fas fa-shield-halved' : 'fas fa-hourglass-half';
  document.getElementById('doneHint').innerHTML = done
    ? '<i class="fas fa-bolt"></i> Paid from balance — the license key above is ready to use now.'
    : verified
      ? '<i class="fas fa-bolt"></i> Automatic verification passed — delivery is now being prepared.'
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

  const cut = Wallet.credit(state.user.email, -total);
  if (cut) return fail(cut);

  const key = 'SXC-' + Math.random().toString(36).slice(2, 8).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const order = {
    code: makeOrderCode(),
    email: state.user.email,
    product: state.product ? state.product.n : '—',
    variant: state.variant ? state.variant.label : '—',
    qty: state.qty,
    amount: money(total),
    trx: 'BALANCE',
    from: '',
    shot: '',
    status: 'delivered',
    key,
    created: Date.now()
  };
  const saveErr = Orders.add(order);
  if (saveErr) { Wallet.credit(state.user.email, total); return fail(saveErr); }
  state.order = order;
  syncHeader();
  gotoStep(5);
  toast('Paid from balance · key delivered', 'ok');
  return true;
}

function statusLabel(st) {
  return st === 'delivered' ? 'Delivered' : st === 'approved' ? 'Approved' : st === 'verified' ? 'Verified (auto)' : 'Pending review';
}
function statusClass(st) {
  return st === 'delivered' || st === 'approved' || st === 'verified' ? 'badge-ok' : 'badge-pending';
}

function openOrders() {
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
        <div class="sum-row"><span>Amount</span><b>${o.amount}</b></div>
        <div class="sum-row"><span>TrxID</span><b>${o.trx}</b></div>
        <div class="sum-row"><span>Placed</span><b>${new Date(o.created).toLocaleString()}</b></div>
        ${o.key ? `<div class="sum-row"><span>License Key</span><b class="key-val">${o.key}</b></div>` : ''}
      </div>
      <div class="order-card-foot">
        ${o.status === 'pending'
          ? `<button class="link-btn" type="button" onclick="demoApprove('${o.code}')"><i class="fas fa-wand-magic-sparkles"></i> Demo: approve this order</button>`
          : `<button class="link-btn" type="button" onclick="copyText('${o.key}','Key copied')"><i class="far fa-copy"></i> Copy key</button>`}
      </div>
    </div>`).join('');
  openModal('ordersOverlay');
}

function demoApprove(code) {
  const key = 'SXC-' + Math.random().toString(36).slice(2, 8).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  Orders.set(code, { status: 'delivered', key });
  if (state.order && state.order.code === code) { state.order.status = 'delivered'; state.order.key = key; }
  if (state.user) {
    const acctOpen = document.getElementById('accountOverlay').classList.contains('active');
    if (acctOpen) renderAccount(); else openOrders();
    syncHeader();
  } else openOrders();
  toast('Order ' + code + ' delivered', 'ok');
}

function copyText(text, msg) {
  const done = () => toast(msg || 'Copied', 'ok');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => toast('Copy failed', 'err'));
  else toast('Copy failed', 'err');
}

/* ---------- accounts (local, salted SHA-256) ---------- */
function sha256(str) {
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const b = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 128) b.push(c);
    else if (c < 2048) b.push(192 | (c >> 6), 128 | (c & 63));
    else b.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
  }
  const bits = b.length * 8;
  b.push(0x80);
  while (b.length % 64 !== 56) b.push(0);
  for (let i = 7; i >= 0; i--) b.push(Math.floor(bits / Math.pow(2, i * 8)) & 0xff);
  const w = new Array(64);
  const rr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < b.length; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = ((b[o + i * 4] << 24) | (b[o + i * 4 + 1] << 16) | (b[o + i * 4 + 2] << 8) | b[o + i * 4 + 3]) >>> 0;
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
      const maj = (a & bb) ^ (a & c) ^ (bb & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = bb; bb = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + bb) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return H.map(x => x.toString(16).padStart(8, '0')).join('');
}

const normEmail = e => String(e || '').trim().toLowerCase();
const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const hashPass = (pass, salt) => sha256(salt + '|' + pass);
const makeSalt = () => Array.from({ length: 16 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const makeCode = () => 'SXC-' + Array.from({ length: 2 }, () => Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, 'X')).join('-');
const normCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const Accounts = {
  all() {
    try { const v = JSON.parse(store.get('sxc_accounts', '{}')); return v && typeof v === 'object' ? v : {}; }
    catch (e) { return {}; }
  },
  get(email) { return this.all()[normEmail(email)] || null; },
  put(email, rec) {
    const m = this.all();
    m[normEmail(email)] = rec;
    try { localStorage.setItem('sxc_accounts', JSON.stringify(m)); return null; }
    catch (e) { return 'Browser storage is blocked or full — can\'t save this account.'; }
  },
  create(o) {
    const email = normEmail(o.email);
    if (!validEmail(email)) throw 'Enter a valid email address';
    if (this.get(email)) throw 'This email is already registered — please login';
    if (String(o.password || '').length < 6) throw 'Password must be at least 6 characters';
    const salt = makeSalt();
    const rec = {
      name: String(o.name || email.split('@')[0]).trim(),
      phone: String(o.phone || '').trim(),
      salt, hash: hashPass(o.password, salt), code: makeCode(),
      created: Date.now(), last: 0
    };
    const err = this.put(email, rec);
    if (err) throw err;
    return rec;
  },
  touch(email) { const r = this.get(email); if (r) { r.last = Date.now(); this.put(email, r); } return r; },
  verify(email, pass) { const r = this.get(email); return !!r && r.hash === hashPass(pass, r.salt); }
};

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
  const rec = on ? Accounts.get(state.user.email) : null;
  row.style.display = (on && rec && rec.code) ? 'flex' : 'none';
  if (on && rec) document.getElementById('recoveryCode').textContent = rec.code;
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
  const rec = Accounts.get(email) || {};
  const mine = Orders.all().filter(o => o.email === email);
  const spent = mine
    .filter(o => o.status === 'delivered' || o.status === 'approved')
    .reduce((s, o) => s + parseAmount(o.amount), 0);

  document.getElementById('profAvatar').textContent = (state.user.name || email)[0].toUpperCase();
  document.getElementById('profName').textContent = state.user.name || email;
  document.getElementById('profEmail').textContent = email;
  const ph = document.getElementById('profPhone');
  ph.style.display = rec.phone ? 'flex' : 'none';
  if (rec.phone) ph.innerHTML = '<i class="fas fa-phone"></i> ' + rec.phone;
  document.getElementById('stOrders').textContent = mine.length;
  document.getElementById('stSpent').textContent = money(spent);
  document.getElementById('stBal').textContent = money(balance());

  renderAcctOrders(mine);
  renderAcctDeps();
  showAcctTab(state.acctTab);
}
function renderAcctOrders(mine) {
  if (!mine) mine = Orders.all().filter(o => o.email === state.user.email);
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
        <div class="sum-row"><span>Amount</span><b>${o.amount}</b></div>
        <div class="sum-row"><span>Method</span><b>${o.trx === 'BALANCE' ? 'Account Balance' : 'Binance Pay'}</b></div>
        <div class="sum-row"><span>Placed</span><b>${new Date(o.created).toLocaleString()}</b></div>
        ${o.key ? `<div class="sum-row"><span>License Key</span><b class="key-val">${o.key}</b></div>` : ''}
      </div>
      <div class="order-card-foot">
        ${o.status === 'pending'
          ? `<button class="link-btn" type="button" onclick="demoApprove('${o.code}')"><i class="fas fa-wand-magic-sparkles"></i> Demo: approve this order</button>`
          : `<button class="link-btn" type="button" onclick="copyText('${o.key}','Key copied')"><i class="far fa-copy"></i> Copy key</button>`}
      </div>
    </div>`).join('');
}
function renderAcctDeps() {
  const w = state.user ? Wallet.get(state.user.email) : { deposits: [] };
  const list = w.deposits || [];
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
        <div class="sum-row"><span>Method</span><b>${d.method || 'Binance Pay'}</b></div>
        <div class="sum-row"><span>TrxID</span><b>${d.trx}</b></div>
        <div class="sum-row"><span>Placed</span><b>${new Date(d.created).toLocaleString()}</b></div>
      </div>
      <div class="order-card-foot">
        ${d.status === 'pending'
          ? `<span class="hint" style="margin:0"><i class="fas fa-hourglass-half"></i> Waiting for admin approval</span>`
          : `<span class="hint" style="margin:0"><i class="fas fa-circle-check"></i> Added to balance</span>`}
      </div>
    </div>`).join('');
}
function logout() {
  state.user = null;
  store.del('sxc_user');
  syncHeader();
  syncSignOut();
  toast('Signed out', 'ok');
  closeModal('accountOverlay');
  if (document.getElementById('purchaseOverlay').classList.contains('active')) gotoStep(2);
}
function showAuth(which) {
  fieldErrOff('loginErr'); fieldErrOff('regErr');
  fieldErrOff('resetErr1'); fieldErrOff('resetErr3');
  if (state.user) { syncSignOut(); return; }
  document.querySelectorAll('#authTabs button').forEach(b => b.classList.toggle('active', b.dataset.auth === which));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.toggle('active', p.dataset.authPanel === which));
}
function saveUser(email, name) {
  state.user = { email: normEmail(email), name: name || normEmail(email).split('@')[0] };
  store.set('sxc_user', JSON.stringify(state.user));
  syncHeader();
  syncSignOut();
  syncServerWallet();
  toast('Welcome, ' + state.user.name, 'ok');
}
function doLogin(e) {
  e.preventDefault();
  const email = normEmail(document.getElementById('loginEmail').value);
  const pass = document.getElementById('loginPass').value;
  fieldErrOff('loginErr');
  if (!validEmail(email)) { fieldErr('loginErr', 'Enter a valid email address'); return false; }
  const btn = e.target.querySelector('button[type="submit"]');
  busy(btn, true);
  setTimeout(() => {
    busy(btn, false);
    const rec = Accounts.get(email);
    if (!rec) { fieldErr('loginErr', 'No account found for this email. Please register first.'); return; }
    if (rec.hash !== hashPass(pass, rec.salt)) { fieldErr('loginErr', 'Incorrect password. Try again or use Forgot Password.'); return; }
    Accounts.touch(email);
    saveUser(email, rec.name);
    document.getElementById('loginPass').value = '';
    closeModal('accountOverlay');
  }, 320);
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
  setTimeout(() => {
    busy(btn, false);
    let rec;
    try {
      rec = Accounts.create({ email, name, phone, password: pass });
    } catch (err) {
      if (Accounts.get(email)) {
        showAuth('login');
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPass').value = '';
        fieldErr('loginErr', 'This email is already registered — please login.');
      } else fieldErr('regErr', String(err));
      return;
    }
    saveUser(email, rec.name);
    document.getElementById('regPass').value = '';
    document.getElementById('regPass2').value = '';
    closeModal('accountOverlay');
    showCode(rec.code);
  }, 340);
  return false;
}
function b64url(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64url(s) {
  s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return decodeURIComponent(escape(atob(s)));
}
function makeResetToken(email) {
  const acc = Accounts.get(email);
  const exp = Date.now() + 30 * 60 * 1000;
  const sig = sha256(email + '|' + exp + '|' + (acc ? acc.salt : '') + '|SXC-RESET');
  return b64url(JSON.stringify({ e: email, x: exp, s: sig }));
}
function readResetToken(token) {
  try {
    const o = JSON.parse(unb64url(token));
    if (!o || !o.e || !o.x) return { error: 'invalid' };
    if (Date.now() > Number(o.x)) return { error: 'expired' };
    const acc = Accounts.get(o.e);
    if (!acc) return { error: 'missing' };
    if (o.s !== sha256(o.e + '|' + o.x + '|' + acc.salt + '|SXC-RESET')) return { error: 'invalid' };
    return { email: normEmail(o.e) };
  } catch (e) { return { error: 'invalid' }; }
}
function resetUrl(token) {
  try { return location.origin + location.pathname + '?reset=' + token; }
  catch (e) { return '?reset=' + token; }
}
function resetStep1(e) {
  e.preventDefault();
  const email = normEmail(document.getElementById('forgotEmail').value);
  fieldErrOff('resetErr1');
  if (!validEmail(email)) { fieldErr('resetErr1', 'Enter a valid email address'); return false; }
  if (!Accounts.get(email)) { fieldErr('resetErr1', 'No account found for this email.'); return false; }
  const btn = e.target.querySelector('button[type="submit"]');
  busy(btn, true);
  setTimeout(() => {
    busy(btn, false);
    state.resetEmail = email;
    state.resetLink = resetUrl(makeResetToken(email));
    document.getElementById('resetWho').textContent = email;
    document.getElementById('resetWho2').textContent = email;
    document.getElementById('resetLinkBox').textContent = state.resetLink;
    showAuth('forgot2');
    toast('Reset link sent to ' + email, 'ok');
  }, 340);
  return false;
}
function copyResetLink() {
  const link = state.resetLink || (document.getElementById('resetLinkBox').textContent || '').trim();
  if (!link || link === '—') { toast('No link yet', 'err'); return; }
  copyText(link, 'Reset link copied');
}
function openResetLink() {
  const link = state.resetLink || (document.getElementById('resetLinkBox').textContent || '').trim();
  if (!link || link === '—') { toast('No link yet', 'err'); return; }
  location.href = link;
}
function applyResetToken(token) {
  const r = readResetToken(token);
  if (!r || r.error) {
    const msg = r && r.error === 'expired'
      ? 'This reset link has expired — request a new one.'
      : r && r.error === 'missing'
        ? 'No account found for this reset link.'
        : 'This reset link is invalid or has already been used.';
    if (state.user) logout();
    openModal('accountOverlay');
    showAuth('forgot1');
    fieldErr('resetErr1', msg);
    toast(msg, 'err');
    return false;
  }
  if (state.user) logout();
  state.resetEmail = r.email;
  document.getElementById('resetWho').textContent = r.email;
  document.getElementById('forgotEmail').value = r.email;
  if (!document.getElementById('accountOverlay').classList.contains('active')) openModal('accountOverlay');
  showAuth('forgot3');
  toast('Link verified — set a new password', 'ok');
  setTimeout(() => document.getElementById('newPass').focus(), 140);
  return true;
}
function resetStep3(e) {
  e.preventDefault();
  const rec = Accounts.get(state.resetEmail);
  const pass = document.getElementById('newPass').value;
  const pass2 = document.getElementById('newPass2').value;
  fieldErrOff('resetErr3');
  if (!rec) { showAuth('forgot1'); return false; }
  if (pass.length < 6) { fieldErr('resetErr3', 'Password must be at least 6 characters'); return false; }
  if (pass !== pass2) { fieldErr('resetErr3', 'Passwords do not match'); return false; }
  rec.salt = makeSalt();
  rec.hash = hashPass(pass, rec.salt);
  Accounts.put(state.resetEmail, rec);
  document.getElementById('newPass').value = '';
  document.getElementById('newPass2').value = '';
  showAuth('login');
  document.getElementById('loginEmail').value = state.resetEmail;
  document.getElementById('loginPass').value = '';
  toast('Password updated — please login with your new password', 'ok');
  try {
    const u = new URL(location.href);
    if (u.searchParams.has('reset')) { u.searchParams.delete('reset'); history.replaceState(null, '', u.pathname + u.search); }
  } catch (e) {}
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
  setTimeout(() => {
    busy(btn, false);
    let rec = Accounts.get(email);
    if (rec) {
      if (rec.hash !== hashPass(pass, rec.salt)) { googleErr('gErr2', 'Incorrect password for this account'); return; }
      Accounts.touch(email);
    } else {
      const name = document.getElementById('gGreet').textContent.replace(/^Hi\s*/, '');
      try { rec = Accounts.create({ email, name, password: pass }); }
      catch (err) { googleErr('gErr2', String(err)); return; }
    }
    closeModal('googleOverlay');
    closeModal('accountOverlay');
    saveUser(email, rec.name);
    showCode(rec.code);
  }, 320);
}

/* ---------- video / howto / legal ---------- */
function openTutorial(kind, name) {
  const binance = kind === 'binance';
  const auto = kind === 'bkash' || kind === 'nagad';
  document.getElementById('videoTitle').textContent = binance
    ? 'How to pay with Binance Pay'
    : auto
      ? 'How to pay with ' + (kind === 'bkash' ? 'bKash' : 'Nagad')
      : (name ? name + ' — Demo Video' : 'Demo Video');
  document.getElementById('videoFrame').src = (binance || auto
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

function setDepGw(m) {
  state.depGw = m;
  document.querySelectorAll('#gwCardBkash,#gwCardNagad,#gwCardBinance,#gwCardGateway').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById('gwCard' + m.charAt(0).toUpperCase() + m.slice(1));
  if (card) card.classList.add('selected');
  const tut = document.getElementById('gwTutText');
  if (tut) tut.textContent = m === 'bkash' ? 'How to pay with bKash?' : m === 'nagad' ? 'How to pay with Nagad?' : m === 'gateway' ? 'How to pay with Instant Pay?' : 'How to buy with Binance Pay?';
}

function switchDepMethod(m) {
  if (m !== 'bkash' && m !== 'nagad') return;
  state.depGw = m;
  document.querySelectorAll('input[name="gw"]').forEach(r => { r.checked = r.value === m; });
  document.getElementById('gwCardBkash').classList.toggle('selected', m === 'bkash');
  document.getElementById('gwCardNagad').classList.toggle('selected', m === 'nagad');
  document.getElementById('gwCardBinance').classList.remove('selected');
  updateDepBox();
}

function updateDepBox() {
  const m = state.depGw;
  const auto = m === 'bkash' || m === 'nagad';
  const cfg = PAY_CONFIG[m] || PAY_CONFIG.binance;
  const box = document.getElementById('depBox');
  if (!box) return;
  box.className = 'pay-box' + (auto ? ' brand-' + cfg.brand : '');
  document.getElementById('depHeadText').textContent = cfg.head;
  document.getElementById('depHeadIcon').className = cfg.icon;
  document.getElementById('depIdLabel').textContent = cfg.idLabel;
  document.getElementById('depPayId').textContent = cfg.number;
  document.getElementById('depWarnText').textContent = cfg.warn;
  document.getElementById('depTutText').textContent = cfg.tut;
  document.getElementById('depTrx').placeholder = cfg.trxPlaceholder;
  const amt = Number(state.depositAmount) || 0;
  document.getElementById('depAmtBarVal').textContent = money(amt);
  document.getElementById('depAmtBar').style.display = auto ? 'flex' : 'none';
  document.getElementById('depAutoTiles').style.display = auto ? 'grid' : 'none';
  const tb = document.getElementById('depTileBkash');
  const tn = document.getElementById('depTileNagad');
  if (tb) tb.classList.toggle('active', m === 'bkash');
  if (tn) tn.classList.toggle('active', m === 'nagad');
  document.getElementById('depSendNote').style.display = auto ? 'block' : 'none';
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
  if (!isFinite(amt) || amt < 200) { err.textContent = 'Minimum deposit is ৳200.00'; err.style.display = 'block'; return; }
  if (amt > 100000) { err.textContent = 'Maximum deposit is ৳100,000.00'; err.style.display = 'block'; return; }
  state.depositAmount = amt;
  document.getElementById('depAmount').textContent = money(amt);

  if (state.depGw === 'gateway') {
    const ld0 = document.getElementById('gwLoading');
    ld0.classList.add('show');
    (async () => {
      try {
        const r = await fetch(API_BASE + '/api/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amt,
            purpose: 'deposit',
            email: state.user ? state.user.email : '',
            name: state.user ? state.user.name : '',
            code: makeOrderCode()
          })
        });
        const j = await r.json();
        if (!r.ok || !j.success || !j.payment_url) {
          ld0.classList.remove('show');
          const e2 = document.getElementById('amtErr');
          e2.textContent = j.message || 'Gateway unavailable';
          e2.style.display = 'block';
          return;
        }
        window.location.href = j.payment_url;
      } catch (e) {
        ld0.classList.remove('show');
        const e2 = document.getElementById('amtErr');
        e2.textContent = 'Payment gateway unreachable';
        e2.style.display = 'block';
      }
    })();
    return;
  }

  const ld = document.getElementById('gwLoading');
  ld.classList.add('show');
  setTimeout(() => {
    ld.classList.remove('show');
    updateDepBox();
    balStep(2);
    setTimeout(() => document.getElementById('depTrx').focus(), 80);
  }, 1100);
}
async function submitDeposit() {
  if (!state.user) { closeModal('balanceOverlay'); openAccount(); return; }
  const trx = document.getElementById('depTrx').value.trim();
  const confirmed = document.getElementById('depConfirm').checked;
  const fail = m => { fieldErr('depErr', m); return false; };
  fieldErrOff('depErr');
  const m = state.depGw;
  const pname = m === 'bkash' ? 'bKash' : m === 'nagad' ? 'Nagad' : 'Binance';
  const label = m === 'binance' ? 'Binance Pay' : pname + ' Send Money';
  if (trx.length < 8 || !/[a-z0-9]/i.test(trx)) return fail('Enter the Transaction ID (TrxID) from your ' + pname + ' payment — at least 8 characters.');
  if (!confirmed) return fail('Please confirm that you have sent the payment.');
  const amt = Number(state.depositAmount) || 0;
  if (amt < 200) { balStep(1); return false; }

  let code = makeOrderCode();
  try {
    const res = await fetch(API_BASE + '/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.user.email, amount: amt, trx, method: label })
    });
    const data = await res.json();
    if (!res.ok || !data.success) return fail(data.message || 'Could not submit deposit');
    code = data.code || code;
  } catch (e) {
    return fail('Server unreachable — deposit not submitted');
  }

  const dep = { code, amount: amt, trx, method: label, status: 'pending', created: Date.now() };
  const saveErr = Wallet.addDeposit(state.user.email, dep);
  if (saveErr) return fail(saveErr);
  state.deposit = dep;
  document.getElementById('depCode').textContent = dep.code;
  document.getElementById('depDoneAmt').textContent = money(amt);
  document.getElementById('depDoneTrx').textContent = trx;
  document.getElementById('depDoneMethod').textContent = label;
  document.getElementById('depDoneTitle').textContent = 'Deposit Submitted';
  document.getElementById('depDoneSub').textContent = 'Your deposit is queued for admin approval. Keep this deposit code.';
  document.getElementById('depDoneIcon').className = 'fas fa-hourglass-half';
  document.getElementById('depStatus').textContent = 'Pending review';
  document.getElementById('depStatus').className = 'badge badge-pending';
  document.getElementById('depDoneHint').innerHTML = '<i class="fas fa-clock"></i> Balance is added after the admin approves your deposit.';
  balStep(3);
  syncHeader();
  renderAcctDeps();
  toast('Deposit submitted · ' + dep.code, 'ok');
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

/* ---------- admin panel ---------- */
function adminKey() { try { return sessionStorage.getItem('sxc_admin_key') || ''; } catch (e) { return ''; } }
function adminErr(msg) { const e = document.getElementById('adminErr'); if (e) { e.textContent = msg; e.style.display = 'block'; } }
function adminLogin() {
  const k = document.getElementById('adminKeyIn').value.trim();
  if (!k) return adminErr('Enter admin key');
  fetch(API_BASE + '/api/admin/deposits?key=' + encodeURIComponent(k))
    .then(r => r.json())
    .then(j => {
      if (!j.success) return adminErr(j.message || 'Wrong key');
      try { sessionStorage.setItem('sxc_admin_key', k); } catch (e) {}
      document.getElementById('adminErr').style.display = 'none';
      document.getElementById('adminLogin').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'block';
      adminRender(j.list || []);
    })
    .catch(() => adminErr('Server unreachable'));
}
function adminLogout() {
  try { sessionStorage.removeItem('sxc_admin_key'); } catch (e) {}
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminKeyIn').value = '';
}
function adminLoad() {
  fetch(API_BASE + '/api/admin/deposits?key=' + encodeURIComponent(adminKey()))
    .then(r => r.json())
    .then(j => { if (!j.success) { adminLogout(); return adminErr(j.message || 'Session expired'); } adminRender(j.list || []); })
    .catch(() => toast('Server unreachable', 'err'));
}
function adminRender(list) {
  const pending = list.filter(d => d.status === 'pending');
  const cnt = document.getElementById('adminCount');
  if (cnt) cnt.textContent = pending.length + ' pending · ' + list.length + ' total';
  const box = document.getElementById('adminList');
  if (!box) return;
  if (!list.length) { box.innerHTML = '<p class="muted" style="text-align:center;padding:18px">No deposits yet.</p>'; return; }
  const badge = s => s === 'pending' ? 'badge-pending' : 'badge-ok';
  const label = s => s === 'pending' ? 'Pending' : s === 'rejected' ? 'Rejected' : 'Credited';
  box.innerHTML = list.map(d => `
    <div class="admin-row${d.status !== 'pending' ? ' done' : ''}">
      <div class="admin-row-top">
        <b>${d.code}</b>
        <span class="badge ${badge(d.status)}">${label(d.status)}</span>
      </div>
      <div class="admin-row-grid">
        <span><small>User</small>${d.email}</span>
        <span><small>Amount</small>${money(d.amount)}</span>
        <span><small>Method</small>${d.method || '—'}</span>
        <span><small>TrxID</small>${d.trx}</span>
        <span><small>Time</small>${new Date(d.created).toLocaleString()}</span>
      </div>
      ${d.status === 'pending' ? `
      <div class="admin-row-actions">
        <button class="primary-btn" onclick="adminAct('${d.code}','approve')"><i class="fas fa-check"></i> Approve & Credit</button>
        <button class="ghost-btn" onclick="adminAct('${d.code}','reject')"><i class="fas fa-xmark"></i> Reject</button>
      </div>` : ''}
    </div>`).join('');
}
function adminAct(code, action) {
  fetch(API_BASE + '/api/admin/deposits/act', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: adminKey(), code, action })
  })
    .then(r => r.json())
    .then(j => {
      if (!j.success) return toast(j.message || 'Action failed', 'err');
      toast(action === 'approve' ? 'Approved · balance credited' : 'Deposit rejected', action === 'approve' ? 'ok' : 'err');
      adminLoad();
    })
    .catch(() => toast('Server unreachable', 'err'));
}
function openAdmin() {
  openModal('adminOverlay');
  if (adminKey()) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    adminLoad();
  } else {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
    setTimeout(() => { const i = document.getElementById('adminKeyIn'); if (i) i.focus(); }, 80);
  }
}

function serverBalKey(email) { return 'sxc_wsync_' + email; }
function getPrevBal(email) { try { return Number(localStorage.getItem(serverBalKey(email))) || 0; } catch (e) { return 0; } }
function setPrevBal(email, v) { try { localStorage.setItem(serverBalKey(email), String(Number(v) || 0)); } catch (e) {} }

function applyWalletSync(j) {
  if (!j || !j.success || !state.user) return;
  const email = state.user.email;
  const serverBal = Number(j.balance) || 0;
  const delta = serverBal - getPrevBal(email);
  if (delta) {
    const w = Wallet.get(email);
    w.balance = Math.max(0, (Number(w.balance) || 0) + delta);
    Wallet.put(email, w);
  }
  setPrevBal(email, serverBal);
  const local = Wallet.get(email);
  local.deposits = local.deposits || [];
  (j.deposits || []).forEach(sd => {
    const ex = local.deposits.find(d => d.code === sd.code);
    if (ex) {
      if (sd.status === 'credited') ex.status = 'credited';
      ex.method = sd.method || ex.method;
    } else {
      local.deposits.unshift(sd);
    }
  });
  local.deposits = local.deposits.slice(0, 50);
  Wallet.put(email, local);
  syncHeader();
  renderAcctDeps();
}

function syncServerWallet() {
  if (!state.user) return;
  fetch(API_BASE + '/api/wallet?email=' + encodeURIComponent(state.user.email))
    .then(r => r.json())
    .then(applyWalletSync)
    .catch(() => {});
}

function handleGatewayReturn() {
  try {
    const u = new URL(location.href);
    const paid = u.searchParams.get('paid');
    if (paid === null) return;
    const purpose = u.searchParams.get('purpose') || 'deposit';
    const amt = Number(u.searchParams.get('amount')) || 0;
    u.searchParams.delete('paid');
    u.searchParams.delete('purpose');
    u.searchParams.delete('amount');
    u.searchParams.delete('tran');
    u.searchParams.delete('msg');
    history.replaceState(null, '', u.pathname + u.search + u.hash);
    if (paid === '1') {
      toast((purpose === 'deposit' ? 'Balance credited' : 'Payment received') + ' · ' + money(amt), 'ok');
      syncServerWallet();
    } else {
      toast('Payment cancelled or failed', 'err');
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  handleGatewayReturn();
  try {
    if (location.hash === '#admin') {
      history.replaceState(null, '', location.pathname + location.search);
      setTimeout(openAdmin, 300);
    }
  } catch (e) {}
  setTimeout(syncServerWallet, 800);

  try {
    const u = new URL(location.href);
    const tok = u.searchParams.get('reset') || ((location.hash.match(/^#reset=(.+)$/) || [])[1] || '');
    if (tok) {
      u.searchParams.delete('reset');
      const clean = u.pathname + u.search + (location.hash.startsWith('#reset=') ? '' : location.hash);
      history.replaceState(null, '', clean);
      applyResetToken(tok);
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

  syncHeader();
  syncSignOut();

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
