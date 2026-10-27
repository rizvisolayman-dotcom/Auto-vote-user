const CATEGORIES = ['All', 'ANDROID', 'ANDROID PROXY', 'ANDROID ROOT', 'GUILD GLORY', 'IOS HACK', 'PC HACK'];

const ICON_MAP = {
  ANDROID: 'fab fa-android',
  'ANDROID PROXY': 'fas fa-globe',
  'ANDROID ROOT': 'fas fa-terminal',
  'GUILD GLORY': 'fas fa-crown',
  'IOS HACK': 'fab fa-apple',
  'PC HACK': 'fab fa-windows',
};

const PRODUCTS = [
  { id: 1, n: 'Drip Wire External', c: 'ANDROID', p: 50, v: 1, i: 'android', t: ['ANDROID', 'EXTERNAL'] },
  { id: 2, n: 'BALA MOD NON ROOT', c: 'ANDROID', p: 25, v: 1, i: 'android', t: ['ANDROID', 'MOD'] },
  { id: 3, n: 'Drip Client-Non Root', c: 'ANDROID', p: 60, v: 1, i: 'android', t: ['ANDROID', 'CLIENT'] },
  { id: 4, n: 'Hg Cheat', c: 'ANDROID', p: 80, v: 1, i: 'android', t: ['ANDROID', 'CHEAT'] },
  { id: 5, n: 'Prime Mod', c: 'ANDROID', p: 50, v: 1, i: 'android', t: ['ANDROID', 'MOD'] },
  { id: 6, n: 'Abcd Mod Apk', c: 'ANDROID', p: 60, v: 1, i: 'android', t: ['ANDROID', 'APK'] },
  { id: 7, n: 'Pato Team Apk Mod', c: 'ANDROID', p: 200, v: 1, i: 'android', t: ['ANDROID', 'PAID'] },
  { id: 8, n: 'AimHack Android + IOS', c: 'ANDROID', p: 20, v: 1, i: 'mobile', t: ['ANDROID', 'IOS'] },
  { id: 9, n: 'X-REG NON ROOT-IOS', c: 'ANDROID', p: 20, v: 1, i: 'mobile', t: ['ANDROID', 'IOS'] },

  { id: 10, n: 'Drip Proxy Apk', c: 'ANDROID PROXY', p: 100, v: 1, i: 'globe', t: ['PROXY', 'APK'] },
  { id: 11, n: 'Hg Proxy Android', c: 'ANDROID PROXY', p: 80, v: 1, i: 'globe', t: ['PROXY', 'ANDROID'] },
  { id: 12, n: 'HG Prime Proxy New', c: 'ANDROID PROXY', p: 50, v: 1, i: 'globe', t: ['PROXY', 'NEW'] },

  { id: 13, n: 'ANGRY MOOD', c: 'ANDROID ROOT', p: 70, v: 1, i: 'terminal', t: ['ROOT', 'MOD'] },
  { id: 14, n: 'HEX-BLADE ROOT', c: 'ANDROID ROOT', p: 100, v: 1, i: 'terminal', t: ['ROOT', 'BLADE'] },
  { id: 15, n: 'Br Mod Pc', c: 'ANDROID ROOT', p: 70, v: 1, i: 'terminal', t: ['ROOT', 'PC'] },
  { id: 16, n: 'Drip Root Android', c: 'ANDROID ROOT', p: 100, v: 1, i: 'terminal', t: ['ROOT', 'ANDROID'] },
  { id: 17, n: 'Root Service-with Pc', c: 'ANDROID ROOT', p: 250, v: 1, i: 'terminal', t: ['ROOT', 'SERVICE'] },
  { id: 18, n: 'Root Service-with phone', c: 'ANDROID ROOT', p: 100, v: 1, i: 'terminal', t: ['ROOT', 'SERVICE'] },

  { id: 19, n: 'GUILD BOT', c: 'GUILD GLORY', p: 110, v: 1, i: 'crown', t: ['GUILD', 'BOT'] },
  { id: 20, n: 'FF GLORY PRO', c: 'GUILD GLORY', p: 150, v: 1, i: 'crown', t: ['GUILD', 'PRO'] },

  { id: 21, n: 'PHANTOM ANDROID-IOS', c: 'IOS HACK', p: 2000, v: 1, i: 'apple', t: ['IOS', 'PREMIUM'] },
  { id: 22, n: 'MIGUL PRO AIMKILL', c: 'IOS HACK', p: 500, v: 1, i: 'apple', t: ['IOS', 'AIMKILL'] },
  { id: 23, n: 'ROYAL PROXY IOS', c: 'IOS HACK', p: 500, v: 1, i: 'apple', t: ['IOS', 'PROXY'] },

  { id: 24, n: 'Br Mod Pc', c: 'PC HACK', p: 120, v: 1, i: 'windows', t: ['PC', 'MOD'] },
  { id: 25, n: 'ROCKET MOD KERNEL', c: 'PC HACK', p: 150, v: 1, i: 'windows', t: ['PC', 'KERNEL'] },
  { id: 26, n: 'E•SIGN-1 YEAR', c: 'PC HACK', p: 500, v: 1, i: 'windows', t: ['PC', 'SIGN'] },
  { id: 27, n: 'ZOLO CHEAT- PUBG', c: 'PC HACK', p: 300, v: 1, i: 'windows', t: ['PC', 'PUBG'] },
  { id: 28, n: 'ELITE MODZ', c: 'PC HACK', p: 400, v: 1, i: 'windows', t: ['PC', 'MOD'] },
  { id: 29, n: 'DOLPHIN PLUSH', c: 'PC HACK', p: 250, v: 1, i: 'windows', t: ['PC', 'PANEL'] },
  { id: 30, n: 'Carrom Auto Play', c: 'PC HACK', p: 100, v: 1, i: 'windows', t: ['PC', 'AUTO'] },
  { id: 31, n: 'XYZ CHEATS NON ROOT', c: 'PC HACK', p: 180, v: 1, i: 'windows', t: ['PC', 'CHEAT'] },
  { id: 32, n: 'UNSEEN MOD ROOT', c: 'PC HACK', p: 50, v: 1, i: 'windows', t: ['PC', 'MOD'] },
  { id: 33, n: 'PRIME MOD-NON ROOT', c: 'PC HACK', p: 60, v: 1, i: 'windows', t: ['PC', 'MOD'] },
];

