<?php
require_once __DIR__ . '/lib.php';
session_start_safe();
$me = current_user();
$csrf = csrf_token();
$pay = pay_details();

$reset = null; $reset_err = '';
if (!empty($_GET['reset'])) {
  $tok = (string)$_GET['reset'];
  $st = db()->prepare('SELECT * FROM users WHERE reset_token = ? AND reset_exp > ?');
  $st->execute([hash('sha256', $tok), time()]);
  $ru = $st->fetch();
  if ($ru) $reset = ['token' => $tok, 'email' => $ru['email']];
  else $reset_err = 'This reset link is invalid or has already been used.';
}

$boot = [
  'user' => user_json($me),
  'csrf' => $csrf,
  'categories' => array_merge(['All'], array_column(db()->query('SELECT name FROM categories ORDER BY sort')->fetchAll(), 'name')),
  'products' => [],
  'coupons' => [],
  'settings' => ['binance' => pay_details()['binance'], 'telegram' => SITE['telegram'], 'gateway' => GATEWAY['enabled'], 'pay' => pay_details()],
  'reset' => $reset,
  'reset_err' => $reset_err,
  'base' => base_url(),
  'site' => SITE['name'],
  'demo' => SITE['demo_approve'],
];
foreach (db()->query('SELECT p.*, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.sort') as $p) {
  $vs = db()->prepare('SELECT id,label,mult,stock FROM variants WHERE product_id = ? ORDER BY id');
  $vs->execute([$p['id']]);
  $variants = $vs->fetchAll();
  $totalStock = array_sum(array_map(fn($v)=>(int)$v['stock'], $variants));
  $firstPrice = count($variants) ? (float)$p['price'] * (float)$variants[0]['mult'] : (float)$p['price'];
  $bdt = round($firstPrice * 122);
  $isMaint = stripos($p['tags'] ?? '', 'maintenance') !== false || stripos($p['tags'] ?? '', 'maint') !== false;
  $disc = $p['discount'] ?? 0;
  $boot['products'][] = [
    'id' => (int)$p['id'], 'n' => $p['name'], 'c' => $p['category'], 'p' => (float)$p['price'],
    'bdt' => $bdt, 'disc' => (int)$disc,
    'v' => (int)$p['verified'], 'i' => $p['icon'], 'img' => $p['image'] ?? '',
    't' => array_values(array_filter(array_map('trim', explode(',', $p['tags'])))),
    'maint' => $isMaint,
    'stock' => (int)$totalStock,
    'variants' => array_map(fn($v) => ['id' => (int)$v['id'], 'label' => $v['label'], 'mult' => (float)$v['mult'], 'stock' => (int)$v['stock']], $variants),
  ];
}
foreach (db()->query('SELECT * FROM coupons') as $c) $boot['coupons'][$c['code']] = ['pct' => (float)$c['percent'], 'min' => (float)$c['min_amount']];

if (!function_exists('e')) { function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); } }
$pageUrl = base_url() . '/';
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet">
<title>SOLAYMAN X CHEAT STORE — Buy FF Tools and License Keys Instantly</title>
<meta name="description" content="Buy instant Free Fire tools, license keys, and digital products at Solayman X Cheat Store. Fast delivery, secure payment, 24/7 support.">
<meta name="keywords" content="solayman x cheat, free fire tools, free fire panel, android root, ios hack, pc hack, guild glory, license key, free fire max">
<meta name="author" content="SOLAYMAN X CHEAT">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="format-detection" content="telephone=no">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<meta name="theme-color" content="#0a0a14">
<link rel="canonical" href="<?= e($pageUrl) ?>">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="<?= e($pageUrl) ?>">
<meta property="og:title" content="SOLAYMAN X CHEAT STORE — Buy FF Tools and License Keys Instantly">
<meta property="og:description" content="Buy instant Free Fire tools, license keys, and digital products at Solayman X Cheat Store. Fast delivery, secure payment, 24/7 support.">
<meta property="og:site_name" content="SOLAYMAN X CHEAT">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="SOLAYMAN X CHEAT STORE — Buy FF Tools and License Keys Instantly">
<meta name="twitter:description" content="Buy instant Free Fire tools, license keys, and digital products at Solayman X Cheat Store. Fast delivery, secure payment, 24/7 support.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%237c3aed'/%3E%3Cstop offset='1' stop-color='%2300d4ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='%230a0a14'/%3E%3Ctext x='32' y='44' font-family='Arial,Helvetica,sans-serif' font-size='34' font-weight='bold' fill='url(%23g)' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" type="image/svg+xml">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="assets/style.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "name": "SOLAYMAN X CHEAT",
  "url": "https://solaymanxcheat.surge.sh/",
  "description": "Buy instant Free Fire tools, license keys, and digital products. Fast delivery, secure payment, 24/7 support.",
  "currenciesAccepted": "USD",
  "paymentAccepted": "Binance Pay, USDT, Account Balance",
  "areaServed": "BD",
  "availableLanguage": ["en", "bn"],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": "https://t.me/DCFsolayman"
  }
}
</script>
</head>
<body>

<div class="loader" id="loader">
  <div class="loader-bars"><i></i><i></i><i></i><i></i><i></i></div>
  <div class="loader-text">SOLAYMAN X CHEAT</div>
  <div class="loader-sub">Decrypting Content</div>
