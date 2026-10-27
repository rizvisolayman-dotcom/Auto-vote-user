<?php
require_once __DIR__ . '/config.php';

date_default_timezone_set('Asia/Dhaka');

function db_driver(): string {
  return strtolower(DB_DRIVER) === 'mysql' ? 'mysql' : 'sqlite';
}

function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  $opts = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ];
  if (db_driver() === 'mysql') {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $opts);
  } else {
    if (!is_dir(dirname(DB_FILE))) mkdir(dirname(DB_FILE), 0775, true);
    $pdo = new PDO('sqlite:' . DB_FILE, null, null, $opts);
    $pdo->exec('PRAGMA journal_mode=WAL');
    $pdo->exec('PRAGMA foreign_keys=ON');
  }
  migrate($pdo);
  return $pdo;
}

function migrate(PDO $pdo): void {
  $my = db_driver() === 'mysql';
  $ddl = $my ? [
    'CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL DEFAULT "",
      email VARCHAR(190) NOT NULL UNIQUE,
      phone VARCHAR(40) NOT NULL DEFAULT "",
      pass_hash VARCHAR(255) NOT NULL,
      recovery_code VARCHAR(32) NOT NULL DEFAULT "",
      balance DOUBLE NOT NULL DEFAULT 0,
      reset_token VARCHAR(80) NOT NULL DEFAULT "",
      reset_exp INT NOT NULL DEFAULT 0,
      created_at INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      sort INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name VARCHAR(190) NOT NULL,
      icon VARCHAR(50) NOT NULL DEFAULT "android",
      price DOUBLE NOT NULL,
      verified TINYINT NOT NULL DEFAULT 1,
      tags VARCHAR(255) NOT NULL DEFAULT "",
      sort INT NOT NULL DEFAULT 0,
      INDEX ix_products_cat (category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'CREATE TABLE IF NOT EXISTS variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      label VARCHAR(50) NOT NULL,
      mult DOUBLE NOT NULL DEFAULT 1,
      stock INT NOT NULL DEFAULT 0,
      INDEX ix_variants_pid (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      product VARCHAR(190) NOT NULL,
      variant VARCHAR(50) NOT NULL DEFAULT "",
      qty INT NOT NULL DEFAULT 1,
      amount DOUBLE NOT NULL,
      method VARCHAR(20) NOT NULL,
      trx VARCHAR(100) NOT NULL DEFAULT "",
      from_id VARCHAR(60) NOT NULL DEFAULT "",
      shot VARCHAR(190) NOT NULL DEFAULT "",
      status VARCHAR(20) NOT NULL DEFAULT "pending",
      lkey VARCHAR(60) NOT NULL DEFAULT "",
      created_at INT NOT NULL DEFAULT 0,
      INDEX ix_orders_uid (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'CREATE TABLE IF NOT EXISTS deposits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      amount DOUBLE NOT NULL,
      method VARCHAR(20) NOT NULL DEFAULT "binance",
      trx VARCHAR(100) NOT NULL DEFAULT "",
      status VARCHAR(20) NOT NULL DEFAULT "pending",
      created_at INT NOT NULL DEFAULT 0,
      INDEX ix_deposits_uid (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'CREATE TABLE IF NOT EXISTS coupons (
      code VARCHAR(20) PRIMARY KEY,
      percent DOUBLE NOT NULL,
      min_amount DOUBLE NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'CREATE TABLE IF NOT EXISTS settings (
      k VARCHAR(50) PRIMARY KEY,
      v TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'CREATE TABLE IF NOT EXISTS license_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lkey VARCHAR(190) NOT NULL,
      status VARCHAR(10) NOT NULL DEFAULT "unused",
      order_id INT NOT NULL DEFAULT 0,
      created_at INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'CREATE TABLE IF NOT EXISTS delivery_jobs (
      code VARCHAR(20) PRIMARY KEY,
      product VARCHAR(190) NOT NULL,
      validity VARCHAR(50) NOT NULL,
      qty INT NOT NULL DEFAULT 1,
      status VARCHAR(10) NOT NULL DEFAULT "pending",
      err VARCHAR(255) NOT NULL DEFAULT "",
      created_at INT NOT NULL DEFAULT 0,
      updated_at INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
  ] : [
    'CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT "",
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT "",
      pass_hash TEXT NOT NULL,
      recovery_code TEXT NOT NULL DEFAULT "",
      balance REAL NOT NULL DEFAULT 0,
      reset_token TEXT DEFAULT "",
      reset_exp INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT 0
    )',
    'CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort INTEGER NOT NULL DEFAULT 0
    )',
    'CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT "android",
      price REAL NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      tags TEXT NOT NULL DEFAULT "",
      sort INTEGER NOT NULL DEFAULT 0
    )',
    'CREATE TABLE IF NOT EXISTS variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      mult REAL NOT NULL DEFAULT 1,
      stock INTEGER NOT NULL DEFAULT 0
    )',
    'CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      product TEXT NOT NULL,
      variant TEXT NOT NULL DEFAULT "",
      qty INTEGER NOT NULL DEFAULT 1,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      trx TEXT NOT NULL DEFAULT "",
      from_id TEXT NOT NULL DEFAULT "",
      shot TEXT NOT NULL DEFAULT "",
      status TEXT NOT NULL DEFAULT "pending",
      lkey TEXT NOT NULL DEFAULT "",
      created_at INTEGER NOT NULL DEFAULT 0
    )',
    'CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL DEFAULT "binance",
      trx TEXT NOT NULL DEFAULT "",
      status TEXT NOT NULL DEFAULT "pending",
      created_at INTEGER NOT NULL DEFAULT 0
    )',
    'CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      percent REAL NOT NULL,
      min_amount REAL NOT NULL DEFAULT 0
    )',
    'CREATE TABLE IF NOT EXISTS settings (
      k TEXT PRIMARY KEY,
      v TEXT NOT NULL DEFAULT ""
    )',
    'CREATE TABLE IF NOT EXISTS license_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lkey TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT "unused",
      order_id INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT 0
    )',
    'CREATE TABLE IF NOT EXISTS delivery_jobs (
      code TEXT PRIMARY KEY,
      product TEXT NOT NULL,
      validity TEXT NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT "pending",
      err TEXT NOT NULL DEFAULT "",
      created_at INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT 0
    )',
  ];
  foreach ($ddl as $sql) $pdo->exec($sql);

  // add products.image column on old databases
  $hasImg = false;
  if ($my) {
    foreach ($pdo->query('SHOW COLUMNS FROM products') as $c) if ($c['Field'] === 'image') $hasImg = true;
  } else {
    foreach ($pdo->query('PRAGMA table_info(products)') as $c) if ($c['name'] === 'image') $hasImg = true;
  }
  if (!$hasImg) $pdo->exec('ALTER TABLE products ADD COLUMN image ' . ($my ? 'VARCHAR(255) NOT NULL DEFAULT ""' : 'TEXT NOT NULL DEFAULT ""'));

  $seed = (int)$pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
  if ($seed === 0) seed($pdo);

  // default admin credentials (change from the panel afterwards)
  $st = $pdo->prepare('SELECT v FROM settings WHERE k = ?');
  $st->execute(['admin_user']);
  if (!$st->fetchColumn()) {
    $ins = $pdo->prepare(db_driver() === 'mysql'
      ? 'INSERT IGNORE INTO settings(k,v) VALUES(?,?)'
      : 'INSERT OR IGNORE INTO settings(k,v) VALUES(?,?)');
    $ins->execute(['admin_user', 'admin']);
    $ins->execute(['admin_hash', password_hash('Solayman@123', PASSWORD_DEFAULT)]);
  }
}