const VARIANTS = [
  { key: '1day', label: '1 Day', mult: 1 },
  { key: '7day', label: '7 Days', mult: 5 },
  { key: '30day', label: '30 Days', mult: 15 },
];

const KEY_TYPES = [
  { key: 'direct', label: 'Direct Key' },
  { key: 'device', label: 'Device Bound + Android ID' },
];

const PAYMENTS = [
  { id: 'binance', label: 'Binance Pay', icon: 'fas fa-coins', hint: 'Send to Binance Pay ID' },
  { id: 'bkash', label: 'bKash', icon: 'fas fa-mobile-alt', hint: 'Personal / Merchant' },
  { id: 'nagad', label: 'Nagad', icon: 'fas fa-credit-card', hint: 'Merchant / Personal' },
  { id: 'usdt', label: 'USDT (TRC20)', icon: 'fab fa-bitcoin', hint: 'Crypto wallet' },
];

const COUPONS = { SAVE10: 10, PANEL50: 50 };

const FEEDBACK = [
  { name: 'Misbah', stars: 5, text: 'Fast delivery & working panel. Highly recommended!', date: '2h ago' },
  { name: 'Hacker 1971', stars: 5, text: 'Best panel store in BD. Instant ID code delivery.', date: '5h ago' },
  { name: 'AdminRakib', stars: 5, text: 'Smooth payment via bKash. Panel worked instantly.', date: '1d ago' },
  { name: 'Nl Forhad', stars: 4, text: 'Good support on Telegram. Will buy again.', date: '2d ago' },
  { name: 'Mr Robin Doo', stars: 5, text: 'Drip Wire panel is top notch. Verified seller.', date: '3d ago' },
];

const CURRENCIES = {
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', rate: 1 },
  USDT: { symbol: 'USDT', name: 'US Dollar', rate: 125 },
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 1 },
};

