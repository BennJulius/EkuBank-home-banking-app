<?php
$allowed_origins = ['https://ekubank.ekubyte.net.pe', 'http://localhost:5173', 'http://localhost:5174'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Content-Type: application/json; charset=UTF-8");

// Respuesta por defecto si entran a la raíz de la API
echo json_encode(array(
    "status" => "online",
    "message" => "API del Core Bancario EkuBank funcionando. Por favor, utilice los endpoints del controlador (ej. /controllers/AuthController.php) para realizar peticiones."
));
?>