</div>

<div class="announce" id="announceBar">
  <div class="announce-img-box">
    <button class="announce-close" id="announceClose" aria-label="Close"><i class="fas fa-times"></i></button>
    <div class="announce-content">
      <a href="https://t.me/DCFsolayman" target="_blank" rel="noopener"><i class="fab fa-telegram"></i> Join Telegram · Solayman X Cheat</a>
      <button id="announceOk"><i class="fas fa-check-circle"></i> Got it</button>
    </div>
  </div>
</div>

<header class="header">
  <div class="header-inner">
    <div class="logo"><span>SOLAYMAN X CHEAT</span><small>DIGITAL KEY STORE</small></div>
    <div class="header-actions">
      <div class="user-menu" id="userMenu">
        <button class="user-btn" id="userBtn" type="button" aria-haspopup="true" aria-expanded="false">
          <span class="user-avatar" id="userAvatar"><i class="fas fa-user"></i></span>
          <em class="user-btn-label" id="userBtnLabel">Account</em>
          <i class="fas fa-chevron-down user-caret"></i>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <div class="dropdown-header" id="ddHead">
            <div class="dropdown-header-name" id="ddName">Guest</div>
            <div class="dropdown-header-email" id="ddEmail">Not signed in</div>
          </div>
          <button class="dropdown-item dd-auth" id="ddAuth" type="button"><i class="fas fa-right-to-bracket"></i> Login / Register</button>
          <div class="dd-private" id="ddPrivate" style="display:none">
            <button class="dropdown-item" id="ddBalance" type="button"><i class="fas fa-wallet"></i> Add Balance <span style="opacity:.75;font-size:10px">(<b id="ddBalVal">$0.00</b>)</span></button>
            <button class="dropdown-item" id="ddOrders" type="button"><i class="fas fa-shopping-bag"></i> My Orders</button>
            <button class="dropdown-item" id="ddProfile" type="button"><i class="fas fa-user-cog"></i> Profile</button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" id="ddLogout" type="button"><i class="fas fa-sign-out-alt"></i> Sign out</button>
          </div>
        </div>
      </div>
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme"><i id="themeIcon" class="fas fa-sun"></i></button>
    </div>
  </div>
</header>

<main class="container">

  <div class="slider-wrapper">
    <div class="slider" id="slider">
      <div class="slide active"><div class="slide-art art-1"><div class="slide-inner"><span class="slide-kicker">NEW STOCK</span><h2>Premium Keys<br><b>Instant Delivery</b></h2><p>Get your license in seconds after payment</p></div></div></div>
      <div class="slide"><div class="slide-art art-2"><div class="slide-inner"><span class="slide-kicker">SECURE</span><h2>Safe Payments<br><b>Binance Pay</b></h2><p>Encrypted checkout with money-back guarantee</p></div></div></div>
      <div class="slide"><div class="slide-art art-3"><div class="slide-inner"><span class="slide-kicker">24/7</span><h2>Always Here<br><b>Support Team</b></h2><p>Solayman X Cheat · Telegram support around the clock</p></div></div></div>
    </div>
    <button class="slider-nav prev" onclick="prevSlide()"><i class="fas fa-chevron-left"></i></button>
    <button class="slider-nav next" onclick="nextSlide()"><i class="fas fa-chevron-right"></i></button>
    <div class="slider-dots" id="sliderDots"></div>
  </div>

  <div class="section-title">
    <div class="section-title-text">Our <span>Products</span></div>
  </div>

  <div class="cat-filter">
    <div class="cat-filter-lbl"><i class="fas fa-layer-group"></i> Categories</div>
    <div class="cat-tabs" id="catTabs" role="tablist" aria-label="Product categories"></div>
  </div>

  <div id="catalog"></div>

  <section class="why-section">
    <div class="why-title">WHY CHOOSE <span>US?</span></div>
    <div class="why-subtitle">Trusted by thousands of gamers worldwide for premium quality and instant delivery</div>

    <div class="why-video">
      <iframe src="https://www.youtube.com/embed/3tFzqnpdpJs?rel=0&amp;playsinline=1" title="Solayman X Cheat demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" loading="lazy" allowfullscreen></iframe>
    </div>

    <div class="why-cards">
      <div class="why-card">
        <div class="why-card-icon"><i class="fas fa-bolt"></i></div>
        <h4>INSTANT DELIVERY</h4>
        <p>Get your keys delivered automatically within seconds after payment</p>
      </div>
      <div class="why-card">
        <div class="why-card-icon"><i class="fas fa-headset"></i></div>
        <h4>24/7 SUPPORT</h4>
        <p>Solayman X Cheat is always available to help you with any questions</p>
      </div>
      <div class="why-card">
        <div class="why-card-icon"><i class="fas fa-shield-halved"></i></div>
        <h4>100% SECURE</h4>
        <p>Safe &amp; encrypted payments with money-back guarantee</p>
      </div>
    </div>

    <div class="why-actions">
      <button class="ghost-btn" onclick="openTutorial()"><i class="fas fa-circle-play"></i> Demo Video</button>
      <button class="ghost-btn" onclick="openHowToBuy()"><i class="fas fa-circle-question"></i> How To Buy</button>
    </div>
  </section>

