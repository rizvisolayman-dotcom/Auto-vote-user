<?php
require_once __DIR__ . '/lib.php';
session_start_safe();
csrf_check();

$u = require_user();
$in = post_json();

$pid = (int)($in['product_id'] ?? 0);
$vid = (int)($in['variant_id'] ?? 0);
$qty = max(1, (int)($in['qty'] ?? 1));
$method = (string)($in['method'] ?? 'binance');
$keytype = trim((string)($in['keytype'] ?? 'android_id'));
$android_id = trim((string)($in['android_id'] ?? ''));
$trx = trim((string)($in['trx'] ?? ''));
$from_id = trim((string)($in['from_id'] ?? ''));
$coupon = strtoupper(trim((string)($in['coupon'] ?? '')));

$st = db()->prepare('SELECT * FROM products WHERE id = ?');
$st->execute([$pid]);
$p = $st->fetch();
if (!$p) json_out(['ok' => false, 'msg' => 'Product not found'], 404);

$variant = ['id' => 0, 'label' => '', 'mult' => 1.0, 'stock' => 0];
if ($vid) {
  $vs = db()->prepare('SELECT * FROM variants WHERE id = ? AND product_id = ?');
  $vs->execute([$vid, $pid]);
  $v = $vs->fetch();
  if (!$v) json_out(['ok' => false, 'msg' => 'Variant not found'], 404);
  $variant = ['id' => (int)$v['id'], 'label' => $v['label'], 'mult' => (float)$v['mult'], 'stock' => (int)$v['stock']];
}

$subtotal = (float)$p['price'] * $variant['mult'] * $qty;
$discount = 0.0;

if ($coupon) {
  $cs = db()->prepare('SELECT * FROM coupons WHERE code = ?');
  $cs->execute([$coupon]);
  $c = $cs->fetch();
  if (!$c) json_out(['ok' => false, 'msg' => 'Invalid coupon code'], 422);
  if ($subtotal < (float)$c['min_amount']) {
    json_out(['ok' => false, 'msg' => 'Minimum order ' . money($c['min_amount']) . ' required for this coupon'], 422);
  }
  $discount = round($subtotal * ((float)$c['percent'] / 100), 2);
}
$amount = round($subtotal - $discount, 2);

if ($variant['id'] && $variant['stock'] > 0 && $variant['stock'] < $qty) {
  json_out(['ok' => false, 'msg' => 'Only ' . $variant['stock'] . ' left in stock'], 409);
}

$code = gen_order_code();
$key = gen_key();

try {
  db()->beginTransaction();

  if ($variant['id'] && $variant['stock'] > 0) {
    $upd = db()->prepare('UPDATE variants SET stock = stock - ? WHERE id = ? AND stock >= ?');
    $upd->execute([$qty, $variant['id'], $qty]);
    if ($upd->rowCount() !== 1) throw new RuntimeException('Out of stock');
  }

  if ($method === 'balance') {
    $dep = db()->prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?');
    $dep->execute([$amount, $u['id'], $amount]);
    if ($dep->rowCount() !== 1) throw new RuntimeException('Insufficient balance — add funds first');

    $freshBal = function () use ($u) {
      $fr = db()->prepare('SELECT balance FROM users WHERE id = ?');
      $fr->execute([$u['id']]);
      return (float)$fr->fetchColumn();
    };

    // 1) stock-e key thakle instant deliver
    $stk = stock_take();
    if ($stk !== null) {
      db()->prepare('INSERT INTO orders(code,user_id,product,variant,qty,amount,method,from_id,shot,status,lkey,created_at)
                     VALUES(?,?,?,?,?,?,?,?,?,"delivered",?,?)')
          ->execute([$code, $u['id'], $p['name'], $variant['label'], $qty, $amount, 'balance', '', '', $stk, time()]);
      db()->commit();
      json_out([
        'ok' => true,
        'delivered' => true,
        'status' => 'delivered',
        'msg' => 'Order delivered instantly',
        'code' => $code,
        'key' => $stk,
        'amount' => $amount,
        'balance' => $freshBal(),
      ]);
    }

    // 2) stock khali → processing + auto job
    $vlabel = $variant['label'] ?: '1 Day';
    db()->prepare('INSERT INTO orders(code,user_id,product,variant,qty,amount,method,from_id,shot,status,lkey,created_at)
                   VALUES(?,?,?,?,?,?,?,?,?,"processing","",?)')
        ->execute([$code, $u['id'], $p['name'], $variant['label'], $qty, $amount, 'balance', '', '', time()]);
    dj_upsert($code, $p['name'], $vlabel, $qty);

    db()->commit();
    json_out([
      'ok' => true,
      'delivered' => false,
      'status' => 'processing',
      'msg' => 'Paid — stock khali, key generate hocche, orders-e auto asbe',
      'code' => $code,
      'amount' => $amount,
      'balance' => $freshBal(),
    ]);
  }

  // binance / manual gateway → pending until approved
  db()->prepare('INSERT INTO orders(code,user_id,product,variant,qty,amount,method,trx,from_id,status,created_at)
                 VALUES(?,?,?,?,?,?,?,?,?,"pending",?)')
      ->execute([$code, $u['id'], $p['name'], $variant['label'], $qty, $amount, $method, $trx, $from_id, time()]);

  db()->commit();
  json_out([
    'ok' => true,
    'delivered' => false,
    'msg' => 'Order placed — waiting for payment confirmation',
    'code' => $code,
    'amount' => $amount,
  ]);

} catch (Throwable $e) {
  if (db()->inTransaction()) db()->rollBack();
  json_out(['ok' => false, 'msg' => $e->getMessage()], 422);
}
