<?php
/**
 * XSW Tools - Document Hub cPanel Storage Bridge
 * 
 * Secure upload & management API for sweetumolu.in
 * Keeps all files strictly isolated inside /public_html/xswtools/uploads/
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE, GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Secret Key for authenticating Next.js API requests
$SECRET_KEY = "XSW_SECURE_STORAGE_KEY_2026";

// Verify Bearer Authorization Token
$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
$token = trim(str_ireplace('Bearer ', '', $authHeader));

if (empty($token) || $token !== $SECRET_KEY) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized access: invalid or missing security token."]);
    exit;
}

// Base directory for all Document Hub storage
$baseUploadDir = __DIR__ . '/uploads/';

// Ensure directory exists with safe permissions
if (!is_dir($baseUploadDir)) {
    mkdir($baseUploadDir, 0755, true);
}

// -------------------------------------------------------------
// 1. FILE UPLOAD HANDLER (POST)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $uploadedFile = $_FILES['file'];

    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Upload failed with error code: " . $uploadedFile['error']]);
        exit;
    }

    $originalName = basename($uploadedFile['name']);
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    // Optional folder categorization (e.g. workspace or folder tag)
    $subfolder = isset($_POST['folder']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['folder']) : 'documents';
    $targetDir = $baseUploadDir . $subfolder . '/';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    // Generate clean, collision-free filename
    $cleanBase = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
    $cleanBase = substr($cleanBase, 0, 40);
    $uniqueName = time() . '_' . substr(bin2hex(random_bytes(4)), 0, 6) . '_' . $cleanBase . ($extension ? '.' . $extension : '');
    $targetPath = $targetDir . $uniqueName;

    if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
        $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        $relativeDir = trim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
        $baseUrl = $protocol . $host . ($relativeDir ? '/' . $relativeDir : '');

        $publicUrl = $baseUrl . '/uploads/' . $subfolder . '/' . $uniqueName;

        echo json_encode([
            "success" => true,
            "originalName" => $originalName,
            "storedName" => $subfolder . '/' . $uniqueName,
            "url" => $publicUrl,
            "sizeBytes" => filesize($targetPath),
            "mimeType" => $uploadedFile['type'] ?? 'application/octet-stream',
            "storedAt" => date("Y-m-d H:i:s")
        ]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to write file to disk."]);
        exit;
    }
}

// -------------------------------------------------------------
// 2. FILE DELETION HANDLER (DELETE or POST with _method=DELETE)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || (isset($_POST['_method']) && strtoupper($_POST['_method']) === 'DELETE')) {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?? $_POST;
    $storedName = $data['storedName'] ?? '';

    // Prevent directory traversal attacks
    $normalized = str_replace(['..', '\\'], ['', '/'], trim($storedName));
    $filePath = $baseUploadDir . $normalized;

    if (!empty($normalized) && file_exists($filePath) && is_file($filePath)) {
        unlink($filePath);
        echo json_encode(["success" => true, "deleted" => $normalized]);
        exit;
    }

    http_response_code(404);
    echo json_encode(["success" => false, "error" => "File not found or already deleted."]);
    exit;
}

// -------------------------------------------------------------
// 3. HEALTH CHECK / STATUS (GET)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $freeBytes = disk_free_space(__DIR__);
    $totalBytes = disk_total_space(__DIR__);

    echo json_encode([
        "success" => true,
        "service" => "XSW Tools cPanel Storage Engine",
        "domain" => $_SERVER['HTTP_HOST'] ?? 'sweetumolu.in',
        "folder" => "xswtools/uploads",
        "freeSpaceGB" => round($freeBytes / (1024 * 1024 * 1024), 2),
        "totalSpaceGB" => round($totalBytes / (1024 * 1024 * 1024), 2),
        "status" => "online"
    ]);
    exit;
}

http_response_code(400);
echo json_encode(["success" => false, "error" => "Invalid request method or missing parameters."]);