</main>

<footer class="footer">
  <div class="footer-brand">SOLAYMAN X CHEAT</div>
  <div class="footer-owner"><i class="fas fa-user-shield"></i> Owner &amp; Seller: <b>Solayman X Cheat</b></div>
  <div class="footer-links">
    <a href="#" onclick="openLegal('privacy');return false;">Privacy</a>
    <a href="#" onclick="openLegal('terms');return false;">Terms</a>
  </div>
  <div class="footer-copy">© 2026 SOLAYMAN X CHEAT • Secure Shopping</div>
</footer>

<!-- PURCHASE MODAL -->
<div class="overlay" id="purchaseOverlay">
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3><i class="fas fa-cart-shopping"></i> Purchase</h3>
      <button class="modal-close" onclick="closeModal('purchaseOverlay')">&times;</button>
    </div>

    <div class="steps">
      <span class="step-dot active" data-step="1">1</span>
      <span class="step-line" data-line="1"></span>
      <span class="step-dot" data-step="2">2</span>
      <span class="step-line" data-line="2"></span>
      <span class="step-dot" data-step="3">3</span>
      <span class="step-line" data-line="3"></span>
      <span class="step-dot" data-step="4">4</span>
    </div>

    <div class="step-panel active" data-panel="1">
      <label class="field">
        <span>Select Option</span>
        <select id="variantSelect">
          <option value="">-- Choose Variant --</option>
        </select>
      </label>

      <label class="field">
        <span>Quantity <em>How many?</em></span>
        <div class="qty">
          <button type="button" onclick="changeQty(-1)"><i class="fas fa-minus"></i></button>
          <input type="number" id="qtyInput" value="1" min="1" max="50" readonly>
          <button type="button" onclick="changeQty(1)"><i class="fas fa-plus"></i></button>
        </div>
      </label>

      <div class="variant-info" id="variantInfo">
        <div class="variant-info-left">
          <span class="variant-info-name" id="selVariantName">—</span>
          <span class="variant-info-stock" id="selVariantStock">Choose an option to see stock</span>
        </div>
        <span class="variant-info-price" id="selVariantPrice">$0.00</span>
      </div>

      <div class="field">
        <span>Key Type</span>
        <div class="radio-row">
          <label class="radio-card">
            <input type="radio" name="keytype" value="direct" checked>
            <div><b>Direct Key</b><small>No Android ID needed</small></div>
          </label>
          <label class="radio-card">
            <input type="radio" name="keytype" value="device">
            <div><b>Device Bound</b><small>Locks to your Android ID</small></div>
          </label>
        </div>
        <p class="hint" id="deviceHint" style="display:none">Key locked to this device · 1 key per order</p>
        <label class="field" id="androidIdField" style="display:none">
          <span>Android ID (device binding)</span>
          <span class="input-wrap"><input type="text" id="androidId" placeholder="Enter 16 digit Android ID" maxlength="16"><button class="paste-btn" type="button" onclick="event.preventDefault();pasteToInput('androidId')" aria-label="Paste"><i class="fas fa-paste"></i></button></span>
        </label>
      </div>

      <button class="primary-btn" id="step1Next" type="button" onclick="gotoStep(2)">Continue <i class="fas fa-arrow-right"></i></button>
    </div>

    <div class="step-panel" data-panel="2">
      <div class="account-required">
        <i class="fas fa-envelope-open-text"></i>
        <h4>Account Required</h4>
        <p>This shop requires email verification. Please login or create an account to continue.</p>
        <button class="primary-btn" onclick="closeModal('purchaseOverlay');openAccount()"><i class="fas fa-right-to-bracket"></i> Login / Register</button>
        <button class="link-btn" onclick="gotoStep(1)"><i class="fas fa-arrow-left"></i> Back</button>
      </div>
      <div class="logged-in-box" id="loggedInBox" style="display:none">
        <div class="cust-card">
          <div class="cust-avatar"><i class="fas fa-user-check"></i></div>
          <div class="cust-details">
            <div class="cust-name" id="custName">—</div>
            <div class="cust-contact">
              <span><i class="fas fa-envelope"></i> <b id="custEmail">—</b></span>
              <span id="custPhoneRow"><i class="fas fa-phone"></i> <b id="custPhone">—</b></span>
            </div>
          </div>
        </div>
        <button class="primary-btn" onclick="gotoStep(3)">Continue <i class="fas fa-arrow-right"></i></button>
        <button class="link-btn" onclick="gotoStep(1)"><i class="fas fa-arrow-left"></i> Back</button>
        <button class="link-btn" onclick="closeModal('purchaseOverlay');openAccount('profile')"><i class="fas fa-pen"></i> Edit profile</button>
      </div>
    </div>

    <div class="step-panel" data-panel="3">
      <div class="field">
        <span>Payment Method</span>
        <label class="pay-card selected" id="payCardBinance">
          <input type="radio" name="pay" value="binance" checked>
          <i class="fab fa-bitcoin"></i>
          <div><b>Binance Pay</b><small>Pay with Binance (USDT)</small></div>
          <span class="check"><i class="fas fa-check"></i></span>
        </label>
        <label class="pay-card" id="payCardBalance">
          <input type="radio" name="pay" value="balance">
          <i class="fas fa-wallet"></i>
          <div><b>Account Balance</b><small id="balPayHint">Sign in to use your balance</small></div>
          <span class="check"><i class="fas fa-check"></i></span>
        </label>
        <button class="link-btn" onclick="openTutorial('binance')">How to buy with Binance?</button>
      </div>

      <label class="field">
        <span>Coupon Code</span>
        <div class="coupon">
          <input type="text" id="couponInput" placeholder="Coupon Code">
          <button type="button" onclick="applyCoupon()">Apply</button>
        </div>
        <small class="hint" id="couponMsg"></small>
      </label>

      <div class="summary">
        <div class="sum-row"><span>Item</span><b id="sumItem">—</b></div>
        <div class="sum-row"><span>Quantity</span><b id="sumQty">1</b></div>
        <div class="sum-row" id="discRow" style="display:none"><span>Discount</span><b id="sumDisc">$0.00</b></div>
        <div class="sum-row total"><span>Total Amount</span><b id="sumTotal">$0.00</b></div>
      </div>

      <button class="primary-btn pay" onclick="gotoStep(4)"><i class="fas fa-lock"></i> Pay Now</button>
      <button class="link-btn" onclick="gotoStep(2)"><i class="fas fa-arrow-left"></i> Back</button>
    </div>

    <div class="step-panel" data-panel="4">
      <div id="binancePayBox">
      <div class="pay-box">
        <div class="pay-box-head"><i class="fab fa-bitcoin"></i> Send payment with Binance Pay</div>
        <div class="pay-row"><span>Binance Pay ID</span><b id="payIdVal"><?= e($pay['binance']) ?></b><button type="button" onclick="copyEl('payIdVal','Pay ID copied')" aria-label="Copy"><i class="far fa-copy"></i></button></div>
        <div class="pay-row"><span>Merchant</span><b><?= e($pay['merchant']) ?></b></div>
        <div class="pay-row"><span>Seller</span><b><?= e($pay['seller']) ?></b></div>
        <div class="pay-row pay-total"><span>Exact amount</span><b id="payAmount">$0.00</b><button type="button" onclick="copyEl('payAmount','Amount copied')" aria-label="Copy"><i class="far fa-copy"></i></button></div>
        <p class="warn"><i class="fas fa-triangle-exclamation"></i> Send the exact amount only. A wrong amount delays verification.</p>
        <button class="link-btn" type="button" onclick="openTutorial('binance')"><i class="fas fa-play-circle"></i> How to pay with Binance?</button>
      </div>

      <label class="field"><span>Transaction ID (TrxID) <em>Required</em></span>
        <span class="input-wrap"><input type="text" id="trxId" placeholder="e.g. 3847592104837465" maxlength="64" autocomplete="off"><button class="paste-btn" type="button" onclick="event.preventDefault();pasteToInput('trxId')" aria-label="Paste"><i class="fas fa-paste"></i></button></span></label>

      <label class="field"><span>Sender Binance ID / Phone <em>Optional</em></span>
        <input type="text" id="trxFrom" placeholder="@yourbinanceid or 01XXXXXXXXX" maxlength="40" autocomplete="off"></label>

      <div class="field">
        <span>Payment Screenshot <em>Optional</em></span>
        <label class="file-box" for="payShot">
          <input type="file" id="payShot" accept="image/png,image/jpeg,image/webp">
          <i class="fas fa-cloud-arrow-up"></i>
          <span id="fileName">Choose screenshot</span>
        </label>
        <img id="shotPreview" class="shot-preview" alt="" style="display:none">
      </div>

      <label class="check-row"><input type="checkbox" id="payConfirm"><span>I have sent the exact amount — this payment is mine</span></label>
      <p class="form-err" id="payErr" style="display:none"></p>

      <div class="btn-row">
        <button class="ghost-btn" type="button" onclick="gotoStep(3)"><i class="fas fa-arrow-left"></i> Back</button>
        <button id="paySubmitBtn" class="primary-btn pay" type="button" onclick="submitPayment()"><i class="fas fa-paper-plane"></i> Submit Payment</button>
      </div>
      </div>

      <div id="balancePayBox" style="display:none">
        <div class="pay-box pay-box-bal">
          <div class="pay-box-head"><i class="fas fa-wallet"></i> Pay with Account Balance</div>
          <div class="pay-row"><span>Current balance</span><b id="balCur">$0.00</b></div>
          <div class="pay-row pay-total"><span>Order total</span><b id="balDue">$0.00</b></div>
          <div class="pay-row"><span>Balance after payment</span><b id="balAfter">$0.00</b></div>
          <p class="warn" id="balShort" style="display:none"><i class="fas fa-triangle-exclamation"></i> Not enough balance — add funds first.</p>
          <p class="hint"><i class="fas fa-bolt"></i> Balance payments are instant — your license key is delivered immediately.</p>
        </div>

        <label class="check-row"><input type="checkbox" id="balConfirm"><span>Confirm — use my balance for this order</span></label>
        <p class="form-err" id="balErr" style="display:none"></p>

        <div class="btn-row">
          <button class="ghost-btn" type="button" onclick="gotoStep(3)"><i class="fas fa-arrow-left"></i> Back</button>
          <button id="balPayBtn" class="primary-btn pay" type="button" onclick="payWithBalance()"><i class="fas fa-bolt"></i> Pay from Balance</button>
        </div>
      </div>
    </div>

    <div class="step-panel" data-panel="5">
      <div class="order-done">
        <div class="done-ring" id="doneRing"><i class="fas fa-hourglass-half" id="doneIcon"></i></div>
        <h4 id="doneTitle">Payment Submitted</h4>
        <p id="doneSub">Your payment is queued for verification. Keep this order code.</p>
        <div class="order-code" id="orderCode">SXC-000000-0000</div>

        <div class="summary">
          <div class="sum-row"><span>Product</span><b id="ordProduct">—</b></div>
          <div class="sum-row"><span>Variant</span><b id="ordVariant">—</b></div>
          <div class="sum-row"><span>Quantity</span><b id="ordQty">1</b></div>
          <div class="sum-row"><span>Amount</span><b id="ordAmount">$0.00</b></div>
          <div class="sum-row"><span>TrxID</span><b id="ordTrx">—</b></div>
          <div class="sum-row" id="ordKeyRow" style="display:none"><span>License Key</span><b class="key-val" id="ordKey">—</b></div>
          <div class="sum-row total"><span>Status</span><span class="badge badge-pending" id="ordStatus">Pending review</span></div>
        </div>

        <p class="hint" id="doneHint"><i class="fas fa-clock"></i> Delivery usually takes 5–30 minutes after the payment is verified.</p>

        <div class="btn-row">
          <button class="primary-btn" type="button" onclick="closeModal('purchaseOverlay');openOrders()"><i class="fas fa-truck-fast"></i> Track Order</button>
          <button class="ghost-btn" type="button" onclick="closeModal('purchaseOverlay')">Done</button>
        </div>
        <a class="link-btn center" href="https://t.me/DCFsolayman" target="_blank" rel="noopener"><i class="fab fa-telegram"></i> Need help? Message Solayman X Cheat on Telegram</a>
      </div>
    </div>
  </div>
