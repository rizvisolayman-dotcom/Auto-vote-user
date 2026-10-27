const API = '';

const CATEGORIES = ['All', 'ANDROID', 'ANDROID PROXY', 'ANDROID ROOT', 'GUILD GLORY', 'IOS HACK', 'PC HACK'];
const ICON_MAP = {
  ANDROID: 'fab fa-android',
  'ANDROID PROXY': 'fas fa-globe',
  'ANDROID ROOT': 'fas fa-terminal',
  'GUILD GLORY': 'fas fa-crown',
  'IOS HACK': 'fab fa-apple',
  'PC HACK': 'fab fa-windows'
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
const CURRENCIES = {
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', rate: 1 },
  USDT: { symbol: 'USDT', name: 'US Dollar', rate: 125 },
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 1 }
};

let state = {
  currency: localStorage.getItem('mxh_currency') || 'BDT',
  user: null,
  cart: [],
  products: [],
  currentProduct: null,
  currentVariant: VARIANTS[0],
  currentKeyType: KEY_TYPES[0],
  currentQty: 1,
  currentPayment: PAYMENTS[0],
  coupon: null,
  discount: 0
};

const sel = (id) => document.getElementById(id);
const fmt = (v) => parseFloat(v || 0).toFixed(2);
const conv = (bdt) => bdt / CURRENCIES[state.currency].rate;
const curSym = () => CURRENCIES[state.currency].symbol;
const esc = (t) => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

async function api(path, method = 'GET', body = null, auth = false) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (auth && state.user && state.user.token) opts.headers['Authorization'] = state.user.token;
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(API + path, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.message || 'Request failed');
  return j;
}