let state = {
  currency: 'BDT',
  cart: [],
  user: null,
  currentProduct: null,
  currentVariant: VARIANTS[0],
  currentKeyType: KEY_TYPES[0],
  currentQty: 1,
  currentPayment: PAYMENTS[0],
  coupon: null,
  discount: 0,
  slideIndex: 0,
  autoSlide: null,
};

const sel = (id) => document.getElementById(id);
const fmt = (v) => parseFloat(v || 0).toFixed(2);
const conv = (bdt) => {
  const rate = CURRENCIES[state.currency].rate;
  return bdt / rate;
};
const curSym = () => CURRENCIES[state.currency].symbol;

function init() {
  renderCategories();
  renderProducts('All');
  renderFeedback();
  initSlider();
  initTheme();
  initAnnounce();
  initCart();
  initAuth();
  updateCartBadge();
  sel('loader').classList.add('done');
  window.addEventListener('resize', renderProducts);
}

function renderCategories() {
  const el = sel('catTabs');
  el.innerHTML = CATEGORIES.map((c, i) =>
    `<button class="cat-tab${i === 0 ? ' active' : ''}" data-c="${c}"><i class="fas fa-layer-group"></i> ${c}</button>`
  ).join('');
  el.querySelectorAll('.cat-tab').forEach(b => {
    b.addEventListener('click', () => {
      el.querySelectorAll('.cat-tab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      sel('catHeaderText').textContent = b.dataset.c === 'All' ? 'All Products' : b.dataset.c;
      renderProducts(b.dataset.c);
    });
  });
}

function renderProducts(cat) {
  const el = sel('products');
  const list = cat === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.c === cat);
  el.innerHTML = list.map(p => {
    const icon = ICON_MAP[p.c] || 'fas fa-cube';
    return `
      <div class="product">
        <div class="product-header">
          <div class="product-icon"><i class="${icon}"></i></div>
          <div class="product-title">
            <span class="product-name">${esc(p.n)}</span>
            ${p.v ? '<span class="product-verified"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
          </div>
        </div>
        <div class="product-img">
          <div class="placeholder"><i class="fas fa-layer-group"></i></div>
        </div>
        <div class="product-body">Premium ${p.n} panel with instant delivery and 24/7 support.</div>
        <div class="product-footer">
          <div class="product-price"><i class="fas fa-tag"></i> From <span>${fmt(conv(p.p))}</span></div>
          <button class="product-buy" data-id="${p.id}">Buy Now <i class="fas fa-arrow-right"></i></button>
        </div>
        <div class="product-tags">${p.t.map(tg => `<span>${esc(tg)}</span>`).join('')}</div>
      </div>
    `;
  }).join('');
  el.querySelectorAll('.product-buy').forEach(btn => {
    btn.addEventListener('click', () => openBuy(parseInt(btn.dataset.id)));
  });
}

function renderFeedback() {
  const el = sel('fbGrid');
  el.innerHTML = FEEDBACK.map(f => {
    const stars = '★'.repeat(f.stars) + '☆'.repeat(5 - f.stars);
    return `
      <div class="fb-card">
        <div class="fb-avatar">${f.name[0]}</div>
        <div class="fb-info">
          <div class="fb-name">${esc(f.name)}</div>
          <div class="fb-stars">${stars}</div>
          <div class="fb-text">${esc(f.text)}</div>
          <div class="fb-date">${f.date}</div>
        </div>
      </div>
    `;
  }).join('');
}

function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = sel('sliderDots');
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goSlide(i));
    dots.appendChild(d);
  });
  const dotsEls = dots.querySelectorAll('.slider-dot');
  function goSlide(i) {
    state.slideIndex = i;
    slides.forEach((s, idx) => { s.classList.toggle('active', idx === i); });
    dotsEls.forEach((d, idx) => { d.classList.toggle('active', idx === i); });
  }
  function nextSlide() { goSlide((state.slideIndex + 1) % slides.length); }
  sel('slidePrev').addEventListener('click', () => goSlide((state.slideIndex - 1 + slides.length) % slides.length));
  sel('slideNext').addEventListener('click', nextSlide);
  state.autoSlide = setInterval(nextSlide, 4000);
}

