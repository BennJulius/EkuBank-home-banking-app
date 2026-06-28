<?php
$allowed_origins = ['https://ekubank.ekubyte.net.pe', 'http://localhost:5173', 'http://localhost:5174'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

function validarToken($db, $rolRequerido = null) {
    $headers = getallheaders();
    $token = null;

    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    }

    if (!$token) {
        $data = json_decode(file_get_contents("php://input"));
        $token = $data->token ?? null;
    }

    if (!$token) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token de sesión requerido."]);
        exit();
    }

    $stmt = $db->prepare("SELECT user_id, rol, expira FROM sesiones WHERE token = ? AND expira > NOW() LIMIT 1");
    $stmt->execute([$token]);
    $sesion = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$sesion) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Sesión expirada. Inicia sesión nuevamente."]);
        exit();
    }

    if ($rolRequerido && $sesion['rol'] !== $rolRequerido && $sesion['rol'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "No tienes permisos para esta acción."]);
        exit();
    }

    return $sesion;
}
?>