function setting_get(string $k, string $d = ''): string {
  $st = db()->prepare('SELECT v FROM settings WHERE k = ?');
  $st->execute([$k]);
  $v = $st->fetchColumn();
  return $v === false ? $d : (string)$v;
}

function setting_set(string $k, string $v): void {
  $my = db_driver() === 'mysql';
  if ($my) {
    db()->prepare('INSERT INTO settings(k,v) VALUES(?,?) ON DUPLICATE KEY UPDATE v = VALUES(v)')->execute([$k, $v]);
  } else {
    db()->prepare('INSERT INTO settings(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute([$k, $v]);
  }
}

function pay_details(): array {
  return [
    'binance'  => setting_get('pay_binance', SITE['binance_pay_id']),
    'merchant' => setting_get('pay_merchant', SITE['merchant']),
    'seller'   => setting_get('pay_seller', SITE['owner']),
  ];
}

function require_admin(): void {
  session_start_safe();
  if (empty($_SESSION['admin'])) json_out(['ok' => false, 'msg' => 'Admin login required.'], 401);
}

function seed(PDO $pdo): void {
  $cats = ['ANDROID','ANDROID PROXY','ANDROID ROOT','GUILD GLORY','IOS HACK','PC HACK'];
  $ins = $pdo->prepare('INSERT INTO categories(name,sort) VALUES(?,?)');
  foreach ($cats as $i => $c) $ins->execute([$c, $i]);

  $cids = [];
  foreach ($pdo->query('SELECT id,name FROM categories') as $r) $cids[$r['name']] = $r['id'];

  $products = [
    ['BALAMOD ANDROID','ANDROID',25,1,'android','ANDROID,MOD'],
    ['Drip Android ApkMod','ANDROID',60,1,'android','ANDROID,APK'],
    ['Hg Cheat ApkMod','ANDROID',80,1,'android','ANDROID,APK'],
    ['Prime Apkmod','ANDROID',50,1,'android','ANDROID,APK'],
    ['Abcd Mod Apk','ANDROID',60,1,'android','ANDROID,APK'],
    ['Pato Blue ApkMod','ANDROID',200,1,'android','ANDROID,PAID'],
    ['Pato Green ApkMod','ANDROID',200,1,'android','ANDROID,PAID'],
    ['Pato Orange ApkMod','ANDROID',300,1,'android','ANDROID,PAID'],
    ['Pato Yellow','ANDROID',200,1,'android','ANDROID,PAID'],
    ['AimHack Android + IOS','ANDROID',20,1,'mobile','ANDROID,IOS'],
    ['Drip Wire Android','ANDROID',50,0,'android','ANDROID'],
    ['Xreg Android + IOS','ANDROID',20,1,'mobile','ANDROID,IOS'],
    ['Drip Proxy Apk','ANDROID PROXY',100,1,'globe','PROXY,APK'],
    ['Hg Proxy Android','ANDROID PROXY',80,1,'globe','PROXY,ANDROID'],
    ['HG Prime Proxy New','ANDROID PROXY',50,1,'globe','PROXY,NEW'],
    ['ANGRY MOD','ANDROID ROOT',70,1,'terminal','ROOT,MOD'],
    ['HAXXCKER ROOT INDIA','ANDROID ROOT',800,1,'terminal','ROOT,PRO'],
    ['BrMod Root Android','ANDROID ROOT',70,1,'terminal','ROOT,ANDROID'],
    ['Drip Root Android','ANDROID ROOT',100,1,'terminal','ROOT,ANDROID'],
    ['Hex Blade Root','ANDROID ROOT',100,1,'terminal','ROOT'],
    ['LKTEAM Root + PC','ANDROID ROOT',80,1,'terminal','ROOT,PC'],
    ['Reaper X Pro','ANDROID ROOT',250,1,'terminal','ROOT,PRO'],
    ['RapidCore Root Injector','ANDROID ROOT',100,1,'terminal','ROOT,INJECTOR'],
    ['Unseen Mods Root','ANDROID ROOT',50,0,'terminal','ROOT'],
    ['Crack Master Root','ANDROID ROOT',50,1,'terminal','ROOT'],
    ['GUILD GLORY','GUILD GLORY',110,1,'trophy','GUILD,RANK'],
    ['MIGUL IOS PANEL','IOS HACK',2000,1,'apple','IOS,PANEL'],
    ['Gbox Esign Cert','IOS HACK',500,1,'apple','IOS,CERT'],
    ['Brmod SilentAim PC','PC HACK',120,1,'desktop','PC,MENU'],
    ['Brmod X86 Menu','PC HACK',150,1,'desktop','PC,MENU'],
    ['Drip Aimkill Pc','PC HACK',110,1,'desktop','PC'],
    ['Dustu AimKill PC','PC HACK',100,1,'desktop','PC'],
    ['MI ACCOUNT','PC HACK',1000,1,'user-shield','ACCOUNT,PC'],
  ];
  $ip = $pdo->prepare('INSERT INTO products(category_id,name,price,verified,icon,tags,sort) VALUES(?,?,?,?,?,?,?)');
  $iv = $pdo->prepare('INSERT INTO variants(product_id,label,mult,stock) VALUES(?,?,?,?)');
  $stocks = [[1, '1 Day', 1, 12], [7, '7 Days', 5, 6], [30, '30 Days', 15, 3]];
  foreach ($products as $i => [$n,$c,$p,$v,$ic,$t]) {
    $ip->execute([$cids[$c], $n, $p, $v, $ic, $t, $i]);
    $pid = (int)$pdo->lastInsertId();
    if ($v) {
      foreach ($stocks as [$days, $label, $mult, $stock]) {
        $iv->execute([$pid, $label, $mult, $stock]);
      }
    }
  }

  $ig = db_driver() === 'mysql' ? 'INSERT IGNORE INTO coupons(code,percent,min_amount) VALUES(?,?,?)'
                                : 'INSERT OR IGNORE INTO coupons(code,percent,min_amount) VALUES(?,?,?)';
  $ic = $pdo->prepare($ig);
  $ic->execute(['SAVE10', 10, 100]);
  $ic->execute(['SOLAY15', 15, 300]);
  $ic->execute(['CHEAT20', 20, 600]);

  $sg = db_driver() === 'mysql' ? 'INSERT IGNORE INTO settings(k,v) VALUES(?,?)'
                                : 'INSERT OR IGNORE INTO settings(k,v) VALUES(?,?)';
  $is = $pdo->prepare($sg);
  $is->execute(['token', bin2hex(random_bytes(16))]);
}

function session_start_safe(): void {
  if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
  }
}

