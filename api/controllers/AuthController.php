<?php
// CABECERAS CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once '../models/User.php';

// Instanciar BD y Objeto User
$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Obtener los datos enviados desde React
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->dni) && !empty($data->password)) {
    
    // Asignar valores al modelo
    $user->dni = $data->dni;
    $user->password = $data->password;
    
    // Ejecutar método login
    $stmt = $user->login();
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login exitoso.",
            "user" => array(
                "nombre" => $row['nombre'],
                "dni" => $row['dni'],
                "saldo" => "S/ " . number_format($row['saldo'], 2)
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("success" => false, "message" => "Datos incorrectos. Verifica tu documento y contraseña."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Datos incompletos."));
}
?>