<?php
require_once __DIR__ . '/lib.php';
session_start_safe();

$action = $_GET['action'] ?? '';
$in = post_json();

const STOCK_ACTIONS = ['stock_status', 'stock_push', 'stock_dump', 'dj_list', 'dj_mark', 'stock_key', 'restock_js', 'ping', 'probe2', 'diaglog'];

function cors_stock_headers(): void {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if ($origin !== '' && preg_match('~^https?://[A-Za-z0-9.-]+(:[0-9]+)?$~', $origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
  }
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
  cors_stock_headers();
  http_response_code(204);
  exit;
}
if (in_array($action, STOCK_ACTIONS, true)) {
  cors_stock_headers();
} else {
  csrf_check();
}

function landing_out(bool $ok, string $msg = ''): never {
  header('Content-Type: text/html; charset=utf-8');
  $title = $ok ? '✅ DUMP GECHE' : '❌ DUMP FAIL';
  $col = $ok ? '#4ade80' : '#f87171';
    $sub = $ok
    ? htmlspecialchars($msg !== '' ? $msg : 'Store-e data chole geche. Auto phire jabe…', ENT_QUOTES)
    : htmlspecialchars($msg !== '' ? $msg : 'Abar tap koro', ENT_QUOTES);
  echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    . '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' . $title . '</title></head>'
    . '<body style="font-family:system-ui,-apple-system,sans-serif;background:#0b1220;color:#e5e7eb;'
    . 'display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">'
    . '<div><div style="font-size:46px;margin-bottom:10px">' . ($ok ? '✅' : '❌') . '</div>'
    . '<h1 style="color:' . $col . ';font-size:22px;margin:0 0 10px">' . $title . '</h1>'
    . '<p style="color:#9ca3af;font-size:15px">' . $sub . '</p>'
    . '<button onclick="history.back()" style="background:#374151;color:#e5e7eb;border:0;border-radius:10px;'
    . 'padding:14px 26px;margin-top:18px;font-size:16px;cursor:pointer">⬅ PHIRE JAO (BACK)</button>'
    . '<script>setTimeout(function(){try{history.back()}catch(e){}},1800)</script>'
    . '</div></body></html>';
  exit;
}

function stock_secret_ok(array $in): bool {
  $s = (string)($_GET['secret'] ?? $in['secret'] ?? '');
  return $s !== '' && hash_equals(STOCK_SECRET, $s);
}

function order_json(array $o): array {
  return [
    'id' => (int)$o['id'],
    'code' => $o['code'],
    'product' => $o['product'],
    'variant' => $o['variant'],
    'qty' => (int)$o['qty'],
    'amount' => (float)$o['amount'],
    'method' => $o['method'],
    'status' => $o['status'],
    'key' => $o['lkey'],
    'date' => date('d M Y', (int)$o['created_at']),
    'ts' => (int)$o['created_at'],
  ];
}

function deposit_json(array $d): array {
  return [
    'id' => (int)$d['id'],
    'code' => $d['code'],
    'amount' => (float)$d['amount'],
    'method' => $d['method'],
    'trx' => $d['trx'],
    'status' => $d['status'],
    'date' => date('d M Y', (int)$d['created_at']),
    'ts' => (int)$d['created_at'],
  ];
}

switch ($action) {

case 'products': {
  $cats = db()->query('SELECT * FROM categories ORDER BY sort')->fetchAll();
  $ps = db()->query('SELECT p.*, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.sort')->fetchAll();
  $prodOut = [];
  foreach ($ps as $p) {
    $vs = db()->prepare('SELECT id,label,mult,stock FROM variants WHERE product_id = ? ORDER BY id');
    $vs->execute([$p['id']]);
    $prodOut[] = [
      'id' => (int)$p['id'],
      'n' => $p['name'],
      'c' => $p['category'],
      'p' => (float)$p['price'],
      'v' => (int)$p['verified'],
      'i' => $p['icon'],
      'img' => $p['image'] ?? '',
      't' => array_values(array_filter(array_map('trim', explode(',', $p['tags'])))),
      'variants' => array_map(fn($v) => [
        'id' => (int)$v['id'], 'label' => $v['label'],
        'mult' => (float)$v['mult'], 'stock' => (int)$v['stock'],
      ], $vs->fetchAll()),
    ];
  }
  $coupons = [];
  foreach (db()->query('SELECT * FROM coupons') as $c) {
    $coupons[$c['code']] = ['pct' => (float)$c['percent'], 'min' => (float)$c['min_amount']];
  }
  json_out([
    'ok' => true,
    'categories' => array_merge(['All'], array_column($cats, 'name')),
    'products' => $prodOut,
    'coupons' => $coupons,
    'settings' => [
      'binance' => pay_details()['binance'],
      'telegram' => SITE['telegram'],
      'gateway' => GATEWAY['enabled'],
      'pay' => pay_details(),
    ],
  ]);
}

case 'me': {
  $u = current_user();
  if (!$u) json_out(['ok' => true, 'user' => null]);
  $orders = db()->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC');
  $orders->execute([$u['id']]);
  $deps = db()->prepare('SELECT * FROM deposits WHERE user_id = ? ORDER BY id DESC');
  $deps->execute([$u['id']]);
  json_out([
    'ok' => true,
    'user' => user_json($u),
    'orders' => array_map('order_json', $orders->fetchAll()),
    'deposits' => array_map('deposit_json', $deps->fetchAll()),
    'demo' => SITE['demo_approve'],
  ]);
}

case 'coupon': {
  $code = strtoupper(trim((string)($in['code'] ?? '')));
  $sub = (float)($in['subtotal'] ?? 0);
  $st = db()->prepare('SELECT * FROM coupons WHERE code = ?');
  $st->execute([$code]);
  $c = $st->fetch();
  if (!$c) json_out(['ok' => false, 'msg' => 'Invalid coupon code'], 404);
  if ($sub < (float)$c['min_amount']) {
    json_out(['ok' => false, 'msg' => 'Minimum order ' . money($c['min_amount']) . ' required for this coupon'], 422);
  }
  json_out(['ok' => true, 'code' => $c['code'], 'percent' => (float)$c['percent'], 'min' => (float)$c['min_amount']]);
}

case 'deposit_create': {
  $u = require_user();
  $amount = (float)($in['amount'] ?? 0);
  $method = (string)($in['method'] ?? 'binance');
  $trx = trim((string)($in['trx'] ?? ''));
  if ($amount < 2 || $amount > 1000) json_out(['ok' => false, 'msg' => 'Amount must be between $2 and $1,000'], 422);
  $code = 'DEP' . strtoupper(bin2hex(random_bytes(4)));
  db()->prepare('INSERT INTO deposits(code,user_id,amount,method,trx,status,created_at) VALUES(?,?,?,?,?,"pending",?)')
      ->execute([$code, $u['id'], $amount, $method, $trx, time()]);
  json_out(['ok' => true, 'msg' => 'Deposit request received — wait for admin approval', 'code' => $code]);
}

case 'deposit_rupantor': {
  if (!isset($_SESSION['uid'])) json_out(['ok' => false, 'msg' => 'Login required'], 401);
  $amount = (float)($in['amount'] ?? 0);
  if ($amount < 2 || $amount > 1000) json_out(['ok' => false, 'msg' => 'Amount must be between $2 and $1,000'], 422);
  $cfg = RUPANTOR;
  if (!$cfg['api_key']) json_out(['ok' => false, 'msg' => 'Payment gateway not configured'], 500);
  $u = current_user();
  $bdAmount = round($amount * $cfg['rate']);
  $code = 'SXC-' . strtoupper(bin2hex(random_bytes(3)));
  // Create deposit record pending
  db()->prepare('INSERT INTO deposits(code,user_id,amount,method,trx,status,created_at) VALUES(?,?,?,?,?,"pending",?)')
      ->execute([$code, $u['id'], $amount, 'rupantor', '', time()]);
  // Call RupantorPay checkout API
  $payload = json_encode([
    'fullname'    => $u['name'] ?: $u['email'],
    'email'       => $u['email'],
    'amount'      => (string)$bdAmount,
    'success_url' => base_url() . '/api.php?action=rupantor_success&code=' . urlencode($code),
    'cancel_url'  => base_url() . '/api.php?action=rupantor_cancel&code=' . urlencode($code),
    'webhook_url' => base_url() . '/api.php?action=rupantor_webhook&code=' . urlencode($code),
    'meta_data'   => json_encode(['deposit_code' => $code, 'user_id' => $u['id'], 'usd' => $amount]),
  ]);
  $ch = curl_init($cfg['checkout']);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
      'X-API-KEY: ' . $cfg['api_key'],
      'Content-Type: application/json',
      'X-CLIENT: ' . ($_SERVER['HTTP_HOST'] ?? 'solaymanxcheat.rf.gd'),
    ],
    CURLOPT_TIMEOUT => 30,
  ]);
  $resp = curl_exec($ch);
  $err = curl_error($ch);
  curl_close($ch);
  if ($err) json_out(['ok' => false, 'msg' => 'Gateway error: ' . $err], 502);
  $j = json_decode($resp, true);
  if (!$j || empty($j['payment_url'])) {
    json_out(['ok' => false, 'msg' => 'Gateway error: ' . ($j['message'] ?? 'Unknown')], 502);
  }
  json_out(['ok' => true, 'payment_url' => $j['payment_url'], 'code' => $code, 'amount' => $amount, 'bdt' => $bdAmount]);
}

