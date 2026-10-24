<?php
/**
 * TDA Engineering Studio — Production Email Dispatcher
 * Dual-Port Gmail SMTP (Port 465 SSL & Port 587 STARTTLS)
 * Zero external dependencies. Designed for OpenLiteSpeed & standard Linux hosting.
 */

// Error handling - never leak warnings into JSON output
error_reporting(E_ALL);
ini_set('display_errors', '0');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Preflight request handling
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Load credentials from environment or fallback constants
$envFile = dirname(__DIR__) . '/.env';
$smtpUser = 'tdawebservices@gmail.com';
$smtpPass = 'haqo oorc oeiu rbjx';

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($k, $v) = explode('=', $line, 2);
            $k = trim($k);
            $v = trim($v);
            if ($k === 'SMTP_USER' && !empty($v)) $smtpUser = $v;
            if ($k === 'SMTP_PASS' && !empty($v)) $smtpPass = $v;
        }
    }
}

// Clean app password (remove spaces)
$smtpPassClean = str_replace(' ', '', $smtpPass);

/**
 * Helper: Read multiline response from SMTP socket
 */
function smtpRead($socket) {
    $response = '';
    while ($line = fgets($socket, 515)) {
        $response .= $line;
        if (preg_match('/^\d{3}\s/', $line)) break;
    }
    return $response;
}

/**
 * Helper: Send command and verify response code
 */
function smtpCmd($socket, $cmd, $expectedCode, &$log = null) {
    if ($log !== null) $log[] = ">>> " . (strpos($cmd, 'AUTH') === 0 || strlen($cmd) > 100 ? '[CMD]' : $cmd);
    fwrite($socket, $cmd . "\r\n");
    $res = smtpRead($socket);
    if ($log !== null) $log[] = "<<< " . trim($res);
    $code = substr($res, 0, 3);
    if ($code != $expectedCode) {
        throw new Exception("SMTP error on '{$cmd}': Expected {$expectedCode}, received: {$res}");
    }
    return $res;
}

/**
 * Send email via Port 465 (Direct SSL)
 */
function sendSmtpPort465($user, $pass, $to, $subject, $htmlBody, $replyEmail, $replyName, &$log = null) {
    $host = 'smtp.gmail.com';
    $port = 465;
    $timeout = 8;

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client("ssl://{$host}:{$port}", $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        throw new Exception("Port 465 SSL connection failed: {$errstr} ({$errno})");
    }

    stream_set_timeout($socket, $timeout);

    $greet = smtpRead($socket);
    if ($log !== null) $log[] = "<<< Greet: " . trim($greet);
    if (substr($greet, 0, 3) != '220') {
        throw new Exception("Invalid greeting: {$greet}");
    }

    smtpCmd($socket, 'EHLO tda.workn.in', '250', $log);
    smtpCmd($socket, 'AUTH LOGIN', '334', $log);
    smtpCmd($socket, base64_encode($user), '334', $log);
    smtpCmd($socket, base64_encode($pass), '235', $log);
    smtpCmd($socket, "MAIL FROM:<{$user}>", '250', $log);
    smtpCmd($socket, "RCPT TO:<{$to}>", '250', $log);
    smtpCmd($socket, 'DATA', '354', $log);

    $fromHeader = '=?UTF-8?B?' . base64_encode('TDA Studio Inquiry') . "?= <{$user}>";
    $subjectHeader = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $replyHeader = !empty($replyName) ? '=?UTF-8?B?' . base64_encode($replyName) . "?= <{$replyEmail}>" : "<{$replyEmail}>";

    $headers = [
        "From: {$fromHeader}",
        "To: <{$to}>",
        "Reply-To: {$replyHeader}",
        "Subject: {$subjectHeader}",
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
        "Date: " . date('r'),
        "X-Mailer: TDA-Mailer-465/1.0"
    ];

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($htmlBody)) . "\r\n.";
    smtpCmd($socket, $payload, '250', $log);

    fwrite($socket, "QUIT\r\n");
    fclose($socket);
    return true;
}

