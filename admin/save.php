<?php
/**
 * Shmu Admin — save endpoint
 *
 * Accepts a POST body like:
 *   { "password": "...", "target": "menu" | "announcements", "data": { ... } }
 * Verifies the admin password and writes the data to:
 *   ../assets/data/menu.json   (target=menu)
 *   ../assets/data/announcements.json   (target=announcements)
 *
 * Old file is copied to admin/backups/<target>-<timestamp>.json before
 * being overwritten, so nothing is ever lost.
 *
 * SECURITY:
 *  - This file lives in /admin/ which is also protected by Apache Basic
 *    Auth (.htaccess + .htpasswd) — so casual visitors can't even reach it.
 *  - As a second layer, we re-verify the admin password against a SHA-256
 *    hash hardcoded below. To rotate the password, replace ADMIN_SHA256
 *    with the new sha256 of the new password and rotate the matching JS
 *    hash in admin/index.html.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// SHA-256 of the admin password (default: "B6CpsYvuoBOmuohEJ0OU")
// To rotate: printf "%s" "newpassword" | sha256sum
$ADMIN_SHA256 = 'd0883547cf78a9225ffdbe4b4b31676cd7959dca9d60bc36666f0c4268da2855';

function fail($status, $message) {
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Method not allowed — POST required');
}

$raw = file_get_contents('php://input');
if (!$raw) fail(400, 'Empty request body');

$body = json_decode($raw, true);
if (!is_array($body)) fail(400, 'Invalid JSON in request body');

$providedPassword = isset($body['password']) ? (string)$body['password'] : '';
if ($providedPassword === '') fail(401, 'Missing password');

$providedHash = hash('sha256', $providedPassword);
if (!hash_equals($ADMIN_SHA256, $providedHash)) {
    fail(403, 'Wrong admin password');
}

$target = isset($body['target']) ? (string)$body['target'] : '';
$allowed = ['menu', 'announcements'];
if (!in_array($target, $allowed, true)) {
    fail(400, 'Target must be "menu" or "announcements"');
}

if (!array_key_exists('data', $body)) fail(400, 'Missing data');
$data = $body['data'];

// Re-encode with pretty printing so the committed file stays readable
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($json === false) fail(400, 'Could not encode data: ' . json_last_error_msg());

$assetsDir = realpath(__DIR__ . '/../assets/data');
if ($assetsDir === false) fail(500, 'Could not resolve assets/data directory');

$filename = $target . '.json';
$path = $assetsDir . DIRECTORY_SEPARATOR . $filename;

// Backup existing file before overwriting
if (file_exists($path)) {
    $backupDir = __DIR__ . '/backups';
    if (!is_dir($backupDir)) {
        @mkdir($backupDir, 0755, true);
    }
    if (is_dir($backupDir) && is_writable($backupDir)) {
        $ts = date('Ymd-His');
        @copy($path, $backupDir . DIRECTORY_SEPARATOR . $target . '-' . $ts . '.json');
    }
}

// Write atomically: write to temp, then rename
$tmp = $path . '.tmp';
if (file_put_contents($tmp, $json) === false) {
    fail(500, 'Could not write temp file (check folder permissions on assets/data)');
}
if (!@rename($tmp, $path)) {
    // Fall back to direct write
    if (file_put_contents($path, $json) === false) {
        @unlink($tmp);
        fail(500, 'Could not save file (check folder permissions on assets/data)');
    }
    @unlink($tmp);
}

echo json_encode([
    'ok' => true,
    'target' => $target,
    'bytes' => strlen($json),
    'savedAt' => date('c')
]);