case 'rupantor_success': {
  $code = trim((string)($_GET['code'] ?? ''));
  $txn = trim((string)($_GET['transactionId'] ?? ''));
  $status = trim((string)($_GET['status'] ?? ''));
  if ($code === '') { header('Location: /'); exit; }
  $st = db()->prepare('SELECT * FROM deposits WHERE code = ?');
  $st->execute([$code]);
  $d = $st->fetch(PDO::FETCH_ASSOC);
  if (!$d) { header('Location: /'); exit; }
  if ($d['status'] === 'approved') { header('Location: /?deposit=done&code=' . urlencode($code)); exit; }
  $cfg = RUPANTOR;
  $verified = false;
  if ($txn !== '' && $status === 'COMPLETED') {
    // Verify via RupantorPay API
    $payload = json_encode(['transaction_id' => $txn]);
    $ch = curl_init($cfg['verify']);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => $payload,
      CURLOPT_HTTPHEADER => [
        'X-API-KEY: ' . $cfg['api_key'],
        'Content-Type: application/json',
      ],
      CURLOPT_TIMEOUT => 20,
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);
    $vj = json_decode($resp, true);
    if ($vj && isset($vj['status']) && $vj['status'] === 'COMPLETED') {
      $verified = true;
      // Credit balance
      db()->prepare('UPDATE deposits SET status = "approved", trx = ? WHERE id = ?')->execute([$txn, $d['id']]);
      db()->prepare('UPDATE users SET balance = balance + ? WHERE id = ?')->execute([$d['amount'], $d['user_id']]);
      @file_put_contents(__DIR__.'/data/rupantor.log', date('c').' verified '.$code.' '.$txn."\n", FILE_APPEND);
    } else {
      db()->prepare('UPDATE deposits SET status = "failed", trx = ? WHERE id = ?')->execute([$txn, $d['id']]);
      @file_put_contents(__DIR__.'/data/rupantor.log', date('c').' verify_failed '.$code.' '.$txn."\n", FILE_APPEND);
    }
  }
  header('Location: /' . ($verified ? '?deposit=done&code=' . urlencode($code) : '?deposit=failed&code=' . urlencode($code)));
  exit;
}