</div>

<!-- ORDERS MODAL -->
<div class="overlay" id="ordersOverlay">
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3><i class="fas fa-receipt"></i> My Orders</h3>
      <button class="modal-close" onclick="closeModal('ordersOverlay')">&times;</button>
    </div>
    <div id="ordersList" class="orders-list"></div>
    <p class="hint" id="ordersEmpty">No orders yet — buy a product to see it here.</p>
    <button class="primary-btn" type="button" onclick="closeModal('ordersOverlay')">Close</button>
  </div>
</div>

<!-- ACCOUNT MODAL -->
<div class="overlay" id="accountOverlay">
  <div class="modal modal-acct" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3><i class="fas fa-user-circle"></i> My Account</h3>
      <button class="modal-close" onclick="closeModal('accountOverlay')">&times;</button>
    </div>

    <div id="acctDash" style="display:none">
      <div class="profile-card">
        <div class="profile-avatar" id="profAvatar"><i class="fas fa-user"></i></div>
        <div class="profile-info">
          <div class="profile-name" id="profName">—</div>
          <div class="profile-email" id="profEmail">—</div>
          <div class="profile-phone" id="profPhone"></div>
        </div>
        <div class="profile-stats">
          <div class="stat"><span class="stat-value" id="stOrders">0</span><span class="stat-label">Orders</span></div>
          <div class="stat"><span class="stat-value" id="stSpent">$0.00</span><span class="stat-label">Spent</span></div>
          <div class="stat"><span class="stat-value" id="stBal">$0.00</span><span class="stat-label">Balance</span></div>
        </div>
      </div>

      <div class="acct-actions">
        <button class="primary-btn" type="button" onclick="openBalance()"><i class="fas fa-plus-circle"></i> Add Balance</button>
        <button class="ghost-btn" type="button" onclick="closeModal('accountOverlay')"><i class="fas fa-store"></i> Shop Now</button>
      </div>

      <div class="tabs" id="acctTabs">
        <button class="tab active" data-atab="purchases" type="button"><i class="fas fa-receipt"></i> Purchases</button>
        <button class="tab" data-atab="deposits" type="button"><i class="fas fa-piggy-bank"></i> Deposits</button>
      </div>

      <div class="tab-content active" data-atabc="purchases">
        <div class="section-subtitle"><i class="fas fa-history"></i> Purchase History</div>
        <div id="acctOrders" class="orders-list"></div>
        <div class="empty" id="acctOrdersEmpty">
          <i class="fas fa-shopping-bag"></i>
          <p>No orders yet</p>
          <button class="primary-btn" type="button" onclick="closeModal('accountOverlay')"><i class="fas fa-store"></i> Shop Now</button>
        </div>
      </div>

      <div class="tab-content" data-atabc="deposits">
        <div class="section-subtitle"><i class="fas fa-piggy-bank"></i> Deposit History</div>
        <div id="acctDeps" class="orders-list"></div>
        <div class="empty" id="acctDepsEmpty">
          <i class="fas fa-wallet"></i>
          <p>No deposits yet</p>
          <button class="primary-btn" type="button" onclick="openBalance()"><i class="fas fa-plus-circle"></i> Add Balance</button>
        </div>
      </div>
    </div>

    <div class="signout-bar" id="signOutBar" style="display:none">
      <span><i class="fas fa-circle-check"></i> Signed in as <b id="signOutEmail"></b></span>
      <button class="link-btn" type="button" onclick="logout()"><i class="fas fa-right-from-bracket"></i> Sign out</button>
    </div>
    <div class="code-row" id="codeRow" style="display:none">
      <span>Recovery code</span>
      <b id="recoveryCode">&mdash;</b>
      <button class="link-btn" type="button" onclick="copyRecovery()"><i class="far fa-copy"></i> Copy</button>
    </div>

    <div class="tabs2" id="authTabs">
      <button class="active" data-auth="login">Login</button>
      <button data-auth="register">Register</button>
    </div>

    <form class="auth-panel active" data-auth-panel="login" onsubmit="return doLogin(event)">
      <label class="field"><span>Email</span><span class="input-wrap"><input type="email" id="loginEmail" required autocomplete="email" placeholder="you@example.com"><button class="paste-btn" type="button" onclick="event.preventDefault();pasteToInput('loginEmail')" aria-label="Paste"><i class="fas fa-paste"></i></button></span></label>
      <label class="field"><span>Password</span><span class="input-wrap"><input type="password" id="loginPass" required autocomplete="current-password" placeholder="••••••••"><button class="paste-btn" type="button" onclick="event.preventDefault();pasteToInput('loginPass')" aria-label="Paste"><i class="fas fa-paste"></i></button></span></label>
      <p class="form-err" id="loginErr" style="display:none"></p>
      <button class="primary-btn" type="submit">Login</button>
      <div class="or">or</div>
      <button class="google-btn" type="button" onclick="googleAuth()"><i class="fab fa-google"></i> Continue with Google</button>
      <button class="link-btn center" type="button" onclick="showAuth('forgot1')">Forgot Password?</button>
    </form>

    <form class="auth-panel" data-auth-panel="register" onsubmit="return doRegister(event)">
      <label class="field"><span>Name</span><input type="text" id="regName" required autocomplete="name" placeholder="Your name"></label>
      <label class="field"><span>Email</span><span class="input-wrap"><input type="email" id="regEmail" required autocomplete="email" placeholder="you@example.com"><button class="paste-btn" type="button" onclick="event.preventDefault();pasteToInput('regEmail')" aria-label="Paste"><i class="fas fa-paste"></i></button></span></label>
      <label class="field"><span>Phone</span><input type="tel" id="regPhone" required autocomplete="tel" placeholder="01XXXXXXXXX"></label>
      <label class="field"><span>Password</span><input type="password" id="regPass" required minlength="6" autocomplete="new-password" placeholder="Min 6 characters"></label>
      <label class="field"><span>Confirm Password</span><input type="password" id="regPass2" required minlength="6" autocomplete="new-password" placeholder="Repeat your password"></label>
      <p class="form-err" id="regErr" style="display:none"></p>
      <button class="primary-btn" type="submit">Register</button>
      <div class="or">or</div>
      <button class="google-btn" type="button" onclick="googleAuth()"><i class="fab fa-google"></i> Continue with Google</button>
    </form>

    <form class="auth-panel" data-auth-panel="forgot1" onsubmit="return resetStep1(event)">
      <p class="muted">Enter the email you registered with — a password reset link will be sent to your Gmail inbox.</p>
      <label class="field"><span>Email</span><span class="input-wrap"><input type="email" id="forgotEmail" required autocomplete="email" placeholder="you@example.com"><button class="paste-btn" type="button" onclick="event.preventDefault();pasteToInput('forgotEmail')" aria-label="Paste"><i class="fas fa-paste"></i></button></span></label>
      <p class="form-err" id="resetErr1" style="display:none"></p>
      <button class="primary-btn" type="submit"><i class="fas fa-paper-plane"></i> Send Reset Link</button>
      <button class="link-btn center" type="button" onclick="showAuth('login')"><i class="fas fa-arrow-left"></i> Back to Login</button>
    </form>

    <div class="auth-panel" data-auth-panel="forgot2">
      <div class="sent-box">
        <div class="sent-icon"><i class="fas fa-envelope-circle-check"></i></div>
        <h4>Check your inbox</h4>
        <p class="muted">A password reset link was sent to <b id="resetWho2">—</b>. Open it from Gmail, or use the link below.</p>
        <div class="reset-link" id="resetLinkBox">—</div>
        <p class="hint"><i class="fas fa-clock"></i> The link expires in 30 minutes and works only once.</p>
      </div>
      <div class="btn-row">
        <button class="ghost-btn" type="button" onclick="copyResetLink()"><i class="far fa-copy"></i> Copy Link</button>
        <button class="primary-btn" type="button" onclick="openResetLink()"><i class="fas fa-envelope-open-text"></i> Open Reset Link</button>
      </div>
      <button class="link-btn center" type="button" onclick="showAuth('forgot1')"><i class="fas fa-rotate-left"></i> Resend / change email</button>
      <button class="link-btn center" type="button" onclick="showAuth('login')"><i class="fas fa-arrow-left"></i> Back to Login</button>
    </div>

    <form class="auth-panel" data-auth-panel="forgot3" onsubmit="return resetStep3(event)">
      <p class="muted">Link verified. Choose a new password for <b id="resetWho"></b>.</p>
      <label class="field"><span>New Password</span><input type="password" id="newPass" required minlength="6" autocomplete="new-password" placeholder="Min 6 characters"></label>
      <label class="field"><span>Confirm New Password</span><input type="password" id="newPass2" required minlength="6" autocomplete="new-password" placeholder="Repeat new password"></label>
      <p class="form-err" id="resetErr3" style="display:none"></p>
      <button class="primary-btn" type="submit"><i class="fas fa-key"></i> Update Password</button>
      <button class="link-btn center" type="button" onclick="showAuth('login')"><i class="fas fa-arrow-left"></i> Back to Login</button>
    </form>
  </div>