/**
 * Send email via Port 587 (TCP + STARTTLS)
 */
function sendSmtpPort587($user, $pass, $to, $subject, $htmlBody, $replyEmail, $replyName, &$log = null) {
    $host = 'smtp.gmail.com';
    $port = 587;
    $timeout = 8;

    $socket = @stream_socket_client("tcp://{$host}:{$port}", $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT);
    if (!$socket) {
        throw new Exception("Port 587 TCP connection failed: {$errstr} ({$errno})");
    }

    stream_set_timeout($socket, $timeout);

    $greet = smtpRead($socket);
    if ($log !== null) $log[] = "<<< Greet: " . trim($greet);
    if (substr($greet, 0, 3) != '220') {
        throw new Exception("Invalid greeting: {$greet}");
    }

    smtpCmd($socket, 'EHLO tda.workn.in', '250', $log);
    smtpCmd($socket, 'STARTTLS', '220', $log);

    $cryptoMethod = STREAM_CRYPTO_METHOD_TLS_CLIENT;
    if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
        $cryptoMethod |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
    }
    if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) {
        $cryptoMethod |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
    }

    $cryptoSuccess = stream_socket_enable_crypto($socket, true, $cryptoMethod);
    if (!$cryptoSuccess) {
        throw new Exception("STARTTLS crypto handshake negotiation failed on Port 587");
    }
    if ($log !== null) $log[] = "STARTTLS encrypted session established";

    smtpCmd($socket, 'EHLO tda.workn.in', '250', $log);
    smtpCmd($socket, 'AUTH LOGIN', '334', $log);
    smtpCmd($socket, base64_encode($user), '334', $log);
    smtpCmd($socket, base64_encode($pass), '235', $log);
    smtpCmd($socket, "MAIL FROM:<{$user}>", '250', $log);
    smtpCmd($socket, "RCPT TO:<{$to}>", '250', $log);
    smtpCmd($socket, 'DATA', '354', $log);

    $fromHeader = '=?UTF-8?B?' . base64_encode('TDA Studio Inquiry') . "?= <{$user}>";
    $subjectHeader = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $replyHeader = !empty($replyName) ? '=?UTF-8?B?' . base64_encode($replyName) . "?= <{$replyEmail}>" : "<{$replyEmail}>";

    $headers = [
        "From: {$fromHeader}",
        "To: <{$to}>",
        "Reply-To: {$replyHeader}",
        "Subject: {$subjectHeader}",
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
        "Date: " . date('r'),
        "X-Mailer: TDA-Mailer-587/1.0"
    ];

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($htmlBody)) . "\r\n.";
    smtpCmd($socket, $payload, '250', $log);

    fwrite($socket, "QUIT\r\n");
    fclose($socket);
    return true;
}

// Live test mode (?test=1)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['test'])) {
    $testSubject = "[Live Test] TDA Mailer Diagnostic Check";
    $testBody = "<h1>TDA Live Diagnostic</h1><p>Sent at: " . date('r') . "</p>";
    $logs = [];
    $methodUsed = '';
    $err465 = '';
    $err587 = '';
    $ok = false;

    // Test Port 465
    try {
        $logs[] = "Attempting Port 465 (SSL)...";
        sendSmtpPort465($smtpUser, $smtpPassClean, 'tdawebservices@gmail.com', $testSubject, $testBody, $smtpUser, 'Test Runner', $logs);
        $ok = true;
        $methodUsed = 'Port 465 (SSL)';
    } catch (Exception $e) {
        $err465 = $e->getMessage();
        $logs[] = "Port 465 failed: " . $err465;
    }

    // Test Port 587 if 465 failed
    if (!$ok) {
        try {
            $logs[] = "Attempting Port 587 (STARTTLS)...";
            sendSmtpPort587($smtpUser, $smtpPassClean, 'tdawebservices@gmail.com', $testSubject, $testBody, $smtpUser, 'Test Runner', $logs);
            $ok = true;
            $methodUsed = 'Port 587 (STARTTLS)';
        } catch (Exception $e) {
            $err587 = $e->getMessage();
            $logs[] = "Port 587 failed: " . $err587;
        }
    }

    echo json_encode([
        'success' => $ok,
        'method' => $methodUsed,
        'port_465_error' => $err465,
        'port_587_error' => $err587,
        'logs' => $logs
    ], JSON_PRETTY_PRINT);
    exit;
}