case 'rupantor_cancel': {
  $code = trim((string)($_GET['code'] ?? ''));
  if ($code !== '') {
    db()->prepare('UPDATE deposits SET status = "cancelled" WHERE code = ? AND status = "pending"')->execute([$code]);
  }
  header('Location: /?deposit=cancelled');
  exit;
}

case 'rupantor_webhook': {
  $code = trim((string)($_GET['code'] ?? ''));
  $body = file_get_contents('php://input');
  @file_put_contents(__DIR__ . '/data/rupantor_webhook.log', date('c') . ' code=' . $code . ' body=' . $body . "\n", FILE_APPEND);
  // Try to credit if still pending
  if ($code !== '') {
    $st = db()->prepare('SELECT * FROM deposits WHERE code = ? AND status = "pending"');
    $st->execute([$code]);
    $d = $st->fetch(PDO::FETCH_ASSOC);
    if ($d) {
      $j = json_decode($body, true);
      if ($j && isset($j['status']) && $j['status'] === 'COMPLETED') {
        db()->prepare('UPDATE deposits SET status = "approved", trx = ? WHERE id = ?')->execute([($j['trx_id'] ?? $j['transaction_id'] ?? ''), $d['id']]);
        db()->prepare('UPDATE users SET balance = balance + ? WHERE id = ?')->execute([$d['amount'], $d['user_id']]);
        @file_put_contents(__DIR__.'/data/rupantor.log', date('c').' webhook_verified '.$code."\n", FILE_APPEND);
      }
    }
  }
  echo 'OK';
  exit;
}