async function init() {
  // Currency from localStorage
  const savedCur = localStorage.getItem('mxh_currency');
  if (savedCur && CURRENCIES[savedCur]) state.currency = savedCur;
  const savedUser = localStorage.getItem('mxh_user');
  if (savedUser) {
    try { state.user = JSON.parse(savedUser); } catch {}
  }
  // Load products
  try {
    const r = await api('/api/products');
    state.products = r.products || [];
  } catch (e) { console.warn('Products load failed', e); }
  renderCategories();
  renderProducts(state.currency === 'All' ? 'All' : state.currency === 'All' ? 'All' : 'All');
  // Init UI
  initSlider();
  initTheme();
  initAnnounce();
  initSearch();
  initCartBadge();
  sel('loader').classList.add('done');
  renderCurrencyPill();
  // Auto categories already rendered
}
function renderCategories() {
  const cats = ['All', ...new Set(state.products.map(p => p.category))];
  const el = sel('catTabs');
  el.innerHTML = cats.map((c, i) =>
    `<button class="cat-tab${i === 0 ? ' active' : ''}" data-c="${esc(c)}"><i class="fas fa-layer-group"></i> ${esc(c)}</button>`
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
  const list = cat === 'All' ? state.products : state.products.filter(p => p.category === cat);
  if (list.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text2);">No products found.</div>';
    return;
  }
  el.innerHTML = list.map(p => {
    const icon = ICON_MAP[p.category] || 'fas fa-cube';
    const price = fmt(conv(p.price));
    return `
      <div class="product">
        <div class="product-header">
          <div class="product-icon"><i class="${icon}"></i></div>
          <div class="product-title">
            <span class="product-name">${esc(p.name)}</span>
            ${p.verified ? '<span class="product-verified"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
          </div>
        </div>
        <div class="product-img"><div class="placeholder"><i class="${icon}"></i></div></div>
        <div class="product-body">Premium ${esc(p.name)} panel with instant delivery and 24/7 support.</div>
        <div class="product-footer">
          <div class="product-price"><i class="fas fa-tag"></i> From <span>${price}</span> ${curSym()}</div>
          <button class="product-buy" data-id="${p.id}">Buy Now <i class="fas fa-arrow-right"></i></button>
        </div>
        <div class="product-tags">${p.category}</div>
      </div>
    `;
  }).join('');
  el.querySelectorAll('.product-buy').forEach(btn => {
    btn.addEventListener('click', () => openBuy(parseInt(btn.dataset.id)));
  });
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
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    dotsEls.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }
  sel('slidePrev').addEventListener('click', () => goSlide((state.slideIndex - 1 + slides.length) % slides.length));
  sel('slideNext').addEventListener('click', () => goSlide((state.slideIndex + 1) % slides.length));
  setInterval(() => goSlide((state.slideIndex + 1) % slides.length), 4000);
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
function initSearch() {
  sel('searchBtn').addEventListener('click', () => {
    const q = sel('searchInput').value.trim().toLowerCase();
    if (!q) { renderProducts('All'); return; }
    const filtered = state.products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    renderProductsFiltered(filtered);
    sel('catHeaderText').textContent = 'Search: ' + esc(q));
  });
}
function renderProductsFiltered(list) {
  const el = sel('products');
  if (list.length === 0) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text2);">No products found.</div>'; return; }
  el.innerHTML = list.map(p => {
    const icon = ICON_MAP[p.category] || 'fas fa-cube';
    const price = fmt(conv(p.price));
    return `
      <div class="product">
        <div class="product-header">
          <div class="product-icon"><i class="${icon}"></i></div>
          <div class="product-title">
            <span class="product-name">${esc(p.name)}</span>
            ${p.verified ? '<span class="product-verified"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
          </div>
        </div>
        <div class="product-img"><div class="placeholder"><i class="${icon}"></i></div></div>
        <div class="product-body">Premium ${esc(p.name)} panel with instant delivery and 24/7 support.</div>
        <div class="product-footer">
          <div class="product-price"><i class="fas fa-tag"></i> From <span>${price}</span> ${curSym()}</div>
          <button class="product-buy" data-id="${p.id}">Buy Now <i class="fas fa-arrow-right"></i></button>
        </div>
        <div class="product-tags">${p.category}</div>
      </div>
    `;
  }).join('');
  el.querySelectorAll('.product-buy').forEach(btn => {
    btn.addEventListener('click', () => openBuy(parseInt(btn.dataset.id)));
  });
}
function renderCurrencyPill() {
  const c = CURRENCIES[state.currency];
  sel('currencyPill').innerHTML = `<span class="cur-label">${c.symbol}</span> <span class="cur-arrow"><i class="fas fa-chevron-down"></i></span>`;
  sel('currencyPill').addEventListener('click', () => {
    const dropdown = sel('currencyDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });
  sel('currencyDropdown').querySelectorAll('.cur-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      state.currency = opt.dataset.code;
      localStorage.setItem('mxh_currency', state.currency);
      renderCurrencyPill();
      renderProducts(sel('catHeaderText').textContent === 'All Products' ? 'All' : sel('catHeaderText').textContent);
      dropdown.style.display = 'none';
      if (sel('buyModal').classList.contains('open')) updateBuyTotal();
    });
  });
  document.addEventListener('click', (e) => {
    if (!sel('currencyPill').contains(e.target) && !sel('currencyDropdown').contains(e.target)) sel('currencyDropdown').style.display = 'none';
  });
}
function initCartBadge() {
  sel('cartBadge').addEventListener('click', () => {
    if (!state.user) { openModal('accountModal'); return; }
    openModal('buyModal');
  });
}
function updateCartBadge() {
  const n = state.cart.reduce((a, b) => a + b.quantity, 0);
  sel('cartBadge').textContent = n;
  sel('cartBadge').style.display = n > 0 ? 'flex' : 'none';
}