// Normal GET health check
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'active',
        'service' => 'TDA Dual-Port Mail Dispatcher',
        'ports_supported' => [465, 587],
        'time' => date('r')
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

// Parse request body (JSON or Form URL-encoded)
$rawInput = file_get_contents('php://input');
$data = [];
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}
if (empty($data) && !empty($_POST)) {
    $data = $_POST;
}

$name     = trim($data['name'] ?? 'Prospective Client');
$email    = trim($data['email'] ?? '');
$interest = trim($data['interest'] ?? 'General Inquiry');
$store    = trim($data['store'] ?? 'Not specified');
$message  = trim($data['message'] ?? 'No message provided.');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A valid email address is required.']);
    exit;
}

$subject = "[New Inquiry] " . $interest . " from " . $name;
$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeInterest = htmlspecialchars($interest, ENT_QUOTES, 'UTF-8');
$safeStore = htmlspecialchars($store, ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

$htmlBody = <<<HTML
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 28px; background: #FEF3E2; color: #1C150C; border-radius: 8px;">
  <h2 style="color: #891818; margin-top: 0; font-size: 22px; border-bottom: 2px solid #891818; padding-bottom: 10px;">
    New Inquiry Received — TDA Engineering Studio
  </h2>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #6E5D4B;">Client Name:</td>
      <td style="padding: 8px 0; font-size: 16px;">{$safeName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #6E5D4B;">Email Address:</td>
      <td style="padding: 8px 0; font-size: 16px;"><a href="mailto:{$safeEmail}" style="color: #891818; font-weight: bold;">{$safeEmail}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #6E5D4B;">Interest / Product:</td>
      <td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: #891818;">{$safeInterest}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #6E5D4B;">Store URL / Stack:</td>
      <td style="padding: 8px 0; font-size: 16px;">{$safeStore}</td>
    </tr>
  </table>
  <div style="margin-top: 24px; padding: 18px; background: #ffffff; border: 1px solid rgba(28,21,12,0.15); border-radius: 6px;">
    <strong style="color: #1C150C; display: block; margin-bottom: 8px;">Message / Project Requirements:</strong>
    <div style="font-size: 15px; line-height: 1.6; white-space: pre-wrap;">{$safeMessage}</div>
  </div>
  <p style="margin-top: 24px; font-size: 12px; color: #9C8974; border-top: 1px solid rgba(28,21,12,0.1); padding-top: 12px;">
    This inquiry was submitted via the TDA Engineering Showcase website.
  </p>
</div>
HTML;

// Dispatch via Dual-Port Strategy (Never fake success!)
$success = false;
$methodUsed = '';
$error465 = '';
$error587 = '';

// Attempt 1: Port 465 (SSL)
try {
    sendSmtpPort465($smtpUser, $smtpPassClean, 'tdawebservices@gmail.com', $subject, $htmlBody, $email, $name);
    $success = true;
    $methodUsed = 'Port 465 (SSL)';
} catch (Exception $e) {
    $error465 = $e->getMessage();
}

// Attempt 2: Port 587 (STARTTLS) if 465 failed
if (!$success) {
    try {
        sendSmtpPort587($smtpUser, $smtpPassClean, 'tdawebservices@gmail.com', $subject, $htmlBody, $email, $name);
        $success = true;
        $methodUsed = 'Port 587 (STARTTLS)';
    } catch (Exception $e) {
        $error587 = $e->getMessage();
    }
}

if ($success) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'method' => $methodUsed,
        'message' => 'Your inquiry has been sent directly to our senior engineers! We will respond within 4 hours.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'SMTP delivery failed on both ports. Port 465: ' . $error465 . ' | Port 587: ' . $error587,
        'details' => [
            'port_465' => $error465,
            'port_587' => $error587
        ]
    ]);
}