case 'deposit_approve': {
  $u = require_user();
  if (!SITE['demo_approve']) json_out(['ok' => false, 'msg' => 'Disabled'], 403);
  $code = (string)($in['code'] ?? '');
  $st = db()->prepare('SELECT * FROM deposits WHERE code = ? AND user_id = ?');
  $st->execute([$code, $u['id']]);
  $d = $st->fetch();
  if (!$d) json_out(['ok' => false, 'msg' => 'Deposit not found'], 404);
  if ($d['status'] === 'approved') json_out(['ok' => false, 'msg' => 'Already approved'], 409);
  db()->beginTransaction();
  db()->prepare('UPDATE deposits SET status = "approved" WHERE id = ?')->execute([$d['id']]);
  db()->prepare('UPDATE users SET balance = balance + ? WHERE id = ?')->execute([$d['amount'], $u['id']]);
  db()->commit();
  $u = current_user();
  json_out(['ok' => true, 'msg' => 'Deposit approved — ' . money($d['amount']) . ' added', 'balance' => (float)$u['balance']]);
}

case 'order_approve': {
  $u = require_user();
  if (!SITE['demo_approve']) json_out(['ok' => false, 'msg' => 'Disabled'], 403);
  $code = (string)($in['code'] ?? '');
  $st = db()->prepare('SELECT * FROM orders WHERE code = ? AND user_id = ?');
  $st->execute([$code, $u['id']]);
  $o = $st->fetch();
  if (!$o) json_out(['ok' => false, 'msg' => 'Order not found'], 404);
  if ($o['status'] === 'delivered') json_out(['ok' => false, 'msg' => 'Already delivered'], 409);
  $stk = stock_take((int)$o['id']);
  if ($stk !== null) {
    db()->prepare('UPDATE orders SET status = "delivered", lkey = ? WHERE id = ?')->execute([$stk, $o['id']]);
    json_out(['ok' => true, 'msg' => 'Order approved — key delivered', 'key' => $stk]);
  }
  db()->prepare('UPDATE orders SET status = "processing", lkey = "" WHERE id = ?')->execute([$o['id']]);
  dj_upsert((string)$o['code'], (string)$o['product'], $o['variant'] ?: '1 Day', (int)$o['qty']);
  json_out(['ok' => true, 'msg' => 'Stock khali — key generation started']);
}

/* ---------------- admin ---------------- */

case 'admin_login': {
  session_start_safe();
  $user = trim((string)($in['user'] ?? ''));
  $pass = (string)($in['pass'] ?? '');
  $okUser = hash_equals(setting_get('admin_user', 'admin'), $user);
  $okPass = password_verify($pass, setting_get('admin_hash', ''));
  if (!$okUser || !$okPass) json_out(['ok' => false, 'msg' => 'Wrong admin username or password.'], 401);
  session_regenerate_id(true);
  $_SESSION['admin'] = 1;
  json_out(['ok' => true, 'msg' => 'Welcome, admin']);
}

case 'admin_logout': {
  session_start_safe();
  unset($_SESSION['admin']);
  json_out(['ok' => true]);
}

case 'admin_state': {
  require_admin();
  $cats = db()->query('SELECT * FROM categories ORDER BY sort')->fetchAll();
  $ps = db()->query('SELECT p.*, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.sort')->fetchAll();
  $out = [];
  foreach ($ps as $p) {
    $vs = db()->prepare('SELECT id,label,mult,stock FROM variants WHERE product_id = ? ORDER BY id');
    $vs->execute([$p['id']]);
    $out[] = [
      'id' => (int)$p['id'], 'name' => $p['name'], 'price' => (float)$p['price'],
      'category' => $p['category'], 'image' => $p['image'] ?? '', 'verified' => (int)$p['verified'],
      'variants' => array_map(fn($v) => ['id' => (int)$v['id'], 'label' => $v['label'], 'mult' => (float)$v['mult'], 'stock' => (int)$v['stock']], $vs->fetchAll()),
    ];
  }
  $deps = db()->query('SELECT d.*, u.email FROM deposits d JOIN users u ON u.id = d.user_id ORDER BY d.id DESC LIMIT 100')->fetchAll();
  $ords = db()->query('SELECT o.*, u.email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 100')->fetchAll();
  json_out([
    'ok' => true,
    'categories' => array_column($cats, 'name'),
    'products' => $out,
    'pay' => pay_details(),
    'keys' => key_stock_info(100),
    'deposits' => array_map(fn($d) => [
      'id' => (int)$d['id'], 'code' => $d['code'], 'email' => $d['email'], 'amount' => (float)$d['amount'],
      'method' => $d['method'], 'trx' => $d['trx'], 'status' => $d['status'],
      'date' => date('d M Y H:i', (int)$d['created_at']),
    ], $deps),
    'orders' => array_map(fn($o) => [
      'id' => (int)$o['id'], 'code' => $o['code'], 'email' => $o['email'], 'product' => $o['product'],
      'variant' => $o['variant'], 'amount' => (float)$o['amount'], 'status' => $o['status'],
      'key' => $o['lkey'], 'date' => date('d M Y H:i', (int)$o['created_at']),
    ], $ords),
  ]);
}