/* ---------- Auth ---------- */
async function initAuth() {
  sel('accountBtn').addEventListener('click', () => {
    if (state.user) openModal('accountModal');
    else openModal('accountModal');
  });
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

  sel('btnLogin').addEventListener('click', async () => {
    const u = sel('lUser').value.trim(), p = sel('lPass').value.trim();
    if (!u || !p) return alert('Enter phone/email and password');
    try {
      const r = await api('/api/login', 'POST', { email: u, password: p });
      state.user = { ...r.user, token: r.token };
      localStorage.setItem('mxh_user', JSON.stringify(state.user));
      closeModal('accountModal');
      updateAuthUI();
      alert('Logged in as ' + state.user.name);
    } catch (e) { alert(e.message); }
  });
  sel('btnReg').addEventListener('click', async () => {
    const n = sel('rName').value.trim(), u = sel('rUser').value.trim(), p = sel('rPass').value.trim();
    if (!n || !u || !p) return alert('Fill all fields');
    try {
      const r = await api('/api/register', 'POST', { name: n, email: u, password: p });
      state.user = { ...r.user, token: r.token };
      localStorage.setItem('mxh_user', JSON.stringify(state.user));
      closeModal('accountModal');
      updateAuthUI();
      alert('Account created for ' + state.user.name);
    } catch (e) { alert(e.message); }
  });
}
function updateAuthUI() {
  if (state.user) {
    sel('accountBtn').innerHTML = `<i class="fas fa-user-check"></i> <em>${esc(state.user.name)}</em>`;
  }
}

/* ---------- Modal Helpers ---------- */
function openModal(id) { sel('overlay').classList.add('open'); sel(id).classList.add('open'); }
function closeModal(id) { sel('overlay').classList.remove('open'); sel(id).classList.remove('open'); }
sel('overlay').addEventListener('click', (e) => {
  if (e.target === sel('overlay')) { closeModal('buyModal'); closeModal('orderModal'); closeModal('accountModal'); }
});