function initTheme() {
  const saved = localStorage.getItem('mxh_theme');
  const dark = saved ? saved === 'dark' : true;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  sel('themeIcon').className = dark ? 'fas fa-sun' : 'fas fa-moon';
  sel('themeToggle').addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    sel('themeIcon').className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('mxh_theme', isDark ? 'light' : 'dark');
  });
}

function initAnnounce() {
  if (localStorage.getItem('mxh_announce') === 'ok') sel('announceBar').style.display = 'none';
  sel('announceClose').addEventListener('click', () => {
    sel('announceBar').style.display = 'none';
    localStorage.setItem('mxh_announce', 'ok');
  });
  sel('announceOk').addEventListener('click', () => {
    sel('announceBar').style.display = 'none';
    localStorage.setItem('mxh_announce', 'ok');
  });
}

function initCart() {
  const stored = localStorage.getItem('mxh_cart');
  if (stored) try { state.cart = JSON.parse(stored); } catch {}
  sel('cartBadge').addEventListener('click', () => openBuy(state.cart[0]?.id));
}
function updateCartBadge() {
  const n = state.cart.reduce((a, b) => a + b.qty, 0);
  sel('cartBadge').textContent = n;
  sel('cartBadge').style.display = n > 0 ? 'flex' : 'none';
  localStorage.setItem('mxh_cart', JSON.stringify(state.cart));
}

function initAuth() {
  const stored = localStorage.getItem('mxh_user');
  if (stored) try { state.user = JSON.parse(stored); } catch {}
  sel('accountBtn').addEventListener('click', () => openModal('accountModal'));
  sel('accClose').addEventListener('click', () => closeModal('accountModal'));
  sel('tabLogin').addEventListener('click', () => {
    sel('tabLogin').classList.add('active'); sel('tabReg').classList.remove('active');
    sel('loginForm').style.display = 'block'; sel('regForm').style.display = 'none';
  });
  sel('tabReg').addEventListener('click', () => {
    sel('tabReg').classList.add('active'); sel('tabLogin').classList.remove('active');
    sel('regForm').style.display = 'block'; sel('loginForm').style.display = 'none';
  });
  sel('switchToLogin').addEventListener('click', (e) => { e.preventDefault(); sel('tabLogin').click(); });
  sel('btnLogin').addEventListener('click', () => {
    const u = sel('lUser').value.trim(), p = sel('lPass').value.trim();
    if (!u || !p) return alert('Enter phone/email and password');
    state.user = { name: u, phone: u };
    localStorage.setItem('mxh_user', JSON.stringify(state.user));
    closeModal('accountModal');
    alert('Logged in as ' + u);
  });
  sel('btnReg').addEventListener('click', () => {
    const n = sel('rName').value.trim(), u = sel('rUser').value.trim(), p = sel('rPass').value.trim();
    if (!n || !u || !p) return alert('Fill all fields');
    state.user = { name: n, phone: u };
    localStorage.setItem('mxh_user', JSON.stringify(state.user));
    closeModal('accountModal');
    alert('Account created for ' + n);
  });
}

function openModal(id) { sel('overlay').classList.add('open'); sel(id).classList.add('open'); }
function closeModal(id) { sel('overlay').classList.remove('open'); sel(id).classList.remove('open'); }
sel('overlay').addEventListener('click', (e) => { if (e.target === sel('overlay')) { closeModal('buyModal'); closeModal('orderModal'); closeModal('accountModal'); } });

function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function openBuy(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  state.currentProduct = p;
  state.currentVariant = VARIANTS[0];
  state.currentKeyType = KEY_TYPES[0];
  state.currentQty = 1;
  state.currentPayment = PAYMENTS[0];
  state.coupon = null;
  state.discount = 0;
  sel('buyImg').innerHTML = `<div class="placeholder"><i class="${ICON_MAP[p.c] || 'fas fa-cube'}"></i></div>`;
  sel('buyCat').textContent = p.c;
  sel('buyName').textContent = p.n;
  sel('buyPrice').textContent = fmt(conv(p.p * state.currentVariant.mult * state.currentQty)) + ' ' + curSym();
  sel('buyPriceAlt').textContent = '≈ ৳' + fmt(p.p * state.currentVariant.mult * state.currentQty);
  sel('buyVerified').innerHTML = p.v ? '<i class="fas fa-check-circle"></i> Verified Seller' : '';
  document.querySelectorAll('.step').forEach((s, i) => s.classList.toggle('active', i === 0));
  document.getElementById('prog1').style.width = '33%'; document.getElementById('prog2').style.width = '0%';
  showBuyStep(1);
  openModal('buyModal');
}