case 'admin_product_save': {
  require_admin();
  $id = (int)($in['id'] ?? 0);
  $name = trim((string)($in['name'] ?? ''));
  $price = (float)($in['price'] ?? -1);
  if ($id < 1 || $name === '' || $price < 0) json_out(['ok' => false, 'msg' => 'Name and price are required.'], 422);
  $st = db()->prepare('SELECT id FROM products WHERE id = ?');
  $st->execute([$id]);
  if (!$st->fetch()) json_out(['ok' => false, 'msg' => 'Product not found'], 404);
  db()->prepare('UPDATE products SET name = ?, price = ? WHERE id = ?')->execute([$name, $price, $id]);
  json_out(['ok' => true, 'msg' => 'Product updated']);
}

case 'admin_variant_save': {
  require_admin();
  $vid = (int)($in['vid'] ?? 0);
  $label = trim((string)($in['label'] ?? ''));
  $mult = (float)($in['mult'] ?? -1);
  $stock = (int)($in['stock'] ?? -1);
  if ($vid < 1 || $label === '' || $mult <= 0 || $stock < 0) json_out(['ok' => false, 'msg' => 'All fields required'], 422);
  db()->prepare('UPDATE variants SET label = ?, mult = ?, stock = ? WHERE id = ?')->execute([$label, $mult, $stock, $vid]);
  json_out(['ok' => true, 'msg' => 'Variant updated']);
}

case 'admin_variant_add': {
  require_admin();
  $pid = (int)($in['pid'] ?? 0);
  $label = trim((string)($in['label'] ?? ''));
  $mult = (float)($in['mult'] ?? 1);
  $stock = (int)($in['stock'] ?? 0);
  if ($pid < 1 || $label === '' || $mult <= 0 || $stock < 0) json_out(['ok' => false, 'msg' => 'All fields required'], 422);
  db()->prepare('INSERT INTO variants(product_id,label,mult,stock) VALUES(?,?,?,?)')->execute([$pid, $label, $mult, $stock]);
  json_out(['ok' => true, 'msg' => 'Variant added', 'vid' => db()->lastInsertId()]);
}

case 'admin_variant_delete': {
  require_admin();
  $vid = (int)($in['vid'] ?? 0);
  if ($vid < 1) json_out(['ok' => false, 'msg' => 'Invalid'], 422);
  db()->prepare('DELETE FROM variants WHERE id = ?')->execute([$vid]);
  json_out(['ok' => true, 'msg' => 'Variant deleted']);
}

case 'admin_product_image': {
  require_admin();
  $id = (int)($in['id'] ?? $_POST['id'] ?? 0);
  if ($id < 1) json_out(['ok' => false, 'msg' => 'Missing product'], 422);
  if (isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
    $f = $_FILES['image'];
    if ($f['size'] > 4 * 1024 * 1024) json_out(['ok' => false, 'msg' => 'Image must be under 4 MB'], 422);
    $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $mime = @mime_content_type($f['tmp_name']);
    if (!isset($extMap[$mime])) json_out(['ok' => false, 'msg' => 'Only JPG, PNG, WEBP or GIF allowed'], 422);
    if (!@getimagesize($f['tmp_name'])) json_out(['ok' => false, 'msg' => 'File is not a valid image'], 422);
    $dir = __DIR__ . '/uploads';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $fname = 'p' . $id . '_' . bin2hex(random_bytes(5)) . '.' . $extMap[$mime];
    if (!@move_uploaded_file($f['tmp_name'], $dir . '/' . $fname)) {
      json_out(['ok' => false, 'msg' => 'Could not save the image on the server (uploads folder not writable)'], 500);
    }
    $st = db()->prepare('SELECT image FROM products WHERE id = ?');
    $st->execute([$id]);
    $old = (string)$st->fetchColumn();
    if ($old && preg_match('/^p\d+_[0-9a-f]+\.(jpg|png|webp|gif)$/', $old)) @unlink(__DIR__ . '/uploads/' . $old);
    db()->prepare('UPDATE products SET image = ? WHERE id = ?')->execute(['uploads/' . $fname, $id]);
    json_out(['ok' => true, 'img' => 'uploads/' . $fname]);
  }
  // remove image
  $st = db()->prepare('SELECT image FROM products WHERE id = ?');
  $st->execute([$id]);
  $old = (string)$st->fetchColumn();
  if ($old && preg_match('/^uploads\/p\d+_[0-9a-f]+\.(jpg|png|webp|gif)$/', $old)) @unlink(__DIR__ . '/' . $old);
  db()->prepare('UPDATE products SET image = "" WHERE id = ?')->execute([$id]);
  json_out(['ok' => true, 'img' => '']);
}

