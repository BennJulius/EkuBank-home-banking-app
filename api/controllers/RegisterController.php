<?php
$allowed_origins = ['https://ekubank.ekubyte.net.pe', 'http://localhost:5173', 'http://localhost:5174'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../config/database.php';
$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->dni) && !empty($data->email) && !empty($data->password) && !empty($data->nombre) && !empty($data->apellido)) {

    $dni      = htmlspecialchars(strip_tags(trim($data->dni)));
    $email    = htmlspecialchars(strip_tags(trim($data->email)));
    $nombre   = htmlspecialchars(strip_tags(trim($data->nombre)));
    $apellido = htmlspecialchars(strip_tags(trim($data->apellido)));

    // Validaciones básicas
    if (strlen($dni) !== 8 || !ctype_digit($dni)) {
        echo json_encode(["success" => false, "message" => "El DNI debe tener exactamente 8 dígitos."]);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "El correo electrónico no es válido."]);
        exit;
    }
    if (strlen($data->password) !== 6 || !ctype_digit($data->password)) {
        echo json_encode(["success" => false, "message" => "La clave debe ser exactamente 6 dígitos numéricos."]);
        exit;
    }

    // Hash seguro de la contraseña
    $passwordHash = password_hash($data->password, PASSWORD_BCRYPT);

    try {
        $db->beginTransaction();

        $uid = $db->query("SELECT UUID()")->fetchColumn();

        $stmtU = $db->prepare("INSERT INTO usuarios_mock (id, email, password_hash, nombre, apellido) VALUES (?, ?, ?, ?, ?)");
        $stmtU->execute([$uid, $email, $passwordHash, $nombre, $apellido]);

        $stmtP = $db->prepare("INSERT INTO perfiles_clientes (user_id, dni, nombres, apellidos) VALUES (?, ?, ?, ?)");
        $stmtP->execute([$uid, $dni, $nombre, $apellido]);

        $numCuenta = "019-" . rand(1000000, 9999999);
        $stmtC = $db->prepare("INSERT INTO cuentas (user_id, tipo, numero_cuenta, saldo) VALUES (?, 'ahorro', ?, 0.00)");
        $stmtC->execute([$uid, $numCuenta]);

        $db->commit();
        echo json_encode(["success" => true, "message" => "¡Cuenta creada exitosamente! Ya puedes iniciar sesión."]);
    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "El DNI o correo ya están registrados."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Completa todos los campos requeridos."]);
}
?>