function showBuyStep(step) {
  document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
  const c = sel('step' + step); if (c) c.classList.add('active');
  document.querySelectorAll('.step').forEach((s, i) => s.classList.toggle('active', i < step));
  const prog = step === 1 ? 33 : step === 2 ? 66 : 100;
  document.getElementById('prog1').style.width = step > 1 ? '100%' : '33%';
  document.getElementById('prog2').style.width = step > 2 ? '100%' : (step === 2 ? '66%' : '0%');
  sel('buyFooter').innerHTML = '';
  if (step === 1) renderStep1();
  if (step === 2) renderStep2();
  if (step === 3) renderStep3();
}

function renderStep1() {
  const p = state.currentProduct;
  const base = p.p * state.currentVariant.mult * state.currentQty;
  const disc = state.coupon ? (base * state.discount / 100) : 0;
  const final = base - disc;
  let html = `
    <div class="cur-select">
      <label>Currency</label>
      <select id="curSelect">${Object.entries(CURRENCIES).map(([code, c]) => `<option value="${code}" ${code === state.currency ? 'selected' : ''}>${c.symbol} ${c.name}</option>`).join('')}</select>
    </div>
    <div class="quantity-wrap"><label>Quantity</label><input type="number" id="qtyInput" value="${state.currentQty}" min="1"></div>
    <div class="keytype-wrap"><label>Key Type</label><select id="keyType">${KEY_TYPES.map(k => `<option value="${k.key}" ${k.key === state.currentKeyType.key ? 'selected' : ''}>${k.label}</option>`).join('')}</select></div>
    <div class="androidid-wrap" id="androidWrap"><label>Android ID</label><input type="text" id="androidId" placeholder="Enter Android ID (e.g. 1234567890abcdef)"></div>
    <div class="coupon-wrap"><input type="text" id="couponInput" placeholder="Coupon code (e.g. SAVE10)"><button id="btnCoupon">Apply</button></div>
    <div class="totals"><span class="t-label">Total</span><span class="t-val" id="totalVal">${fmt(conv(final))} ${curSym()}</span></div>
    ${state.coupon ? `<div class="discount show">Coupon applied: -${state.discount}%</div>` : ''}
    <div class="payment-list">${PAYMENTS.map(pm => `
      <div class="payment-item${state.currentPayment.id === pm.id ? ' selected' : ''}" data-pm="${pm.id}">
        <input type="radio" name="pm" value="${pm.id}" ${state.currentPayment.id === pm.id ? 'checked' : ''}>
        <div class="pm-icon"><i class="${pm.icon}"></i></div>
        <label>${pm.label}</div>
      </div>
    `).join('')}</div>
  `;
  sel('buyContent').innerHTML = html;
  sel('buyFooter').innerHTML = `<button class="btn-cancel">Back</button><button class="btn-full" id="btnNext1">Next →</button>`;
  sel('curSelect').addEventListener('change', (e) => { state.currency = e.target.value; updateBuyTotal(); });
  sel('qtyInput').addEventListener('input', (e) => { state.currentQty = Math.max(1, parseInt(e.target.value) || 1); updateBuyTotal(); });
  sel('keyType').addEventListener('change', (e) => {
    state.currentKeyType = KEY_TYPES.find(k => k.key === e.target.value);
    sel('androidWrap').classList.toggle('show', state.currentKeyType.key === 'device');
  });
  sel('androidWrap').classList.toggle('show', state.currentKeyType.key === 'device');
  sel('btnCoupon').addEventListener('click', () => {
    const code = sel('couponInput').value.trim().toUpperCase();
    if (COUPONS[code]) { state.coupon = code; state.discount = COUPONS[code]; updateBuyTotal(); }
    else alert('Invalid coupon code');
  });
  sel('buyContent').querySelectorAll('.payment-item').forEach(it => {
    it.addEventListener('click', () => {
      sel('buyContent').querySelectorAll('.payment-item').forEach(x => x.classList.remove('selected'));
      it.classList.add('selected');
      state.currentPayment = PAYMENTS.find(p => p.id === it.dataset.pm);
    });
  });
  sel('btnNext1').addEventListener('click', () => {
    if (state.currentKeyType.key === 'device' && !sel('androidId').value.trim()) return alert('Enter Android ID');
    showBuyStep(2);
  });
}