case 'admin_pay_save': {
  require_admin();
  setting_set('pay_binance', trim((string)($in['binance'] ?? '')));
  setting_set('pay_merchant', trim((string)($in['merchant'] ?? '')));
  setting_set('pay_seller', trim((string)($in['seller'] ?? '')));
  json_out(['ok' => true, 'msg' => 'Payment details updated', 'pay' => pay_details()]);
}

case 'admin_pass_save': {
  require_admin();
  $new = (string)($in['pass'] ?? '');
  if (mb_strlen($new) < 6) json_out(['ok' => false, 'msg' => 'Password must be at least 6 characters'], 422);
  setting_set('admin_hash', password_hash($new, PASSWORD_DEFAULT));
  json_out(['ok' => true, 'msg' => 'Admin password changed']);
}

case 'admin_keys_add': {
  require_admin();
  $raw = (string)($in['keys'] ?? '');
  $parts = preg_split('/[\r\n,;]+/', $raw);
  $added = 0; $skip = 0;
  $chk = db()->prepare('SELECT COUNT(*) FROM license_keys WHERE lkey = ?');
  $ins = db()->prepare('INSERT INTO license_keys(lkey, status, created_at) VALUES(?, "unused", ?)');
  foreach ($parts as $p) {
    $p = trim($p);
    if (mb_strlen($p) < 6) { $skip++; continue; }
    $chk->execute([$p]);
    if ((int)$chk->fetchColumn() > 0) { $skip++; continue; }
    $ins->execute([$p, time()]);
    $added++;
  }
  json_out([
    'ok' => true, 'added' => $added, 'skipped' => $skip,
    'msg' => $added ? "Added $added key" . ($added > 1 ? 's' : '') . ($skip ? " · $skip skipped" : '') : 'No valid keys found',
    'keys' => key_stock_info(100),
  ]);
}

case 'admin_keys_del': {
  require_admin();
  $id = (int)($in['id'] ?? 0);
  $st = db()->prepare('SELECT status FROM license_keys WHERE id = ?');
  $st->execute([$id]);
  if (!$st->fetch()) json_out(['ok' => false, 'msg' => 'Key not found'], 404);
  db()->prepare('DELETE FROM license_keys WHERE id = ?')->execute([$id]);
  json_out(['ok' => true, 'msg' => 'Key removed', 'keys' => key_stock_info(100)]);
}

case 'admin_deposit_approve': {
  require_admin();
  $id = (int)($in['id'] ?? 0);
  $st = db()->prepare('SELECT * FROM deposits WHERE id = ?');
  $st->execute([$id]);
  $d = $st->fetch();
  if (!$d) json_out(['ok' => false, 'msg' => 'Deposit not found'], 404);
  if ($d['status'] === 'approved') json_out(['ok' => false, 'msg' => 'Already approved'], 409);
  db()->beginTransaction();
  db()->prepare('UPDATE deposits SET status = "approved" WHERE id = ?')->execute([$d['id']]);
  db()->prepare('UPDATE users SET balance = balance + ? WHERE id = ?')->execute([$d['amount'], $d['user_id']]);
  db()->commit();
  json_out(['ok' => true, 'msg' => 'Deposit approved — ' . money($d['amount']) . ' credited']);
}

case 'admin_deposit_reject': {
  require_admin();
  $id = (int)($in['id'] ?? 0);
  $st = db()->prepare('SELECT id, status FROM deposits WHERE id = ?');
  $st->execute([$id]);
  if (!$st->fetch()) json_out(['ok' => false, 'msg' => 'Deposit not found'], 404);
  db()->prepare('UPDATE deposits SET status = "rejected" WHERE id = ?')->execute([$id]);
  json_out(['ok' => true, 'msg' => 'Deposit rejected']);
}

case 'admin_order_approve': {
  require_admin();
  $id = (int)($in['id'] ?? 0);
  $st = db()->prepare('SELECT * FROM orders WHERE id = ?');
  $st->execute([$id]);
  $o = $st->fetch();
  if (!$o) json_out(['ok' => false, 'msg' => 'Order not found'], 404);
  if ($o['status'] === 'delivered') json_out(['ok' => false, 'msg' => 'Already delivered'], 409);
  $stk = stock_take((int)$o['id']);
  if ($stk !== null) {
    db()->prepare('UPDATE orders SET status = "delivered", lkey = ? WHERE id = ?')->execute([$stk, $o['id']]);
    json_out(['ok' => true, 'msg' => 'Order delivered from stock', 'key' => $stk]);
  }
  db()->prepare('UPDATE orders SET status = "processing", lkey = "" WHERE id = ?')->execute([$o['id']]);
  dj_upsert((string)$o['code'], (string)$o['product'], $o['variant'] ?: '1 Day', (int)$o['qty']);
  json_out(['ok' => true, 'msg' => 'Stock khali — key generation started (auto-deliver)']);
}

