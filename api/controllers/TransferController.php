<?php
include_once '../config/database.php';
$db = (new Database())->getConnection();
include_once '../config/auth.php';

$sesion = validarToken($db);
$data = json_decode(file_get_contents("php://input"));

// Acción: transferir, recargar, o consultar extracto
$action = $data->action ?? '';

// ============================================
// TRANSFERENCIA entre cuentas EkuBank
// ============================================
if ($action === 'transferir') {
    $dniOrigen  = htmlspecialchars(strip_tags(trim($data->dni_origen ?? '')));
    $dniDestino = htmlspecialchars(strip_tags(trim($data->dni_destino ?? '')));
    $monto      = floatval($data->monto ?? 0);
    $descripcion = htmlspecialchars(strip_tags(trim($data->descripcion ?? 'Transferencia EkuBank')));

    // IDOR: verificar que el DNI origen pertenece al usuario autenticado
    $stmtOwner = $db->prepare("SELECT user_id FROM perfiles_clientes WHERE dni = ? AND user_id = ?");
    $stmtOwner->execute([$dniOrigen, $sesion['user_id']]);
    if (!$stmtOwner->fetch()) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "No autorizado para operar esta cuenta."]);
        exit;
    }

    if (empty($dniOrigen) || empty($dniDestino) || $monto <= 0) {
        echo json_encode(["success" => false, "message" => "Datos incompletos."]);
        exit;
    }
    if ($dniOrigen === $dniDestino) {
        echo json_encode(["success" => false, "message" => "No puedes transferirte a ti mismo."]);
        exit;
    }

    try {
        $db->beginTransaction();

        // Buscar cuenta origen
        $stO = $db->prepare("SELECT c.id, c.user_id, c.saldo FROM cuentas c JOIN perfiles_clientes p ON c.user_id = p.user_id WHERE p.dni = ? LIMIT 1");
        $stO->execute([$dniOrigen]);
        $origen = $stO->fetch(PDO::FETCH_ASSOC);

        if (!$origen) { $db->rollBack(); echo json_encode(["success" => false, "message" => "Cuenta origen no encontrada."]); exit; }
        if ($origen['saldo'] < $monto) { $db->rollBack(); echo json_encode(["success" => false, "message" => "Saldo insuficiente. Disponible: S/ " . number_format($origen['saldo'], 2)]); exit; }

        // Buscar cuenta destino
        $stD = $db->prepare("SELECT c.id, c.user_id FROM cuentas c JOIN perfiles_clientes p ON c.user_id = p.user_id WHERE p.dni = ? LIMIT 1");
        $stD->execute([$dniDestino]);
        $destino = $stD->fetch(PDO::FETCH_ASSOC);

        if (!$destino) { $db->rollBack(); echo json_encode(["success" => false, "message" => "El DNI destino no existe en EkuBank."]); exit; }

        // Debitar origen
        $db->prepare("UPDATE cuentas SET saldo = saldo - ? WHERE id = ?")->execute([$monto, $origen['id']]);

        // Acreditar destino
        $db->prepare("UPDATE cuentas SET saldo = saldo + ? WHERE id = ?")->execute([$monto, $destino['id']]);

        // Registrar transacción origen (débito)
        $db->prepare("INSERT INTO transacciones (user_id, descripcion, tipo, monto, canal) VALUES (?, ?, 'debito', ?, 'homebanking')")
           ->execute([$origen['user_id'], "Transferencia a DNI " . $dniDestino . " - " . $descripcion, $monto]);

        // Registrar transacción destino (crédito)
        $db->prepare("INSERT INTO transacciones (user_id, descripcion, tipo, monto, canal) VALUES (?, ?, 'credito', ?, 'homebanking')")
           ->execute([$destino['user_id'], "Transferencia de DNI " . $dniOrigen . " - " . $descripcion, $monto]);

        $db->commit();

        // Obtener nuevo saldo
        $nuevoSaldo = $db->prepare("SELECT saldo FROM cuentas WHERE id = ?");
        $nuevoSaldo->execute([$origen['id']]);

        echo json_encode([
            "success" => true,
            "message" => "Transferencia realizada exitosamente.",
            "nuevo_saldo" => $nuevoSaldo->fetchColumn()
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Error en la transferencia."]);
    }
}

// ============================================
// RECARGA de celular (simula débito)
// ============================================
elseif ($action === 'recargar') {
    $dni       = htmlspecialchars(strip_tags(trim($data->dni ?? '')));
    $telefono  = htmlspecialchars(strip_tags(trim($data->telefono ?? '')));
    $operador  = htmlspecialchars(strip_tags(trim($data->operador ?? '')));
    $monto     = floatval($data->monto ?? 0);

    // IDOR: verificar propiedad
    $stmtOwner = $db->prepare("SELECT user_id FROM perfiles_clientes WHERE dni = ? AND user_id = ?");
    $stmtOwner->execute([$dni, $sesion['user_id']]);
    if (!$stmtOwner->fetch()) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "No autorizado para operar esta cuenta."]);
        exit;
    }

    if (empty($dni) || empty($telefono) || $monto <= 0) {
        echo json_encode(["success" => false, "message" => "Datos incompletos."]);
        exit;
    }
    if ($monto < 3 || $monto > 100) {
        echo json_encode(["success" => false, "message" => "Monto de recarga: mínimo S/ 3, máximo S/ 100."]);
        exit;
    }

    try {
        $db->beginTransaction();

        $st = $db->prepare("SELECT c.id, c.user_id, c.saldo FROM cuentas c JOIN perfiles_clientes p ON c.user_id = p.user_id WHERE p.dni = ? LIMIT 1");
        $st->execute([$dni]);
        $cuenta = $st->fetch(PDO::FETCH_ASSOC);

        if (!$cuenta) { $db->rollBack(); echo json_encode(["success" => false, "message" => "Cuenta no encontrada."]); exit; }
        if ($cuenta['saldo'] < $monto) { $db->rollBack(); echo json_encode(["success" => false, "message" => "Saldo insuficiente."]); exit; }

        $db->prepare("UPDATE cuentas SET saldo = saldo - ? WHERE id = ?")->execute([$monto, $cuenta['id']]);
        $db->prepare("INSERT INTO transacciones (user_id, descripcion, tipo, monto, canal) VALUES (?, ?, 'debito', ?, 'app_movil')")
           ->execute([$cuenta['user_id'], "Recarga " . $operador . " " . $telefono, $monto]);

        $db->commit();

        $nuevoSaldo = $db->prepare("SELECT saldo FROM cuentas WHERE id = ?");
        $nuevoSaldo->execute([$cuenta['id']]);

        echo json_encode([
            "success" => true,
            "message" => "Recarga de S/ " . number_format($monto, 2) . " realizada al " . $telefono . ".",
            "nuevo_saldo" => $nuevoSaldo->fetchColumn()
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Error en la recarga."]);
    }
}

// ============================================
// PAGO de cuota de préstamo (simula débito y actualiza score)
// ============================================
elseif ($action === 'pagar_cuota') {
    $dni = htmlspecialchars(strip_tags(trim($data->dni ?? '')));
    $prestamoId = intval($data->prestamo_id ?? 0);
    $monto = floatval($data->monto ?? 0);

    // IDOR: verificar propiedad
    $stmtOwner = $db->prepare("SELECT user_id FROM perfiles_clientes WHERE dni = ? AND user_id = ?");
    $stmtOwner->execute([$dni, $sesion['user_id']]);
    if (!$stmtOwner->fetch()) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "No autorizado para operar esta cuenta."]);
        exit;
    }

    if (empty($dni) || $prestamoId <= 0 || $monto <= 0) {
        echo json_encode(["success" => false, "message" => "Datos incompletos."]);
        exit;
    }

    try {
        $db->beginTransaction();

        $st = $db->prepare("SELECT c.id, c.user_id, c.saldo FROM cuentas c JOIN perfiles_clientes p ON c.user_id = p.user_id WHERE p.dni = ? LIMIT 1");
        $st->execute([$dni]);
        $cuenta = $st->fetch(PDO::FETCH_ASSOC);

        if (!$cuenta) { $db->rollBack(); echo json_encode(["success" => false, "message" => "Cuenta no encontrada."]); exit; }
        if ($cuenta['saldo'] < $monto) { $db->rollBack(); echo json_encode(["success" => false, "message" => "Saldo insuficiente."]); exit; }

        // 1. Obtener datos del préstamo y verificar límites
        $stmtPr = $db->prepare("SELECT plazo_meses, dia_pago, created_at, cuota_mensual, fecha_desembolso FROM solicitudes_prestamo WHERE id = ?");
        $stmtPr->execute([$prestamoId]);
        $prData = $stmtPr->fetch(PDO::FETCH_ASSOC);

        if (!$prData) {
            $db->rollBack();
            echo json_encode(["success" => false, "message" => "Préstamo no encontrado."]);
            exit;
        }

        $plazo = (int)$prData['plazo_meses'];
        $paymentDay = (int)$prData['dia_pago'];
        $createdRaw = $prData['created_at'];

        // Contar cuántas cuotas ya se pagaron en total
        $descBase = "Pago Cuota Préstamo PRE-" . str_pad($prestamoId, 6, '0', STR_PAD_LEFT);
        $stmtCount = $db->prepare("SELECT COUNT(*) FROM transacciones WHERE user_id = ? AND descripcion LIKE ?");
        $stmtCount->execute([$cuenta['user_id'], $descBase . "%"]);
        $pagosRealizados = (int)$stmtCount->fetchColumn();

        if ($pagosRealizados >= $plazo) {
            $db->rollBack();
            echo json_encode(["success" => false, "message" => "El préstamo ya ha sido cancelado por completo."]);
            exit;
        }

        // 2. Calcular primer vencimiento (mínimo 15 días tras desembolso)
        $fechaDesembolso = !empty($prData['fecha_desembolso']) ? $prData['fecha_desembolso'] : date('Y-m-d', strtotime($createdRaw));
        $desDate = new DateTime($fechaDesembolso);
        $firstDueDate = new DateTime($desDate->format('Y-m-') . str_pad($paymentDay, 2, '0', STR_PAD_LEFT));
        $minFirstDate = clone $desDate;
        $minFirstDate->modify('+15 days');
        if ($firstDueDate < $minFirstDate) {
            $firstDueDate->modify('+1 month');
        }

        // Obtener el vencimiento de la cuota actual por pagar
        $nextDueDate = clone $firstDueDate;
        if ($pagosRealizados > 0) {
            $nextDueDate->modify('+' . $pagosRealizados . ' months');
        }

        $now = new DateTime();
        $todayYm = $now->format('Y-m');
        $nextDueDateYm = $nextDueDate->format('Y-m');

        // Si la siguiente cuota vence en un mes futuro, significa que ya está al día para este mes
        if ($nextDueDateYm > $todayYm) {
            $db->rollBack();
            echo json_encode(["success" => false, "message" => "La cuota de este mes ya ha sido pagada. Siguiente vencimiento: " . $nextDueDate->format('d/m/Y')]);
            exit;
        }

        // Debitar el monto de la cuenta de ahorros
        $db->prepare("UPDATE cuentas SET saldo = saldo - ? WHERE id = ?")->execute([$monto, $cuenta['id']]);

        // Registrar la transacción de pago
        $db->prepare("INSERT INTO transacciones (user_id, descripcion, tipo, monto, canal) VALUES (?, ?, 'debito', ?, 'homebanking')")
           ->execute([$cuenta['user_id'], $descBase, $monto]);

        // 3. Calcular score reward de forma realista
        $diasAtraso = 0;
        if ($now >= $nextDueDate) {
            $diff = $now->diff($nextDueDate);
            $diasAtraso = (int)$diff->days;
        }

        $reward = 5; // Pago normal a tiempo
        if ($diasAtraso >= 30) {
            $reward = 25; // Pago de cuota vencida (recuperación de score)
        } elseif ($pagosRealizados === $plazo - 1) {
            $reward = 15; // Pago final del préstamo (bonus)
        }

        // Incrementar el score base del usuario
        $stmtS = $db->prepare("SELECT id, score_transaccional FROM scores_transaccionales WHERE user_id = ? ORDER BY id DESC LIMIT 1");
        $stmtS->execute([$cuenta['user_id']]);
        $scoreRow = $stmtS->fetch(PDO::FETCH_ASSOC);
        
        $baseScore = $scoreRow ? (int)$scoreRow['score_transaccional'] : 650;
        $nuevoScore = min(850, $baseScore + $reward);

        if ($scoreRow) {
            $db->prepare("UPDATE scores_transaccionales SET score_transaccional = ?, fecha_calculo = CURDATE() WHERE id = ?")
               ->execute([$nuevoScore, $scoreRow['id']]);
        } else {
            $db->prepare("INSERT INTO scores_transaccionales (user_id, score_transaccional, fecha_calculo) VALUES (?, ?, CURDATE())")
               ->execute([$cuenta['user_id'], $nuevoScore]);
        }

        $db->commit();

        $nuevoSaldo = $db->prepare("SELECT saldo FROM cuentas WHERE id = ?");
        $nuevoSaldo->execute([$cuenta['id']]);

        echo json_encode([
            "success" => true,
            "message" => "Pago de cuota de S/ " . number_format($monto, 2) . " registrado con éxito.",
            "nuevo_saldo" => $nuevoSaldo->fetchColumn(),
            "nuevo_score" => $nuevoScore
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Error al procesar el pago de la cuota."]);
    }
}

// ============================================
// EXTRACTO — Historial completo de transacciones
// ============================================
elseif ($action === 'extracto') {
    $dni = htmlspecialchars(strip_tags(trim($data->dni ?? '')));

    // IDOR: verificar propiedad
    $stmtOwner = $db->prepare("SELECT user_id FROM perfiles_clientes WHERE dni = ? AND user_id = ?");
    $stmtOwner->execute([$dni, $sesion['user_id']]);
    if (!$stmtOwner->fetch()) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "No autorizado para ver estos datos."]);
        exit;
    }

    if (empty($dni)) {
        echo json_encode(["success" => false, "message" => "DNI requerido."]);
        exit;
    }

    $st = $db->prepare("
        SELECT t.descripcion as name,
               DATE_FORMAT(t.fecha, '%d/%m/%Y %h:%i %p') as date,
               CASE WHEN t.tipo = 'credito' THEN t.monto ELSE -t.monto END as amount,
               t.tipo,
               t.canal,
               CASE WHEN t.canal = 'homebanking' THEN 'bank'
                    WHEN t.canal = 'app_movil' THEN 'phone'
                    ELSE 'shop' END as category
        FROM transacciones t
        JOIN perfiles_clientes p ON t.user_id = p.user_id
        WHERE p.dni = ?
        ORDER BY t.fecha DESC
        LIMIT 50
    ");
    $st->execute([$dni]);
    $transacciones = $st->fetchAll(PDO::FETCH_ASSOC);

    // Resumen
    $stRes = $db->prepare("
        SELECT
            COUNT(*) as total_operaciones,
            COALESCE(SUM(CASE WHEN t.tipo = 'credito' THEN t.monto ELSE 0 END), 0) as total_ingresos,
            COALESCE(SUM(CASE WHEN t.tipo = 'debito' THEN t.monto ELSE 0 END), 0) as total_egresos
        FROM transacciones t
        JOIN perfiles_clientes p ON t.user_id = p.user_id
        WHERE p.dni = ?
    ");
    $stRes->execute([$dni]);
    $resumen = $stRes->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "transacciones" => $transacciones,
        "resumen" => $resumen
    ]);
}

else {
    echo json_encode(["success" => false, "message" => "Acción no reconocida."]);
}
?>
