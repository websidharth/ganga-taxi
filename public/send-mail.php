<?php
// =============================================
// PURE EMAIL SENDER – no database, no signup
// =============================================

// ----- CORS (allows your frontend to call this) -----
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// ----- Handle preflight OPTIONS request -----
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ----- Only POST allowed -----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed. Use POST."]);
    exit();
}

// ----- Read and decode JSON input -----
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload"]);
    exit();
}

// ----- Validate required fields -----
$required = ['emailId', 'subject', 'title', 'body'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing or empty field: $field"]);
        exit();
    }
}

$to      = trim($data['emailId']);
$subject = trim($data['subject']);
$title   = trim($data['title']);
$body    = trim($data['body']);

// ----- Validate email format -----
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email address"]);
    exit();
}

// ----- Your branding -----
define('LOGO_URL', "https://cdn.repugen.com/src/cms/images/repugen-color-logo.svg");
define('FROM_EMAIL', "info@test.com");
define('FROM_NAME', "RepuGen");

// ----- Build HTML email with your template -----
$htmlMessage = <<<HTML
<html>
<head><title>$title</title></head>
<body>
    <div style="text-align: center; font-family: Arial, sans-serif;">
        <img src="$logo_url" alt="RepuGen Logo" style="width: 150px; margin-bottom: 20px;">
        <h2>$title</h2>
        $body
    </div>
</body>
</html>
HTML;

// ----- Headers -----
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
$headers .= "Reply-To: " . FROM_EMAIL . "\r\n";

// ----- Send email -----
if (mail($to, $subject, $htmlMessage, $headers)) {
    echo json_encode([
        "status" => 200,
        "message" => "Email sent successfully to $to"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to send email. Check server mail configuration."
    ]);
}