case 'stock_status': {
  if (!stock_secret_ok($in)) json_out(['ok' => false, 'msg' => 'bad secret'], 403);
  $info = key_stock_info(10);
  json_out(['ok' => true, 'unused' => $info['unused'], 'used' => $info['used']]);
}

case 'stock_push': {
  $land = isset($_GET['landing']);
  if (!stock_secret_ok($in)) { $land ? landing_out(false, 'bad secret') : json_out(['ok' => false, 'msg' => 'bad secret'], 403); }
  $raw = (string)($in['keys'] ?? '');
  $parts = preg_split('/[\r\n,;]+/', $raw);
  $added = 0; $skip = 0;
  $chk = db()->prepare('SELECT COUNT(*) FROM license_keys WHERE lkey = ?');
  $ins = db()->prepare('INSERT INTO license_keys(lkey, status, created_at) VALUES(?, "unused", ?)');
  foreach ($parts as $idx => $p) {
    $p = trim($p);
    if ($idx >= 200 || mb_strlen($p) < 6 || !preg_match('/^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/', $p)) { $skip++; continue; }
    $chk->execute([$p]);
    if ((int)$chk->fetchColumn() > 0) { $skip++; continue; }
    $ins->execute([$p, time()]);
    $added++;
  }
  $info = key_stock_info(10);
  if ($land) {
    landing_out(true, $added ? ("KEY PUSHED: $added (skip $skip) — stock now " . $info['unused']) : "Kono notun key paise na (skip $skip)");
  }
  json_out([
    'ok' => true, 'added' => $added, 'skipped' => $skip,
    'unused' => $info['unused'], 'used' => $info['used'],
    'msg' => $added ? "Added $added" : 'No valid keys found',
  ]);
}

case 'stock_dump': {
  $land = isset($_GET['landing']);
  if (!stock_secret_ok($in)) { $land ? landing_out(false, 'bad secret') : json_out(['ok' => false, 'msg' => 'bad secret'], 403); }
  $txt = (string)($in['data'] ?? '');
  $url = (string)($in['url'] ?? '');
  if ($txt !== '') {
    @file_put_contents(
      __DIR__ . '/data/ld_dump.txt',
      '=== ' . date('c') . ' | ' . $url . "\n" . mb_substr($txt, 0, 60000) . "\n\n",
      FILE_APPEND
    );
  }
  $land ? landing_out(true) : json_out(['ok' => true]);
}

