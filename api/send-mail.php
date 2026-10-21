<?php
/**
 * TDA Engineering Studio — Production Email Dispatcher
 * Native PHP with direct Gmail SMTP (SSL:465 / TLS:587) & mail() fallback
 */

// Error handling - never output HTML errors in API response
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

// Health check / GET support
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['status' => 'active', 'service' => 'TDA Mail Dispatcher', 'time' => date('r')]);
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

// Clean app password (remove spaces if present)
$smtpPassClean = str_replace(' ', '', $smtpPass);

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

/**
 * Send email via native socket connection to Gmail SMTP over SSL
 */
function sendViaGmailSmtp($user, $pass, $to, $subject, $htmlBody, $replyEmail, $replyName) {
    $host = 'smtp.gmail.com';
    $port = 465;
    $timeout = 12;

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false
        ]
    ]);

    $socket = @stream_socket_client("ssl://{$host}:{$port}", $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        throw new Exception("SMTP SSL socket connection failed: {$errstr} ({$errno})");
    }

    stream_set_timeout($socket, $timeout);

    $read = function() use ($socket) {
        $res = '';
        while ($line = fgets($socket, 515)) {
            $res .= $line;
            if (preg_match('/^\d{3}\s/', $line)) break;
        }
        return $res;
    };

    $cmd = function($c, $expected) use ($socket, $read) {
        fwrite($socket, $c . "\r\n");
        $res = $read();
        $code = substr($res, 0, 3);
        if ($code != $expected) {
            throw new Exception("SMTP error on '{$c}': Expected {$expected}, received: {$res}");
        }
        return $res;
    };

    $greet = $read();
    if (substr($greet, 0, 3) != '220') {
        throw new Exception("Invalid greeting: {$greet}");
    }

    $cmd('EHLO tda.workn.in', '250');
    $cmd('AUTH LOGIN', '334');
    $cmd(base64_encode($user), '334');
    $cmd(base64_encode($pass), '235');
    $cmd("MAIL FROM:<{$user}>", '250');
    $cmd("RCPT TO:<{$to}>", '250');
    $cmd('DATA', '354');

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
        "X-Mailer: TDA-Native-Mailer/1.0"
    ];

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($htmlBody)) . "\r\n.";
    $cmd($payload, '250');

    fwrite($socket, "QUIT\r\n");
    fclose($socket);
    return true;
}

// Attempt SMTP dispatch
$success = false;
$errorMessage = '';

try {
    sendViaGmailSmtp($smtpUser, $smtpPassClean, 'tdawebservices@gmail.com', $subject, $htmlBody, $email, $name);
    $success = true;
} catch (Exception $e) {
    $errorMessage = $e->getMessage();
}

// Fallback to PHP mail() function if socket failed
if (!$success) {
    $headers = [
        "MIME-Version: 1.0",
        "Content-type: text/html; charset=UTF-8",
        "From: TDA Studio <{$smtpUser}>",
        "Reply-To: {$name} <{$email}>",
        "X-Mailer: PHP/" . phpversion()
    ];
    $mailSuccess = @mail('tdawebservices@gmail.com', $subject, $htmlBody, implode("\r\n", $headers));
    if ($mailSuccess) {
        $success = true;
    }
}

if ($success) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Your inquiry has been sent directly to our senior engineers! We will respond within 4 hours.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Delivery failed: ' . $errorMessage
    ]);
}
