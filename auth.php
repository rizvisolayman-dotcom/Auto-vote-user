<?php
require_once __DIR__ . '/lib.php';
session_start_safe();

$action = $_GET['action'] ?? '';
$in = post_json();

if ($action !== 'me') csrf_check();

switch ($action) {

case 'me':
  json_out(['ok' => true, 'user' => user_json(current_user()), 'csrf' => csrf_token()]);

case 'register': {
  $name = trim((string)($in['name'] ?? ''));
  $email = norm_email((string)($in['email'] ?? ''));
  $phone = trim((string)($in['phone'] ?? ''));
  $pass = (string)($in['password'] ?? '');
  if (mb_strlen($name) < 2) json_out(['ok' => false, 'msg' => 'Enter your full name.'], 422);
  if (!valid_email($email)) json_out(['ok' => false, 'msg' => 'Enter a valid email address.'], 422);
  if (mb_strlen($pass) < 6) json_out(['ok' => false, 'msg' => 'Password must be at least 6 characters.'], 422);
  $st = db()->prepare('SELECT 1 FROM users WHERE email = ?');
  $st->execute([$email]);
  if ($st->fetch()) json_out(['ok' => false, 'msg' => 'An account with this email already exists.'], 409);
  $code = gen_code(8);
  $st = db()->prepare('INSERT INTO users(name,email,phone,pass_hash,recovery_code,created_at) VALUES(?,?,?,?,?,?)');
  $st->execute([$name, $email, $phone, password_hash($pass, PASSWORD_DEFAULT), $code, time()]);
  $_SESSION['uid'] = (int)db()->lastInsertId();
  json_out(['ok' => true, 'msg' => 'Account created — welcome!', 'user' => user_json(current_user())]);
}

case 'login': {
  $email = norm_email((string)($in['email'] ?? ''));
  $pass = (string)($in['password'] ?? '');
  $st = db()->prepare('SELECT * FROM users WHERE email = ?');
  $st->execute([$email]);
  $u = $st->fetch();
  if (!$u || !password_verify($pass, $u['pass_hash'])) {
    json_out(['ok' => false, 'msg' => 'Incorrect email or password.'], 401);
  }
  $_SESSION['uid'] = (int)$u['id'];
  json_out(['ok' => true, 'msg' => 'Welcome back, ' . $u['name'] . '!', 'user' => user_json($u)]);
}

case 'logout':
  $_SESSION = [];
  session_destroy();
  json_out(['ok' => true, 'msg' => 'Signed out']);

case 'forgot': {
  $email = norm_email((string)($in['email'] ?? ''));
  if (!valid_email($email)) json_out(['ok' => false, 'msg' => 'Enter a valid email address.'], 422);
  $st = db()->prepare('SELECT * FROM users WHERE email = ?');
  $st->execute([$email]);
  $u = $st->fetch();
  // always same response (don't leak accounts) but keep link path for existing
  $resp = ['ok' => true, 'msg' => 'If an account exists, a reset link was sent to ' . $email . '.'];
  if ($u) {
    $tok = bin2hex(random_bytes(24));
    $exp = time() + 1800;
    db()->prepare('UPDATE users SET reset_token = ?, reset_exp = ? WHERE id = ?')
        ->execute([hash('sha256', $tok), $exp, $u['id']]);
    $link = base_url() . '/index.php?reset=' . $tok;
    $body = "Hi " . $u['name'] . ",\n\n"
          . "Someone (hopefully you) asked to reset the password for " . SITE['name'] . ".\n\n"
          . "Open this link to choose a new password (valid for 30 minutes, one time only):\n"
          . $link . "\n\n"
          . "If you didn't request this, you can safely ignore this email.\n\n"
          . SITE['owner'];
    $sent = send_mail($email, SITE['name'] . ' — password reset link', $body);
    if (!$sent) $resp['dev_link'] = $link; // mail() unavailable → show link in UI
  }
  json_out($resp);
}

case 'reset': {
  $tok = (string)($in['token'] ?? '');
  $pass = (string)($in['password'] ?? '');
  if (mb_strlen($pass) < 6) json_out(['ok' => false, 'msg' => 'Password must be at least 6 characters.'], 422);
  $st = db()->prepare('SELECT * FROM users WHERE reset_token = ? AND reset_exp > ?');
  $st->execute([hash('sha256', $tok), time()]);
  $u = $st->fetch();
  if (!$u) json_out(['ok' => false, 'msg' => 'This reset link is invalid or has already been used.'], 410);
  db()->prepare('UPDATE users SET pass_hash = ?, reset_token = "", reset_exp = 0 WHERE id = ?')
      ->execute([password_hash($pass, PASSWORD_DEFAULT), $u['id']]);
  json_out(['ok' => true, 'msg' => 'Password updated — please login with your new password.']);
}

default:
  json_out(['ok' => false, 'msg' => 'Unknown action'], 400);
}