function csrf_token(): string {
  session_start_safe();
  if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
  return $_SESSION['csrf'];
}

function csrf_check(): void {
  session_start_safe();
  $in = $_SERVER['HTTP_X_CSRF'] ?? '';
  if (empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], (string)$in)) {
    json_out(['ok' => false, 'msg' => 'Session expired — refresh the page.'], 403);
  }
}

function json_out($data, int $code = 200): never {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function post_json(): array {
  $raw = file_get_contents('php://input') ?: '';
  $d = json_decode($raw, true);
  if (!is_array($d)) {
    $d = $_POST;
  }
  return $d;
}

function current_user(): ?array {
  session_start_safe();
  if (empty($_SESSION['uid'])) return null;
  $st = db()->prepare('SELECT * FROM users WHERE id = ?');
  $st->execute([$_SESSION['uid']]);
  $u = $st->fetch();
  return $u ?: null;
}

function user_json(?array $u): ?array {
  if (!$u) return null;
  return [
    'id' => (int)$u['id'],
    'name' => $u['name'],
    'email' => $u['email'],
    'phone' => $u['phone'],
    'balance' => (float)$u['balance'],
    'recovery_code' => $u['recovery_code'],
    'created' => (int)$u['created_at'],
  ];
}

function require_user(): array {
  $u = current_user();
  if (!$u) json_out(['ok' => false, 'msg' => 'Please login first.'], 401);
  return $u;
}

function norm_email(string $e): string {
  return strtolower(trim($e));
}

function valid_email(string $e): bool {
  return (bool)filter_var($e, FILTER_VALIDATE_EMAIL);
}

function gen_code(int $n = 6): string {
  $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  $s = '';
  for ($i = 0; $i < $n; $i++) $s .= $chars[random_int(0, strlen($chars) - 1)];
  return $s;
}

function gen_order_code(): string {
  return 'ORD' . strtoupper(bin2hex(random_bytes(4)));
}

function gen_key(): string {
  $blocks = [];
  for ($i = 0; $i < 4; $i++) $blocks[] = strtoupper(bin2hex(random_bytes(2)));
  return implode('-', $blocks);
}

function dj_upsert(string $code, string $product, string $validity, int $qty): void {
  $now = time();
  if (db_driver() === 'mysql') {
    db()->prepare('REPLACE INTO delivery_jobs(code,product,validity,qty,status,err,created_at,updated_at) VALUES(?,?,?,?,"pending","",?,?)')
        ->execute([$code, $product, $validity, $qty, $now, $now]);
  } else {
    db()->prepare("INSERT INTO delivery_jobs(code,product,validity,qty,status,err,created_at,updated_at) VALUES(?,?,?,?,'pending','',?,?)
                   ON CONFLICT(code) DO UPDATE SET product=excluded.product, validity=excluded.validity, qty=excluded.qty, status='pending', err='', updated_at=excluded.updated_at")
        ->execute([$code, $product, $validity, $qty, $now, $now]);
  }
}

function stock_take(int $orderId = 0): ?string {
  $st = db()->prepare('SELECT id, lkey FROM license_keys WHERE status = "unused" ORDER BY id LIMIT 1');
  $st->execute();
  $row = $st->fetch();
  if (!$row) return null;
  $up = db()->prepare('UPDATE license_keys SET status = "used", order_id = ? WHERE id = ? AND status = "unused"');
  $up->execute([$orderId, (int)$row['id']]);
  if ($up->rowCount() < 1) return null;
  return (string)$row['lkey'];
}

// take one unused key from stock for an order; fallback: random key
function deliver_key(int $orderId): string {
  $st = db()->prepare('SELECT id, lkey FROM license_keys WHERE status = "unused" ORDER BY id LIMIT 1');
  $st->execute();
  $row = $st->fetch();
  if ($row) {
    $up = db()->prepare('UPDATE license_keys SET status = "used", order_id = ? WHERE id = ? AND status = "unused"');
    $up->execute([$orderId, (int)$row['id']]);
    if ($up->rowCount() > 0) return (string)$row['lkey'];
  }
  return gen_key();
}

function key_stock_info(int $limit = 100): array {
  $unused = (int)db()->query('SELECT COUNT(*) FROM license_keys WHERE status = "unused"')->fetchColumn();
  $used = (int)db()->query('SELECT COUNT(*) FROM license_keys WHERE status = "used"')->fetchColumn();
  $list = db()->query('SELECT id, lkey, status, order_id, created_at FROM license_keys ORDER BY id DESC LIMIT ' . max(1, min(500, $limit)))->fetchAll();
  return [
    'unused' => $unused,
    'used' => $used,
    'list' => array_map(fn($k) => [
      'id' => (int)$k['id'], 'key' => $k['lkey'], 'status' => $k['status'],
      'order' => (int)$k['order_id'],
      'date' => date('d M Y H:i', (int)$k['created_at']),
    ], $list),
  ];
}

function money($v): string {
  return '$' . number_format((float)$v, 2);
}

function send_mail(string $to, string $subject, string $body): bool {
  if (MAIL_MODE === 'emailjs') {
    $ok = emailjs_send($to, $subject, $body);
    @file_put_contents(__DIR__ . '/data/mail.log', date('c') . " -> $to | $subject | " . ($ok ? 'OK' : 'FAIL') . "\n", FILE_APPEND);
    return $ok;
  }
  if (MAIL_MODE !== 'mail') return false;
  $hdr = 'From: ' . SITE['email_from_name'] . ' <' . email_from() . ">\r\n"
       . "Reply-To: " . SITE['support_email'] . "\r\n"
       . "Content-Type: text/plain; charset=utf-8\r\n";
  $ok = @mail($to, $subject, $body, $hdr);
  @file_put_contents(__DIR__ . '/data/mail.log', date('c') . " -> $to | $subject | " . ($ok ? 'OK' : 'FAIL') . "\n", FILE_APPEND);
  return $ok;
}

function emailjs_send(string $to, string $subject, string $body): bool {
  $link = '';
  if (preg_match('~https?://\S+~', $body, $m)) $link = rtrim($m[0], '.,)');
  $payload = json_encode([
    'service_id'    => EMAILJS['service_id'],
    'template_id'   => EMAILJS['template_id'],
    'user_id'       => EMAILJS['public_key'],
    'accessToken'   => EMAILJS['private_key'],
    'template_params' => [
      'to_email'    => $to,
      'subject'     => $subject,
      'reset_link'  => $link,
      'message'     => $body,
      'from_name'   => SITE['email_from_name'],
      'reply_to'    => SITE['support_email'],
      'support'     => SITE['support_email'],
      'site_name'   => SITE['name'],
    ],
  ], JSON_UNESCAPED_UNICODE);
  $ch = curl_init('https://api.emailjs.com/api/v1.0/email/send');
  curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 20,
  ]);
  $res  = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($code !== 200) {
    @file_put_contents(__DIR__ . '/data/mail.log', date('c') . " emailjs $code: " . substr((string)$res, 0, 200) . "\n", FILE_APPEND);
  }
  return $code === 200;
}

function base_url(): string {
  if (SITE['base_url']) return SITE['base_url'];
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  $dir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
  return ($https ? 'https' : 'http') . '://' . $host . $dir;
}