/* ---------- Buy Flow ---------- */
async function openBuy(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  state.currentProduct = p;
  state.currentVariant = VARIANTS[0];
  state.currentKeyType = KEY_TYPES[0];
  state.currentQty = 1;
  state.currentPayment = PAYMENTS[0];
  state.coupon = null;
  state.discount = 0;
  sel('buyImg').innerHTML = `<div class="placeholder"><i class="${ICON_MAP[p.category] || 'fas fa-cube'}"></i></div>`;
  sel('buyCat').textContent = p.category;
  sel('buyName').textContent = p.name;
  updateBuyTotal();
  sel('buy-verified').innerHTML = p.verified ? '<i class="fas fa-check-circle"></i> Verified Seller' : '';
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
  const base = p.price * state.currentVariant.mult * state.currentQty;
  const disc = state.coupon ? (base * state.discount / 100) : 0;
  const final = base - disc;
  let html = `
    <div class="cur-select">
      <label>Currency</label>
      <select id="curSelect">${Object.entries(CURRENCIES).map(([code, c]) => `<option value="${code}" ${code === state.currency ? 'selected' : ''}>${c.symbol} ${c.name}</option>`).join('')}</select>
    </div>
    <div class="quantity-wrap"><label>Quantity</label><input type="number" id="qtyInput" value="${state.currentQty}" min="1"></div>
    <div class="keytype-wrap"><label>Key Type</label><select id="keyType">${KEY_TYPES.map(k => `<option value="${k.key}" ${k.key === state.currentKeyType.key ? 'selected' : ''}>${k.label}</option>`).join('')}</select></div>
    <div class="androidid-wrap" id="androidWrap"${state.currentKeyType.key === 'device' ? ' class="show"' : ''}><label>Android ID</label><input type="text" id="androidId" placeholder="Enter Android ID"></div>
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
    if (code === 'SAVE10') { state.coupon = code; state.discount = 10; updateBuyTotal(); }
    else if (code === 'PANEL50') { state.coupon = code; state.discount = 50; updateBuyTotal(); }
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
  const base = p.price * state.currentVariant.mult * state.currentQty;
  const disc = state.coupon ? (base * state.discount / 100) : 0;
  const final = base - disc;
  sel('totalVal').textContent = fmt(conv(final)) + ' ' + curSym();
  sel('buyPrice').textContent = fmt(conv(final)) + ' ' + curSym();
  sel('buyPriceAlt').textContent = '≈ ৳' + fmt(final);
}
function renderStep2() {
  const p = state.currentProduct;
  const base = p.price * state.currentVariant.mult * state.currentQty;
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
      const methodDiv = sel('buyContent').querySelector('.androidid-wrap.show');
      if (methodDiv) methodDiv.innerHTML = `<label>Send Payment To</label>
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
  const base = p.price * state.currentVariant.mult * state.currentQty;
  const disc = state.coupon ? (base * state.discount / 100) : 0;
  const final = base - disc;
  let html = `
    <div class="totals"><span class="t-label">Final Amount</span><span class="t-val">${fmt(conv(final))} ${curSym()}</span></div>
    <div class="androidid-wrap show"><label>Payment Method</label>
      <div style="background:#05070a;border:1px solid var(--border);border-radius:6px;padding:10px;font-size:12px;color:var(--text);margin-top:6px">${state.currentPayment.label}</div>
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
  sel('btnPay').addEventListener('click', async () => {
    try {
      const p = state.currentProduct;
      const base = p.price * state.currentVariant.mult * state.currentQty;
      const disc = state.coupon ? (base * state.discount / 100) : 0;
      const final = base - disc;
      const r = await api('/api/checkout', 'POST', {
        items: [{ product_id: p.id, variant: state.currentVariant.key, quantity: state.currentQty }],
        coupon: state.coupon || '',
        payment_method: state.currentPayment.label
      }, true);
      sel('ordId').textContent = r.order_id;
      sel('ordProd').textContent = p.name;
      sel('ordAmt').textContent = fmt(conv(final)) + ' ' + curSym();
      sel('ordPay').textContent = state.currentPayment.label;
      closeModal('buyModal');
      openModal('orderModal');
    } catch (e) { alert(e.message); }
  });
  sel('btnLoginReq').addEventListener('click', () => { closeModal('buyModal'); openModal('accountModal'); });
}

/* ---------- Order Tracking ---------- */
function openOrderTracking() {
  if (!state.user) { openModal('accountModal'); return; }
  sel('ordTitle').textContent = 'Order Tracking';
  sel('ordStatus').innerHTML = `<i class="fas fa-clock"></i> Loading...`;
  openModal('orderModal');
  api('/api/orders', 'GET', null, true).then(r => {
    const orders = r.orders || [];
    if (!orders.length) { sel('ordStatus').innerHTML = `<i class="fas fa-exclamation-circle"></i> No orders`; return; }
    const o = orders[0];
    sel('ordId').textContent = o.order_id;
    sel('ordProd').textContent = o.product_name;
    sel('ordAmt').textContent = fmt(conv(o.amount)) + ' ' + curSym();
    sel('ordPay').textContent = o.payment_method;
    sel('ordStatus').innerHTML = `<i class="fas fa-${o.status === 'completed' ? 'check-circle' : o.status === 'pending' ? 'clock' : 'exclamation-circle'}"></i> ${o.status}`;
  }).catch(() => { sel('ordStatus').innerHTML = `<i class="fas fa-exclamation-circle"></i> Load failed`; });
}

/* ---------- Admin ---------- */
function initAdmin() {
  sel('adminBtn').addEventListener('click', () => {
    if (!state.user || state.user.role !== 'admin') {
      alert('Admin access required');
      return;
    }
    loadAdminStats();
    openModal('adminModal');
  });
  sel('admClose').addEventListener('click', () => closeModal('adminModal'));
  sel('admTabDeposits').addEventListener('click', () => { loadAdminDeposits(); });
  sel('admTabOrders').addEventListener('click', () => { loadAdminOrders(); });
  sel('admTabStats').addEventListener('click', () => { loadAdminStats(); });
}

async function loadAdminStats() {
  try {
    const r = await api('/api/admin/stats', 'GET', null, true);
    sel('admBadge').textContent = r.pendingDeposits || 0;
    sel('admTabDeposits').click();
  } catch (e) { console.error(e); }
}

async function loadAdminDeposits() {
  setAdminTab('admTabDeposits');
  try {
    const r = await api('/api/admin/deposits', 'GET', null, true);
    const list = r.list || [];
    let html = '<table style="width:100%;border-collapse:collapse"><thead><tr><th>Code</th><th>User</th><th>Amount</th><th>Trx</th><th>Method</th><th>Status</th><th>Action</th></tr></thead><tbody>';
    for (const d of list) {
      html += `<tr>
        <td>${esc(d.code)}</td><td>${esc(d.user_email)}</td><td>${fmt(conv(d.amount))} ${curSym()}</td><td>${esc(d.trx)}</td><td>${esc(d.method)}</td>
        <td><span class="status-${d.status}">${esc(d.status)}</span></td>
        <td>${d.status === 'pending' ? `<button class="btn-sm" onclick="actDeposit('${esc(d.code)}','approve')">Approve</button> <button class="btn-cancel" onclick="actDeposit('${esc(d.code)}','reject')">Reject</button>` : ''}</td>
      </tr>`;
    }
    html += '</tbody></table>';
    sel('admContent').innerHTML = html || '<div style="text-align:center;color:var(--text2);padding:20px">No deposits</div>';
  } catch (e) { sel('admContent').innerHTML = '<div style="color:var(--danger)">Error loading deposits</div>'; }
}

async function loadAdminOrders() {
  setAdminTab('admTabOrders');
  try {
    const r = await api('/api/admin/orders', 'GET', null, true);
    const orders = r.orders || [];
    let html = '<table style="width:100%;border-collapse:collapse"><thead><tr><th>Order ID</th><th>User</th><th>Product</th><th>Amount</th><th>Method</th><th>Status</th><th>Action</th></tr></thead><tbody>';
    for (const o of orders) {
      html += `<tr>
        <td>${esc(o.order_id)}</td><td>${esc(o.user_email)}</td><td>${esc(o.product_name)}</td>
        <td>${fmt(conv(o.amount))} ${curSym()}</td><td>${esc(o.payment_method)}</td>
        <td><span class="status-${o.status}">${esc(o.status)}</span></td>
        <td><select class="status-select" data-oid="${esc(o.order_id)}"><option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option><option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option><option value="rejected" ${o.status === 'rejected' ? 'selected' : ''}>Rejected</option></select></td>
      </tr>`;
    }
    html += '</tbody></table>';
    sel('admContent').innerHTML = html || '<div style="text-align:center;color:var(--text2);padding:20px">No orders</div>';
    sel('admContent').querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        actOrder(sel.dataset.oid, sel.value);
      });
    });
  } catch (e) { sel('admContent').innerHTML = '<div style="color:var(--danger)">Error loading orders</div>'; }
}

async function actDeposit(code, action) {
  try {
    await api('/api/admin/deposits/act', 'POST', { code, action }, true);
    loadAdminDeposits();
  } catch (e) { alert(e.message); }
}

async function actOrder(orderId, status) {
  try {
    await api('/api/admin/orders/act', 'POST', { orderId, status }, true);
    loadAdminOrders();
  } catch (e) { alert(e.message); }
}

async function loadAdminStats() {
  try {
    const r = await api('/api/admin/stats', 'GET', null, true);
    sel('admBadge').textContent = r.pendingDeposits || 0;
    sel('admTabDeposits').click();
  } catch (e) { console.error(e); }
}

function setAdminTab(tabId) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  sel(tabId).classList.add('active');
}

// Add admin click handler
sel('adminBtn').addEventListener('click', () => {
  if (!state.user || state.user.role !== 'admin') {
    alert('Admin access required');
    return;
  }
  loadAdminStats();
  openModal('adminModal');
});

init();
