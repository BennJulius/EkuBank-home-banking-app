<?php
include_once '../config/database.php';
$db = (new Database())->getConnection();
include_once '../config/auth.php';

$sesion = validarToken($db);
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->dni) && !empty($data->monto) && !empty($data->plazos)) {
    // IDOR: verificar que el DNI pertenece al usuario autenticado
    $stmtOwner = $db->prepare("SELECT user_id FROM perfiles_clientes WHERE dni = ? AND user_id = ?");
    $stmtOwner->execute([$data->dni, $sesion['user_id']]);
    $uid = $stmtOwner->fetchColumn();

    if($uid) {
        $tasa_anual = isset($data->tea) && in_array($data->tea, [0.4092, 0.4392]) ? $data->tea : 0.4392;
        $tasa_mensual = pow(1 + $tasa_anual, 1/12) - 1;
        $cuota = $data->monto * $tasa_mensual / (1 - pow(1 + $tasa_mensual, -$data->plazos));

        $dia_pago = isset($data->dia_pago) && in_array($data->dia_pago, [3, 5, 10, 15]) ? $data->dia_pago : 5;
        $fecha_desembolso = isset($data->fecha_desembolso) ? $data->fecha_desembolso : date('Y-m-d');
        $ingresos_declarados = isset($data->ingresos_declarados) ? floatval($data->ingresos_declarados) : null;
        $gastos_declarados = isset($data->gastos_declarados) ? floatval($data->gastos_declarados) : null;

        $ins = $db->prepare("INSERT INTO solicitudes_prestamo (user_id, monto, plazo_meses, tasa_anual, cuota_mensual, proposito, ingresos_declarados, gastos_declarados, dia_pago, fecha_desembolso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        if($ins->execute([$uid, $data->monto, $data->plazos, $tasa_anual, $cuota, $data->proposito, $ingresos_declarados, $gastos_declarados, $dia_pago, $fecha_desembolso])) {
            $prestamoId = $db->lastInsertId();
            echo json_encode(["success" => true, "message" => "Préstamo solicitado con éxito.", "prestamo_id" => $prestamoId]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al registrar solicitud."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Cliente no encontrado."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Faltan datos de la solicitud."]);
}
?>