</div>

<!-- ADD BALANCE MODAL -->
<div class="overlay" id="balanceOverlay">
  <div class="modal modal-sm" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3><i class="fas fa-wallet"></i> Add Balance</h3>
      <button class="modal-close" onclick="closeModal('balanceOverlay')">&times;</button>
    </div>

    <div class="bal-step active" data-balstep="1">
      <p class="muted">Add funds to your account for faster checkout</p>

      <div class="bal-current">
        <span><i class="fas fa-coins"></i> Current Balance</span>
        <b id="balNow">$0.00</b>
      </div>

      <div class="field">
        <span>Amount (USD)</span>
        <div class="amt-presets" id="amtPresets">
          <button class="amt-btn" type="button" data-amt="5">$5</button>
          <button class="amt-btn" type="button" data-amt="10">$10</button>
          <button class="amt-btn" type="button" data-amt="20">$20</button>
          <button class="amt-btn" type="button" data-amt="50">$50</button>
        </div>
        <input type="number" id="amtInput" class="amt-input" min="200" max="100000" step="1" value="500" inputmode="numeric">
        <p class="form-err" id="amtErr" style="display:none"></p>
      </div>

      <div class="field">
        <span>Payment Method</span>
        <div class="gw-note"><i class="fas fa-lock"></i> Auto-verified via RupantorPay (bKash / Nagad / Rocket)</div>
        <label class="pay-card selected">
          <input type="radio" name="gw" value="rupantor" checked disabled>
          <i class="fas fa-mobile-alt"></i>
          <div><b>RupantorPay</b><small>Auto credit</small></div>
          <span class="check"><i class="fas fa-check"></i></span>
        </label>
      </div>

      <button class="primary-btn" type="button" onclick="startDeposit()"><i class="fas fa-plus-circle"></i> Add Balance</button>
      <p class="hint center-hint">Min: $2.00 | Max: $1,000.00</p>
    </div>

    <div class="bal-step" data-balstep="2">
      <div class="pay-box">
        <div class="pay-box-head"><i class="fas fa-credit-card"></i> Pay with RupantorPay</div>
        <div class="pay-row"><span>Payment Method</span><b>bKash / Nagad / Rocket</b></div>
        <div class="pay-row pay-total"><span>Amount (USD)</span><b id="depAmount">$0.00</b></div>
        <p class="warn"><i class="fas fa-info-circle"></i> You will be redirected to RupantorPay secure payment page.</p>
      </div>
      <p class="form-err" id="depErr" style="display:none"></p>
      <div class="btn-row">
        <button class="ghost-btn" type="button" onclick="balStep(1)"><i class="fas fa-arrow-left"></i> Back</button>
        <button class="primary-btn pay" type="button" onclick="startDeposit()"><i class="fas fa-arrow-right"></i> Pay Now</button>
      </div>
    </div>

    <div class="bal-step" data-balstep="3">
      <div class="order-done">
        <div class="done-ring"><i class="fas fa-hourglass-half"></i></div>
        <h4>Deposit Submitted</h4>
        <p>Your payment is being processed. Balance will be credited automatically.</p>
        <div class="order-code" id="depCode">SXC-000000-0000</div>
        <div class="summary">
          <div class="sum-row"><span>Amount</span><b id="depDoneAmt">$0.00</b></div>
          <div class="sum-row"><span>Method</span><b>Binance Pay</b></div>
          <div class="sum-row"><span>TrxID</span><b id="depDoneTrx">—</b></div>
          <div class="sum-row total"><span>Status</span><span class="badge badge-pending" id="depStatus">Pending review</span></div>
        </div>
        <p class="hint"><i class="fas fa-clock"></i> Deposits are usually verified within 5–30 minutes.</p>
        <div class="btn-row">
          <button class="primary-btn" type="button" onclick="closeModal('balanceOverlay');openAccount('deposits')"><i class="fas fa-piggy-bank"></i> My Deposits</button>
          <button class="ghost-btn" type="button" onclick="closeModal('balanceOverlay')">Done</button>
        </div>
      </div>
    </div>

    <div class="gw-loading" id="gwLoading">
      <div class="gw-spin"></div>
      <div class="gw-loading-title"><i class="fas fa-lock"></i> Opening secure payment…</div>
      <div class="gw-loading-sub">Please wait, do not close this page</div>
    </div>
  </div>
