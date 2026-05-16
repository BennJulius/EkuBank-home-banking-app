<?php
// Cabeceras de seguridad
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Respuesta por defecto si entran a la raíz de la API
echo json_encode(array(
    "status" => "online",
    "message" => "API del Core Bancario BBVA funcionando. Por favor, utilice los endpoints del controlador (ej. /controllers/AuthController.php) para realizar peticiones."
));
?>