function updateBuyTotal() {
  const p = state.currentProduct;
  const base = p.p * state.currentVariant.mult * state.currentQty;
  const disc = state.coupon ? (base * state.discount / 100) : 0;
  const final = base - disc;
  sel('totalVal').textContent = fmt(conv(final)) + ' ' + curSym();
  sel('buyPrice').textContent = fmt(conv(final)) + ' ' + curSym();
  sel('buyPriceAlt').textContent = '≈ ৳' + fmt(final);
}

function renderStep2() {
  const p = state.currentProduct;
  const base = p.p * state.currentVariant.mult * state.currentQty;
  const disc = state.coupon ? (base * state.discount / 100) : 0;
  const final = base - disc;
  let html = `
    <div class="cur-select">
      <label>Pay with</label>
      <select id="curSelect2">${Object.entries(CURRENCIES).map(([code, c]) => `<option value="${code}" ${code === state.currency ? 'selected' : ''}>${c.symbol} ${c.name}</option>`).join('')}</select>
    </div>
    <div class="totals"><span class="t-label">Order Total</span><span class="t-val">${fmt(conv(final))} ${curSym()}</span></div>
    <div class="payment-list">${PAYMENTS.map(pm => `
      <div class="payment-item${state.currentPayment.id === pm.id ? ' selected' : ''}" data-pm="${pm.id}">
        <input type="radio" name="pm" value="${pm.id}" ${state.currentPayment.id === pm.id ? 'checked' : ''}>
        <div class="pm-icon"><i class="${pm.icon}"></i></div>
        <label>${pm.label}</div>
      </div>
    `).join('')}</div>
    <div class="androidid-wrap show"><label>Send Payment To</label>
      <div style="background:#05070a;border:1px solid var(--border);border-radius:6px;padding:10px;font-size:12px;color:var(--text2);margin-top:6px;word-break:break-all">
        ${state.currentPayment.id === 'binance' ? 'Binance Pay ID: 8812345678' :
          state.currentPayment.id === 'bkash' ? 'bKash: 017xxxxxxxx' :
          state.currentPayment.id === 'nagad' ? 'Nagad: 017xxxxxxxx' :
          'USDT (TRC20): Txxxxxxxxxxxxxxxxxxxx'}
      </div>
    </div>
  `;
  sel('buyContent').innerHTML = html;
  sel('buyFooter').innerHTML = `<button class="btn-cancel">Back</button><button class="btn-full" id="btnNext2">Confirm Payment</button>`;
  sel('curSelect2').addEventListener('change', (e) => { state.currency = e.target.value; sel('buyContent').querySelector('.t-val').textContent = fmt(conv(base - disc)) + ' ' + curSym(); });
  sel('buyContent').querySelectorAll('.payment-item').forEach(it => {
    it.addEventListener('click', () => {
      sel('buyContent').querySelectorAll('.payment-item').forEach(x => x.classList.remove('selected'));
      it.classList.add('selected');
      state.currentPayment = PAYMENTS.find(p => p.id === it.dataset.pm);
      sel('buyContent').querySelector('.androidid-wrap.show').innerHTML = `<label>Send Payment To</label>
        <div style="background:#05070a;border:1px solid var(--border);border-radius:6px;padding:10px;font-size:12px;color:var(--text2);margin-top:6px;word-break:break-all">
          ${state.currentPayment.id === 'binance' ? 'Binance Pay ID: 8812345678' :
            state.currentPayment.id === 'bkash' ? 'bKash: 017xxxxxxxx' :
            state.currentPayment.id === 'nagad' ? 'Nagad: 017xxxxxxxx' :
            'USDT (TRC20): Txxxxxxxxxxxxxxxxxxxx'}
        </div>`;
    });
  });
  sel('btnNext2').addEventListener('click', () => showBuyStep(3));
}