</div>

<!-- RECOVERY CODE MODAL -->
<div class="overlay" id="codeOverlay">
  <div class="modal modal-sm" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3><i class="fas fa-key"></i> Save your recovery code</h3>
      <button class="modal-close" onclick="closeModal('codeOverlay')">&times;</button>
    </div>
    <p class="muted">This code is the only way to reset your password — store it somewhere safe.</p>
    <div class="code-big" id="codeBig">SXC-XXXX-XXXX</div>
    <button class="primary-btn" onclick="copyRecovery(true)"><i class="far fa-copy"></i> Copy Code</button>
    <button class="link-btn center" onclick="closeModal('codeOverlay')">I saved it &mdash; Close</button>
  </div>
</div>

<!-- GOOGLE SIGN-IN MODAL -->
<div class="overlay" id="googleOverlay">
  <div class="modal g-modal" role="dialog" aria-modal="true">
    <button class="modal-close g-close" type="button" onclick="closeModal('googleOverlay')" aria-label="Close">&times;</button>

    <div class="g-step active" data-gstep="1">
      <div class="g-logo">
        <svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      </div>
      <h3 class="g-title">Sign in</h3>
      <p class="g-sub">Use your Google Account</p>

      <label class="field"><span>Email or phone</span>
        <input type="email" id="gEmail" placeholder="you@gmail.com" autocomplete="username" inputmode="email">
      </label>
      <p class="g-err" id="gErr1" style="display:none"></p>
      <div class="g-actions">
        <button class="link-btn" type="button" onclick="closeModal('googleOverlay');openAccount();showAuth('forgot1')">Forgot email?</button>
        <button class="g-next" type="button" onclick="googleStep1()">Next</button>
      </div>
      <p class="g-note">Demo sign-in — no real Google account is used and no password is sent anywhere.</p>
    </div>

    <div class="g-step" data-gstep="2">
      <div class="g-user">
        <div class="g-avatar" id="gAvatar">M</div>
        <b id="gGreet">Hi,</b>
        <span id="gMail"></span>
      </div>

      <label class="field"><span>Enter your password</span>
        <input type="password" id="gPass" placeholder="Enter your password" autocomplete="current-password">
      </label>
      <p class="g-err" id="gErr2" style="display:none"></p>
      <div class="g-actions">
        <button class="link-btn" type="button" onclick="googleBack()">Back</button>
        <button class="g-next" type="button" onclick="googleStep2()">Next</button>
      </div>
      <p class="g-note">Your password is saved on this device and checked every time you sign in.</p>
    </div>

    <div class="g-foot"><span>English (United States)</span><span>Help</span><span>Privacy</span><span>Terms</span></div>
  </div>
