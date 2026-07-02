<?php
$allowed_origins = ['https://ekubank.ekubyte.net.pe', 'http://localhost:5173', 'http://localhost:5174'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

// --- Logout ---
if (isset($data->action) && $data->action === 'logout' && !empty($data->token)) {
    $db->prepare("DELETE FROM sesiones WHERE token = ?")->execute([$data->token]);
    echo json_encode(["success" => true, "message" => "Sesión cerrada."]);
    exit();
}

// --- Validar sesión ---
if (isset($data->action) && $data->action === 'validar_sesion' && !empty($data->token)) {
    $stmt = $db->prepare("
        SELECT s.user_id, s.rol, s.expira, p.nombres, p.dni, c.saldo
        FROM sesiones s
        JOIN perfiles_clientes p ON s.user_id = p.user_id
        LEFT JOIN cuentas c ON s.user_id = c.user_id
        WHERE s.token = ? AND s.expira > NOW()
        LIMIT 1
    ");
    $stmt->execute([$data->token]);
    $sesion = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($sesion) {
        echo json_encode([
            "success" => true,
            "user" => [
                "nombre" => $sesion['nombres'],
                "dni" => $sesion['dni'],
                "saldo" => $sesion['saldo'],
                "rol" => $sesion['rol'],
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Sesión expirada o inválida."]);
    }
    exit();
}

// --- Login ---
if (!empty($data->dni) && !empty($data->password)) {
    $identifier = htmlspecialchars(strip_tags(trim($data->dni)));
    $identifier = str_replace([' ', '-'], '', $identifier);
    $user->dni = $identifier;
    $user->password = $data->password;
    $rolSolicitado = $data->rol ?? 'cliente';

    // --- Rate limiting: bloqueo incremental (1 min, 5 min, 10 min) ---
    $stmtCheck = $db->prepare("SELECT intentos, bloqueado_hasta FROM intentos_login WHERE identifier = ?");
    $stmtCheck->execute([$identifier]);
    $attempt = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if ($attempt && $attempt['bloqueado_hasta'] && strtotime($attempt['bloqueado_hasta']) > time()) {
        $restante = strtotime($attempt['bloqueado_hasta']) - time();
        $minutos = ceil($restante / 60);
        http_response_code(429);
        echo json_encode([
            "success" => false,
            "message" => "Cuenta bloqueada por seguridad. Intenta en $minutos minuto(s).",
            "bloqueado" => true,
            "bloqueado_hasta" => $attempt['bloqueado_hasta'],
            "segundos_restantes" => $restante
        ]);
        exit();
    }

    // Si el bloqueo ya expiró, solo limpiar la fecha del bloqueo pero mantener los intentos
    if ($attempt && $attempt['bloqueado_hasta'] && strtotime($attempt['bloqueado_hasta']) <= time()) {
        $db->prepare("UPDATE intentos_login SET bloqueado_hasta = NULL WHERE identifier = ?")->execute([$identifier]);
        $attempt['bloqueado_hasta'] = null;
    }

    $loginExitoso = false;
    $userData = null;
    $userId = null;
    $rolFinal = 'cliente';

    if ($rolSolicitado === 'asesor') {
        $stmt = $db->prepare("
            SELECT u.id, u.password_hash, u.rol, p.nombres, p.dni
            FROM usuarios_mock u
            JOIN perfiles_clientes p ON u.id = p.user_id
            WHERE p.dni = :dni AND u.rol IN ('asesor', 'admin', 'administrador')
            LIMIT 1
        ");
        $stmt->bindParam(':dni', $user->dni);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($user->password, $row['password_hash'])) {
                $loginExitoso = true;
                $userId = $row['id'];
                $rolFinal = $row['rol'];
                $userData = [
                    "nombre" => $row['nombres'],
                    "dni"    => $row['dni'],
                    "rol"    => $row['rol'],
                ];
            }
        }
    } else {
        $stmt = $user->login();
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($user->password, $row['password_hash'])) {
                $loginExitoso = true;
                $userId = $row['id'];
                $rolFinal = 'cliente';
                $userData = [
                    "nombre" => $row['nombres'],
                    "dni"    => $row['dni'],
                    "saldo"  => $row['saldo'],
                ];
            }
        }
    }

    if ($loginExitoso) {
        // Resetear intentos
        $db->prepare("DELETE FROM intentos_login WHERE identifier = ?")->execute([$identifier]);

        // Generar token de sesión
        $token = bin2hex(random_bytes(48));
        $expira = date('Y-m-d H:i:s', strtotime('+8 hours'));

        // Eliminar sesiones anteriores del usuario
        $db->prepare("DELETE FROM sesiones WHERE user_id = ?")->execute([$userId]);

        $db->prepare("INSERT INTO sesiones (user_id, token, rol, expira) VALUES (?, ?, ?, ?)")
           ->execute([$userId, $token, $rolFinal, $expira]);

        $userData['token'] = $token;

        echo json_encode([
            "success" => true,
            "user" => $userData
        ]);
    } else {
        // Registrar intento fallido
        $intentosActuales = ($attempt['intentos'] ?? 0) + 1;

        // Registrar en alertas de seguridad
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'Desconocido';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Desconocido';
        
        // Tratar de obtener un navegador legible a partir del UA
        $browser = "Dispositivo Desconocido";
        if (strpos($ua, 'Chrome') !== false) { $browser = 'Google Chrome'; }
        elseif (strpos($ua, 'Safari') !== false) { $browser = 'Safari'; }
        elseif (strpos($ua, 'Firefox') !== false) { $browser = 'Mozilla Firefox'; }
        elseif (strpos($ua, 'Edge') !== false) { $browser = 'Microsoft Edge'; }

        // Crear la tabla si no existe
        $db->exec("CREATE TABLE IF NOT EXISTS `alertas_seguridad` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `identifier` VARCHAR(100) NOT NULL,
          `fecha` DATETIME NOT NULL,
          `ip_address` VARCHAR(50) DEFAULT 'Desconocido',
          `user_agent` VARCHAR(255) DEFAULT 'Desconocido',
          `visto` TINYINT(1) DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $db->prepare("INSERT INTO alertas_seguridad (identifier, fecha, ip_address, user_agent) VALUES (?, NOW(), ?, ?)")
           ->execute([$identifier, $ip, $browser]);

        if ($intentosActuales % 3 === 0) {
            $bloqueoMinutos = 1;
            if ($intentosActuales == 6) {
                $bloqueoMinutos = 5;
            } elseif ($intentosActuales >= 9) {
                $bloqueoMinutos = 10;
            }

            $bloqueadoHasta = date('Y-m-d H:i:s', strtotime("+$bloqueoMinutos minutes"));
            $db->prepare("
                INSERT INTO intentos_login (identifier, intentos, bloqueado_hasta, ultimo_intento)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE intentos = ?, bloqueado_hasta = ?, ultimo_intento = NOW()
            ")->execute([$identifier, $intentosActuales, $bloqueadoHasta, $intentosActuales, $bloqueadoHasta]);

            $segundosRestantes = $bloqueoMinutos * 60;
            http_response_code(429);
            echo json_encode([
                "success" => false,
                "message" => "Has superado los $intentosActuales intentos permitidos. Tu cuenta ha sido bloqueada por $bloqueoMinutos minuto(s).",
                "bloqueado" => true,
                "bloqueado_hasta" => $bloqueadoHasta,
                "segundos_restantes" => $segundosRestantes
            ]);
        } else {
            $db->prepare("
                INSERT INTO intentos_login (identifier, intentos, ultimo_intento)
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE intentos = ?, ultimo_intento = NOW()
            ")->execute([$identifier, $intentosActuales, $intentosActuales]);

            $restantes = 3 - ($intentosActuales % 3);
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Contraseña incorrecta. Te quedan $restantes intentos antes del bloqueo.",
                "intentos_restantes" => $restantes
            ]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan datos."]);
}
?>
