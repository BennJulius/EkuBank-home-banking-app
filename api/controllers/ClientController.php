<?php
include_once '../config/database.php';
$db = (new Database())->getConnection();
include_once '../config/auth.php';

$sesion = validarToken($db);
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->dni)) {
    // IDOR protection: verificar que el DNI solicitado pertenece al usuario autenticado
    $stmtOwner = $db->prepare("SELECT user_id FROM perfiles_clientes WHERE dni = ? AND user_id = ?");
    $stmtOwner->execute([$data->dni, $sesion['user_id']]);
    if (!$stmtOwner->fetch() && $sesion['rol'] === 'cliente') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "No tienes permisos para ver estos datos."]);
        exit;
    }
    $queryCuenta = "SELECT c.numero_cuenta, c.saldo, c.user_id
                    FROM cuentas c
                    JOIN perfiles_clientes p ON c.user_id = p.user_id
                    WHERE p.dni = ? LIMIT 1";
    $stmtAcc = $db->prepare($queryCuenta);
    $stmtAcc->execute([$data->dni]);
    $cuenta = $stmtAcc->fetch(PDO::FETCH_ASSOC);

    $baseScore = 650;
    if ($cuenta) {
        $stmtScore = $db->prepare("SELECT score_transaccional FROM scores_transaccionales WHERE user_id = ? ORDER BY id DESC LIMIT 1");
        $stmtScore->execute([$cuenta['user_id']]);
        $scoreVal = $stmtScore->fetchColumn();
        if ($scoreVal !== false) {
            $baseScore = (int)$scoreVal;
        } else {
            $db->prepare("INSERT INTO scores_transaccionales (user_id, score_transaccional, fecha_calculo) VALUES (?, ?, CURDATE())")
               ->execute([$cuenta['user_id'], $baseScore]);
        }
    }

    $queryTx = "SELECT t.descripcion as name, DATE_FORMAT(t.fecha, '%d %b, %h:%i %p') as date,
                       CASE WHEN t.tipo = 'credito' THEN t.monto ELSE -t.monto END as amount,
                       CASE WHEN t.canal = 'homebanking' THEN 'bank'
                            WHEN t.canal = 'app_movil' THEN 'phone'
                            ELSE 'shop' END as category,
                       t.canal
                FROM transacciones t
                JOIN perfiles_clientes p ON t.user_id = p.user_id
                WHERE p.dni = ?
                ORDER BY t.fecha DESC LIMIT 5";
    $stmtTx = $db->prepare($queryTx);
    $stmtTx->execute([$data->dni]);
    $transacciones = $stmtTx->fetchAll(PDO::FETCH_ASSOC);

    $queryPrestamos = "SELECT
                          sp.id as codigo,
                          sp.monto,
                          sp.plazo_meses,
                          sp.cuota_mensual,
                          sp.tasa_anual,
                          sp.proposito,
                          sp.estado,
                          sp.observacion,
                          sp.dia_pago,
                          sp.fecha_desembolso,
                          ROUND(sp.cuota_mensual * sp.plazo_meses, 2) as total_a_pagar,
                          TIMESTAMPDIFF(MONTH, sp.created_at, NOW()) as meses_transcurridos,
                          DATE_FORMAT(sp.created_at, '%d/%m/%Y') as fecha_solicitud,
                          sp.created_at as fecha_solicitud_raw,
                          DATE_FORMAT(sp.fecha_evaluacion, '%d/%m/%Y') as fecha_evaluacion
                       FROM solicitudes_prestamo sp
                       JOIN perfiles_clientes p ON sp.user_id = p.user_id
                       WHERE p.dni = ?
                       ORDER BY sp.created_at DESC";
    $stmtPr = $db->prepare($queryPrestamos);
    $stmtPr->execute([$data->dni]);
    $prestamos = $stmtPr->fetchAll(PDO::FETCH_ASSOC);

    $maxPenalidad = 0;
    $now = new DateTime();
    $todayYm = $now->format('Y-m');

    foreach ($prestamos as &$pr) {
        if ($pr['estado'] === 'aprobado') {
            $fechaDesembolso = !empty($pr['fecha_desembolso']) ? $pr['fecha_desembolso'] : date('Y-m-d', strtotime($pr['fecha_solicitud_raw']));
            $diaPago = (int)$pr['dia_pago'];
            $plazo = (int)$pr['plazo_meses'];

            // 1. Obtener primer vencimiento (mínimo 15 días tras desembolso para evitar fechas en el pasado)
            $desDate = new DateTime($fechaDesembolso);
            $firstDueDate = new DateTime($desDate->format('Y-m-') . str_pad($diaPago, 2, '0', STR_PAD_LEFT));
            $minFirstDate = clone $desDate;
            $minFirstDate->modify('+15 days');
            if ($firstDueDate < $minFirstDate) {
                $firstDueDate->modify('+1 month');
            }

            // 2. Contar pagos reales
            $stmtCount = $db->prepare("
                SELECT COUNT(*) 
                FROM transacciones 
                WHERE user_id = ? 
                  AND descripcion LIKE ?
            ");
            $stmtCount->execute([
                $cuenta['user_id'], 
                "Pago Cuota Préstamo PRE-" . str_pad($pr['codigo'], 6, '0', STR_PAD_LEFT) . "%"
            ]);
            $pagosReales = (int)$stmtCount->fetchColumn();

            $pr['cuotas_pagadas'] = min($pagosReales, $plazo);
            $pr['cuotas_restantes'] = max(0, $plazo - $pr['cuotas_pagadas']);
            $pr['deuda_restante'] = round((float)$pr['cuota_mensual'] * $pr['cuotas_restantes'], 2);

            // 3. Determinar fecha del siguiente pago
            $nextDueDate = null;
            if ($pr['cuotas_restantes'] > 0) {
                $nextDueDate = clone $firstDueDate;
                if ($pr['cuotas_pagadas'] > 0) {
                    $nextDueDate->modify('+' . $pr['cuotas_pagadas'] . ' months');
                }
            }
            $pr['fecha_siguiente_pago'] = $nextDueDate ? $nextDueDate->format('d/m/Y') : null;

            // 4. Calcular cuotas vencidas a la fecha actual y días de atraso
            $diasAtraso = 0;
            $pagadoEsteMes = true;

            if ($nextDueDate) {
                $nextDueDateYm = $nextDueDate->format('Y-m');
                // Si la cuota por pagar vence en el mes actual o en el pasado
                if ($nextDueDateYm <= $todayYm) {
                    $pagadoEsteMes = false; // Requiere pago en este periodo
                    
                    // Si ya pasó la fecha de vencimiento física
                    if ($now >= $nextDueDate) {
                        $diff = $now->diff($nextDueDate);
                        $diasAtraso = (int)$diff->days;
                    }
                }
            }

            $pr['pagado_este_mes'] = $pagadoEsteMes;
            $pr['dias_atraso_mes'] = $diasAtraso;

            // Mapear penalidad en base a tramos (SBS)
            $penalidad = 0;
            if ($diasAtraso >= 1 && $diasAtraso <= 29) {
                $penalidad = 0; // SBS: Menor a 30 días de atraso mantiene calificación "Normal" y no afecta el score
            } elseif ($diasAtraso >= 30 && $diasAtraso <= 59) {
                $penalidad = 80; // Calificación CPP
            } elseif ($diasAtraso >= 60 && $diasAtraso <= 89) {
                $penalidad = 150; // Calificación Deficiente
            } elseif ($diasAtraso >= 90) {
                $penalidad = 300; // Calificación Dudoso/Pérdida
            }
            $maxPenalidad = max($maxPenalidad, $penalidad);
        } else {
            $pr['cuotas_pagadas'] = 0;
            $pr['cuotas_restantes'] = (int)$pr['plazo_meses'];
            $pr['deuda_restante'] = round((float)$pr['cuota_mensual'] * $pr['plazo_meses'], 2);
            $pr['pagado_este_mes'] = false;
            $pr['dias_atraso_mes'] = 0;
            $pr['fecha_siguiente_pago'] = null;
        }
    }
    unset($pr);

    $scoreCalculado = max(300, min(850, $baseScore - $maxPenalidad));

    // Obtener alertas de seguridad no vistas (intentos fallidos de inicio de sesión)
    $stmtAlertas = $db->prepare("
        SELECT id, DATE_FORMAT(fecha, '%d/%m/%Y a las %h:%i %p') as fecha_formateada, ip_address, user_agent 
        FROM alertas_seguridad 
        WHERE identifier = ? AND visto = 0 
        ORDER BY fecha DESC
    ");
    $stmtAlertas->execute([$data->dni]);
    $alertas = $stmtAlertas->fetchAll(PDO::FETCH_ASSOC);

    // Marcar las alertas como vistas para que solo aparezcan una vez al ingresar
    if (!empty($alertas)) {
        $db->prepare("UPDATE alertas_seguridad SET visto = 1 WHERE identifier = ? AND visto = 0")->execute([$data->dni]);
    }

    echo json_encode([
        "success" => true,
        "cuenta" => $cuenta['numero_cuenta'] ?? '0000-0000-0000',
        "saldo" => $cuenta['saldo'] ?? 0,
        "score" => $scoreCalculado,
        "transacciones" => $transacciones ?: [],
        "prestamos" => $prestamos ?: [],
        "alertas" => $alertas ?: [],
    ]);
} else {
    echo json_encode(["success" => false, "message" => "DNI no recibido"]);
}
?>