function renderStep3() {
  const p = state.currentProduct;
  const base = p.p * state.currentVariant.mult * state.currentQty;
  const disc = state.coupon ? (base * state.discount / 100) : 0;
  const final = base - disc;
  let html = `
    <div class="totals"><span class="t-label">Final Amount</span><span class="t-val">${fmt(conv(final))} ${curSym()}</span></div>
    <div class="androidid-wrap show"><label>Payment Method</label>
      <div style="background:#05070a;border:1px solid var(--border);border-radius:6px;padding:10px;font-size:12px;color:var(--text);margin-top:6px">
        ${state.currentPayment.label}
      </div>
    </div>
    <div class="androidid-wrap show" style="margin-top:10px"><label>Android ID</label>
      <div style="background:#05070a;border:1px solid var(--border);border-radius:6px;padding:10px;font-size:12px;color:var(--text);margin-top:6px;word-break:break-all">
        ${state.currentKeyType.key === 'device' ? (sel('androidId') ? sel('androidId').value : 'N/A') : 'Direct Key (no ID needed)'}
      </div>
    </div>
    ${state.user ? `<div class="androidid-wrap show" style="margin-top:10px"><label>Account</label>
      <div style="background:#05070a;border:1px solid var(--border);border-radius:6px;padding:10px;font-size:12px;color:var(--text);margin-top:6px">${state.user.name}</div>
    </div>` : `<div class="androidid-wrap show" style="margin-top:10px"><label>Login Required</label>
      <div style="background:#05070a;border:1px solid var(--border);border-radius:6px;padding:10px;font-size:12px;color:var(--text2);margin-top:6px">Please login to place order</div>
    </div>`}
  `;
  sel('buyContent').innerHTML = html;
  sel('buyFooter').innerHTML = state.user
    ? `<button class="btn-cancel">Back</button><button class="btn-full" id="btnPay">Pay Now</button>`
    : `<button class="btn-cancel">Back</button><button class="btn-full" id="btnLoginReq">Login First</button>`;
  sel('btnPay').addEventListener('click', () => placeOrder());
  sel('btnLoginReq').addEventListener('click', () => { closeModal('buyModal'); openModal('accountModal'); });
}

function placeOrder() {
  const p = state.currentProduct;
  const base = p.p * state.currentVariant.mult * state.currentQty;
  const disc = state.coupon ? (base * state.discount / 100) : 0;
  const final = base - disc;
  const orderId = 'PS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  const order = {
    id: orderId, product: p.n, amount: final, currency: state.currency,
    payment: state.currentPayment.label, status: 'Processing', time: new Date().toISOString(),
  };
  const orders = JSON.parse(localStorage.getItem('mxh_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('mxh_orders', JSON.stringify(orders));
  state.cart.push({ id: p.id, name: p.n, qty: state.currentQty, price: final });
  updateCartBadge();
  sel('ordId').textContent = orderId;
  sel('ordProd').textContent = p.n;
  sel('ordAmt').textContent = fmt(conv(final)) + ' ' + curSym();
  sel('ordPay').textContent = state.currentPayment.label;
  closeModal('buyModal');
  openModal('orderModal');
}

function openOrderTracking() {
  const orders = JSON.parse(localStorage.getItem('mxh_orders') || '[]');
  if (!orders.length) return alert('No orders found. Place an order first.');
  const o = orders[0];
  sel('ordId').textContent = o.id;
  sel('ordProd').textContent = o.product;
  sel('ordAmt').textContent = fmt(conv(o.amount)) + ' ' + curSym();
  sel('ordPay').textContent = o.payment;
  sel('ordTitle').textContent = 'Order Tracking';
  sel('ordStatus').innerHTML = `<i class="fas fa-clock"></i> ${o.status}`;
  openModal('orderModal');
}
