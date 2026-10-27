// ==UserScript==
// @name         SOLAYMAN X CHEAT — Auto Restock
// @namespace    https://solaymanxcheat.rf.gd/
// @version      1.5
// @description  licencedashboard theke key generate kore SOLAYMAN X CHEAT store-e automatic stock bhorte paro
// @match        https://licencedashboard.shop/*
// @match        https://www.licencedashboard.shop/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

const CFG = {
  STORE: 'https://solaymanxcheat.rf.gd/api.php',
  CHANNEL: 'https://solaymanxcheat.rf.gd/stockpush.html',
  SECRET: '[REDACTED_STOCK_SECRET]',
  TARGET: 30,          // thek theke kom hole generate korbe
  BATCH: 15,           // ekbar joto key
  PRODUCT_TEXT: '',    // '' = panel er current selection thakbe
  DUMP: true           // panel info amar store-e pathay
};

(function () {
  const KEYRE = /\b[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}\b/gi;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clean = t => (t || '').replace(/\s+/g, ' ').trim();

  const getPop = () => {
    if (window.__LDPOP && !window.__LDPOP.closed) return window.__LDPOP;
    try { const w = window.open('', 'LDCK'); if (w) { window.__LDPOP = w; return w; } } catch (e) {}
    return null;
  };

  // popup (first-party) diye API call — 3rd-party cookie block holeo kaj kore
  const rpc = (win, action, payload) => new Promise(resolve => {
    const id = 'ld' + Date.now() + Math.random().toString(36).slice(2, 7);
    let done = false;
    const onMsg = (e) => {
      if (e.source !== win) return;
      const d = e.data;
      if (!d || d.ld_rid !== id) return;
      done = true;
      window.removeEventListener('message', onMsg);
      resolve(d.data);
    };
    window.addEventListener('message', onMsg);
    try {
      win.postMessage({ ld_rpc: 1, ld_rid: id, action: action, body: payload, secret: CFG.SECRET }, '*');
    } catch (e) {
      window.removeEventListener('message', onMsg);
      resolve(undefined);
      return;
    }
    setTimeout(() => {
      if (done) return;
      window.removeEventListener('message', onMsg);
      resolve(undefined);
    }, 4000);
  });

  // GET = preflight-free, POST = text/plain + credentials; popup RPC first, direct fallback
  const api = async (action, body) => {
    const isPost = body !== undefined && body !== null;
    const payload = isPost ? Object.assign({ secret: CFG.SECRET }, body) : null;
    const win = getPop();
    if (win) {
      const r = await rpc(win, action, payload);
      if (r && r.ok !== undefined) return r;
    }
    try {
      const url = CFG.STORE + '?action=' + action + (isPost ? '' : '&secret=' + encodeURIComponent(CFG.SECRET));
      const opts = isPost
        ? { method: 'POST', headers: { 'Content-Type': 'text/plain' }, credentials: 'include',
            body: JSON.stringify(Object.assign({ secret: CFG.SECRET }, body)) }
        : { method: 'GET', credentials: 'include' };
      const res = await fetch(url, opts);
      return await res.json();
    } catch (e) {
      return { ok: false, msg: 'store unreachable' };
    }
  };

  const toast = (msg, bad) => {
    try {
      const d = document.createElement('div');
      d.textContent = msg;
      d.style.cssText = 'position:fixed;z-index:2147483647;top:' + (bad ? 72 : 14) +
        'px;right:14px;background:' + (bad ? '#b91c1c' : '#16a34a') +
        ';color:#fff;padding:11px 17px;border-radius:10px;font:700 14px/1.4 system-ui,sans-serif;' +
        'box-shadow:0 8px 28px rgba(0,0,0,.4);max-width:74vw';
      (document.body || document.documentElement).appendChild(d);
      setTimeout(() => d.remove(), 9000);
    } catch (e) {}
  };

  const dump = async (tag) => {
    if (!CFG.DUMP) return;
    if (sessionStorage.getItem('ld_dumped') === location.href + tag) return;
    try { sessionStorage.setItem('ld_dumped', location.href + tag); } catch (e) {}
    try {
      const links = [...document.querySelectorAll('a')]
        .map(a => clean(a.textContent).slice(0, 50) + ' -> ' + (a.getAttribute('href') || ''))
        .filter(s => s !== ' ->').slice(0, 150);
      const data = [
        'TAG: ' + tag,
        'TITLE: ' + document.title,
        'URL: ' + location.href,
        'TEXT:\n' + (document.body ? document.body.innerText : '').slice(0, 30000),
        'LINKS:\n' + links.join('\n'),
        'BUTTONS: ' + [...document.querySelectorAll('button,a,input[type=button],input[type=submit]')]
          .map(b => clean(b.textContent || b.value).slice(0, 60)).filter(Boolean).join(' | '),
        'SELECTS:\n' + [...document.querySelectorAll('select')]
          .map(s => (s.name || s.id || '?') + ' [' +
            [...s.options].map(o => clean(o.textContent).slice(0, 50)).join(' / ') + ']').join('\n'),
        'INPUTS: ' + [...document.querySelectorAll('input')]
          .map(i => (i.name || i.id || i.type || '?') + '(' + (i.type || '') + ')').join(', ')
      ].join('\n\n');
      await api('stock_dump', { data: data, url: location.href });
    } catch (e) {}
  };

  const findKeys = (txt) => [...new Set(((txt || '').match(KEYRE) || []))].map(k => k.toUpperCase());

  const pushKeys = async (keys) => {
    for (let i = 0; i < 8; i++) {
      const r = await api('stock_push', { keys: keys.join('\n') });
      if (r.ok) {
        toast('✔ ' + r.added + ' key stock-e chole gelo' + (r.skipped ? ' · ' + r.skipped + ' skipped' : ''));
        return true;
      }
      await sleep(2000);
    }
    toast('Stock push fail — abar tap koro', true);
    return false;
  };

  const harvest = async () => {
    for (let i = 0; i < 20; i++) {
      const keys = findKeys(document.body ? document.body.innerText : '');
      if (keys.length) {
        try { sessionStorage.removeItem('ld_gen'); } catch (e) {}
        await pushKeys(keys);
        return true;
      }
      const chk = (document.title + ' ' + (document.body ? document.body.innerText.slice(0, 600) : ''));
      if (!/Just a moment|Checking browser|SECURITY VALIDATION|Loading Security/i.test(chk) && i > 4) break;
      await sleep(1500);
    }
    try { sessionStorage.removeItem('ld_gen'); } catch (e) {}
    await dump('harvest-nokeys');
    toast('Generate fail — page dump hoyeche (balance/stock dekho)', true);
    return false;
  };

  const findGenerateBtn = () => [...document.querySelectorAll('button,a,input[type=button],input[type=submit],div[role=button]')]
    .find(b => /GENERATE\s*KEYS/i.test(clean(b.textContent || b.value)));

  const findByLabel = (re, tag) => {
    for (const lab of document.querySelectorAll('label,div,td,th,span,p,h1,h2,h3,h4,legend')) {
      const t = clean(lab.textContent);
      if (t.length < 60 && re.test(t)) {
        const scope = lab.closest('div,td,li,tr,fieldset') || lab.parentElement;
        if (scope) {
          const el = scope.querySelector(tag);
          if (el) return el;
        }
      }
    }
    return null;
  };

  const setNative = (el, prop, val) => {
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc && desc.set) desc.set.call(el, val); else el[prop] = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const ensureChannel = async () => {
    // bookmarklet popup already opened? (gesture-e khuleche)
    if (window.__LDPOP === undefined) {
      try { window.__LDPOP = window.open(CFG.CHANNEL, 'LDCK'); }
      catch (e) { window.__LDPOP = null; }
    }
    // wait: channel popup challenge pass korle cookie None hoye jabe / RPC live hoye jabe
    for (let i = 0; i < 20; i++) {
      const st = await api('stock_status');
      if (st && st.ok) { toast('✅ Channel OK — store connected'); return st; }
      await sleep(1500);
    }
    const blocked = (window.__LDPOP === null) ? ' Popup block hoise — chrome-e allow koro.' : '';
    toast('Store connect fail!' + blocked + ' Bookmark tap kore abar try koro.', true);
    return null;
  };

  const trigger = async (status) => {
    let btn = null;
    for (let i = 0; i < 25; i++) {
      btn = findGenerateBtn();
      if (btn) break;
      if (i === 8) await dump('waiting-generate');
      await sleep(1200);
    }
    if (!btn) {
      await dump('no-generate-btn');
      toast('Generator pawa jayni — panel info dump hoyeche', true);
      return;
    }

    const bodyTxt = document.body.innerText;

    const vSel = findByLabel(/VALIDITY/i, 'select');
    let price = null;
    if (vSel) {
      let opt = [...vSel.options].find(o => /^1\s*Day/i.test(clean(o.textContent)));
      if (!opt) opt = [...vSel.options].find(o => /\$\s*[\d.]+/.test(o.textContent)) || vSel.options[0];
      if (opt) {
        setNative(vSel, 'value', opt.value);
        const pm = clean(opt.textContent).match(/\$\s*([\d.]+)/);
        if (pm) price = parseFloat(pm[1]);
      }
    }

    const pSel = findByLabel(/PRODUCT\s*TYPE/i, 'select');
    if (pSel && CFG.PRODUCT_TEXT) {
      const po = [...pSel.options].find(o => clean(o.textContent).indexOf(CFG.PRODUCT_TEXT) !== -1);
      if (po) setNative(pSel, 'value', po.value);
    }

    let bal = null;
    const bm = bodyTxt.match(/Balance[^$\d]{0,25}\$\s*([\d.]+)/i) || bodyTxt.match(/\$\s*([\d.]+)/);
    if (bm) bal = parseFloat(bm[1]);

    let qty = Math.max(1, Math.min(CFG.BATCH, CFG.TARGET - (status.unused || 0)));
    if (price != null && bal != null) {
      if (bal < price) {
        await dump('low-balance');
        toast('Balance $' + bal + ' — key er daam $' + price + '. Wallet top-up koro!', true);
        return;
      }
      qty = Math.min(qty, Math.max(1, Math.floor(bal / price)));
    }

    const qIn = findByLabel(/QUANTITY/i, 'input');
    if (qIn) setNative(qIn, 'value', String(qty));

    await dump('trigger');

    const captured = [];
    try {
      const of = window.fetch;
      window.fetch = function () {
        const p = of.apply(this, arguments);
        p.then(r => r.clone().text().then(t => captured.push(t)).catch(() => {})).catch(() => {});
        return p;
      };
      const OX = XMLHttpRequest.prototype.open;
      const RS = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (m, u) {
        this.__ldurl = u;
        return OX.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function () {
        this.addEventListener('load', function () {
          try { captured.push(this.responseText); } catch (e) {}
        });
        return RS.apply(this, arguments);
      };
    } catch (e) {}

    try { sessionStorage.setItem('ld_gen', '1'); } catch (e) {}
    toast('Generating ' + qty + ' key…');

    btn.click();

    for (let i = 0; i < 14; i++) {
      await sleep(1500);
      if (!document.body) break;
      const keys = findKeys(captured.join('\n') + '\n' + document.body.innerText);
      if (keys.length) {
        try { sessionStorage.removeItem('ld_gen'); } catch (e) {}
        await pushKeys(keys);
        return;
      }
      if (!findGenerateBtn() && i > 3) break; // navigate hoyeche — next load-e harvest
    }
  };

  const main = async () => {
    if (!/(^|\.)licencedashboard\.shop$/.test(location.hostname)) return;
    if (sessionStorage.getItem('ld_busy') === '1') return;
    try { sessionStorage.setItem('ld_busy', '1'); } catch (e) {}
    toast('⚙️ AutoRestock chalu…');

    try {
      // pending harvest (ager click er result page)
      if (sessionStorage.getItem('ld_gen') === '1') {
        await harvest();
        return;
      }

      // channel + stock check
      const st = await ensureChannel();
      if (!st) return;
      if ((st.unused || 0) >= CFG.TARGET) { toast('✅ Stock thik ache (' + st.unused + ') — generate dorakar nai'); return; }

      await trigger(st);
    } finally {
      try { sessionStorage.removeItem('ld_busy'); } catch (e) {}
      // popup close protocol (jodi popup thake)
      try {
        const w = getPop();
        if (w) { w.postMessage({ ld_close: 1 }, '*'); setTimeout(() => { try { w.close(); } catch (e) {} }, 600); }
      } catch (e) {}
    }
  };

  setTimeout(main, 800);
  try { window.__LDREADY = 1; } catch (e) {}
})();