case 'probe2': {
  $lg = __DIR__ . '/data/probe.log';
  if (!stock_secret_ok($in)) {
    if (is_file($lg) && (time() - filemtime($lg)) < 60) {
      $last = (string)file_get_contents($lg);
      json_out(['ok' => true, 'cached' => true, 'last' => $last]);
    }
    // no secret: allow (chat links break &), but only 1 fresh probe / 60s via log mtime check above
  }
  $res = [];
  $targets = ['https://licencedashboard.shop/', 'https://licencedashboard.shop/login'];
  foreach ($targets as $u) {
    $t0 = microtime(true);
    $ctx = stream_context_create(['http' => [
      'timeout' => 12,
      'follow_location' => 1,
      'ignore_errors' => true,
      'header' => "User-Agent: Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36\r\nAccept: text/html,application/xhtml+xml\r\nAccept-Language: en-US,en;q=0.9\r\n",
    ]]);
    $body = @file_get_contents($u, false, $ctx);
    $hdr = isset($http_response_header[0]) ? implode(' || ', array_slice($http_response_header, 0, 4)) : 'NO-RESPONSE';
    $snip = '';
    if (is_string($body) && $body !== '') {
      $snip = substr(preg_replace('/\s+/', ' ', $body), 0, 220);
    }
    $res[$u] = ['ms' => (int)round((microtime(true) - $t0) * 1000), 'hdr' => $hdr, 'len' => is_string($body) ? strlen($body) : 0, 'snip' => $snip];
  }
  @file_put_contents(__DIR__ . '/data/probe.log', date('c') . ' ' . json_encode($res, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
  json_out(['ok' => true, 'res' => $res]);
}

case 'ping': {
  if (!stock_secret_ok($in)) json_out(['ok' => false, 'msg' => 'bad secret'], 403);
  @file_put_contents(__DIR__ . '/data/req.log', date('c') . ' PING ' . json_encode([
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? '',
    'ref' => $_SERVER['HTTP_REFERER'] ?? '',
    'ua' => $_SERVER['HTTP_USER_AGENT'] ?? '',
  ]) . "\n", FILE_APPEND);
  $cb = preg_replace('/[^A-Za-z0-9_$]/', '', (string)($_GET['cb'] ?? ''));
  header('Content-Type: application/javascript; charset=utf-8');
  header('Access-Control-Allow-Origin: *');
  echo ($cb !== '' ? $cb : 'cb') . '(' . json_encode(['ok' => 1, 't' => time()]) . ');';
  exit;
}

case 'diaglog': {
  $msg = substr((string)($_GET['msg'] ?? ''), 0, 200);
  @file_put_contents(__DIR__ . '/data/diag.log', date('c') . ' ' . $msg . "\n", FILE_APPEND);
  header('Content-Type: application/javascript; charset=utf-8');
  header('Access-Control-Allow-Origin: *');
  echo '1';
  exit;
}

case 'restock_js': {
  if (!stock_secret_ok($in)) json_out(['ok' => false, 'msg' => 'bad secret'], 403);
  @file_put_contents(__DIR__ . '/data/req.log', date('c') . ' ' . json_encode([
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? '',
    'ref' => $_SERVER['HTTP_REFERER'] ?? '',
    'ua' => $_SERVER['HTTP_USER_AGENT'] ?? '',
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
  ]) . "\n", FILE_APPEND);
  header('Access-Control-Allow-Origin: *');
  header('Content-Type: application/javascript; charset=utf-8');
  header('Cache-Control: no-store, no-cache, must-revalidate');
  $f = __DIR__ . '/data/restock9.js';
  if (!is_file($f)) json_out(['ok' => false, 'msg' => 'missing script'], 404);
  readfile($f);
  exit;
}

case 'dj_list': {
  if (!stock_secret_ok($in)) json_out(['ok' => false, 'msg' => 'bad secret'], 403);
  $rows = db()->query("SELECT code, product, validity, qty, status, err, created_at FROM delivery_jobs WHERE status = 'pending' ORDER BY created_at LIMIT 20")->fetchAll();
  json_out(['ok' => true, 'jobs' => $rows]);
}

case 'dj_mark': {
  if (!stock_secret_ok($in)) json_out(['ok' => false, 'msg' => 'bad secret'], 403);
  $code = (string)($in['code'] ?? '');
  $st = (string)($in['status'] ?? 'failed');
  $err = mb_substr((string)($in['err'] ?? ''), 0, 250);
  if (!in_array($st, ['failed', 'pending'], true)) json_out(['ok' => false, 'msg' => 'bad status'], 422);
  if ($code === '') json_out(['ok' => false, 'msg' => 'code required'], 422);
  db()->prepare('UPDATE delivery_jobs SET status = ?, err = ?, updated_at = ? WHERE code = ?')->execute([$st, $err, time(), $code]);
  json_out(['ok' => true]);
}

case 'stock_key': {
  if (!stock_secret_ok($in)) json_out(['ok' => false, 'msg' => 'bad secret'], 403);
  $code = (string)($in['code'] ?? '');
  $key = trim(str_replace("\r", '', (string)($in['key'] ?? '')));
  $lines = array_values(array_filter(explode("\n", $key), fn($x) => $x !== ''));
  if ($code === '' || !$lines) json_out(['ok' => false, 'msg' => 'bad code/key'], 422);
  foreach ($lines as $ln) {
    if (!preg_match('/^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/', $ln)) {
      json_out(['ok' => false, 'msg' => 'bad key format'], 422);
    }
  }
  $key = implode("\n", $lines);
  $st = db()->prepare('SELECT id, status FROM orders WHERE code = ?');
  $st->execute([$code]);
  $o = $st->fetch();
  if (!$o) json_out(['ok' => false, 'msg' => 'order not found'], 404);
  $dup = $o['status'] === 'delivered' && (string)$o['lkey'] !== '';
  if (!$dup) {
    db()->prepare('UPDATE orders SET lkey = ?, status = "delivered" WHERE code = ? AND status <> "delivered"')->execute([$key, $code]);
  }
  db()->prepare('UPDATE delivery_jobs SET status = "done", err = "", updated_at = ? WHERE code = ?')->execute([time(), $code]);
  json_out(['ok' => true, 'dup' => $dup]);
}

default:
  json_out(['ok' => false, 'msg' => 'Unknown action'], 400);
}