</div>

<!-- DEMO VIDEO MODAL -->
<div class="overlay" id="videoOverlay">
  <div class="modal modal-video" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h4><i class="fas fa-circle-play"></i> <span id="videoTitle">Demo Video</span></h4>
      <button class="modal-close" onclick="closeTutorial()">&times;</button>
    </div>
    <div class="video-frame"><iframe id="videoFrame" src="" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
  </div>
</div>

<!-- HOW TO BUY MODAL -->
<div class="overlay" id="howtoOverlay">
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3><i class="fas fa-circle-question"></i> How To Buy</h3>
      <button class="modal-close" onclick="closeModal('howtoOverlay')">&times;</button>
    </div>
    <ol class="howto">
      <li><b>Pick a product</b><span>Choose a category, then press <i class="fas fa-shopping-cart"></i> Buy.</span></li>
      <li><b>Select variant &amp; quantity</b><span>Pick the duration plan and how many keys you need.</span></li>
      <li><b>Login or register</b><span>An email account is required so Solayman X Cheat can deliver your key.</span></li>
      <li><b>Pay with Binance Pay</b><span>Send the exact amount, then submit your TrxID — reviewed by Solayman X Cheat.</span></li>
      <li><b>Receive your key</b><span>Track your order — the key appears once Solayman X Cheat approves the payment.</span></li>
    </ol>
    <button class="primary-btn" onclick="closeModal('howtoOverlay')">Got it</button>
  </div>
</div>

<!-- LEGAL MODAL -->
<div class="overlay" id="legalOverlay">
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3 id="legalTitle">Privacy</h3>
      <button class="modal-close" onclick="closeModal('legalOverlay')">&times;</button>
    </div>
    <div class="legal-body" id="legalBody"></div>
    <button class="primary-btn" onclick="closeModal('legalOverlay')">Close</button>
  </div>
</div>

<div class="toast" id="toast"></div>

<div class="load-error" id="loadError" style="display:none">
  <b>Scripts did not load.</b>
  <span>Keep <code>index.html</code>, <code>style.css</code> and <code>app.js</code> in the same folder.</span>
</div>
<script>
setTimeout(function(){
  var c=document.getElementById('catalog');
  if(c && !c.innerHTML.trim()){ document.getElementById('loadError').style.display='block'; }
},2500);
</script>
<script>window.__BOOT__ = <?= json_encode($boot, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;</script>
<script src="assets/app.js"></script>
</body>
</html>
