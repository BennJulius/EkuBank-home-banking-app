<?php
include_once '../config/database.php';
$db = (new Database())->getConnection();
include_once '../config/auth.php';

$sesion = validarToken($db, 'asesor');

// ─── POST: Evaluar solicitud de crédito (aprobar/rechazar) ───
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (!empty($data->solicitud_id) && !empty($data->accion)) {
        $accion = $data->accion;
        
        // Propuesta del evaluador (Ingresos, Gastos, Decisión recomendada)
        if ($accion === 'propuesta') {
            $ingresos = floatval($data->ingresos_evaluador ?? 0);
            $gastos = floatval($data->gastos_evaluador ?? 0);
            $propuesta = htmlspecialchars(strip_tags(trim($data->propuesta_evaluador ?? '')));
            $observacion = htmlspecialchars(strip_tags(trim($data->observacion ?? '')));
            $evaluadoPor = htmlspecialchars(strip_tags(trim($data->evaluado_por ?? '')));

            $stmt = $db->prepare("
                UPDATE solicitudes_prestamo
                SET ingresos_evaluador = :ing, gastos_evaluador = :gas, propuesta_evaluador = :prop, observacion = :obs, evaluado_por = :eval
                WHERE id = :id AND estado = 'pendiente'
            ");
            $stmt->execute([
                ':ing' => $ingresos,
                ':gas' => $gastos,
                ':prop' => $propuesta,
                ':obs' => $observacion,
                ':eval' => $evaluadoPor,
                ':id' => $data->solicitud_id,
            ]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Propuesta de evaluación enviada al Comité Administrador."]);
            } else {
                echo json_encode(["success" => false, "message" => "Solicitud no encontrada o ya evaluada."]);
            }
            exit();
        }

        // Aprobación o Rechazo definitivo por el Administrador
        if (!in_array($accion, ['aprobado', 'rechazado'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Acción no válida."]);
            exit();
        }
        $observacion = htmlspecialchars(strip_tags(trim($data->observacion ?? '')));
        $evaluadoPor = $data->evaluado_por ?? null;
        $stmt = $db->prepare("
            UPDATE solicitudes_prestamo
            SET estado = :estado, observacion = :obs, evaluado_por = :eval, fecha_evaluacion = NOW()
            WHERE id = :id AND estado = 'pendiente'
        ");
        $stmt->execute([
            ':estado' => $accion,
            ':obs' => $observacion,
            ':eval' => $evaluadoPor,
            ':id' => $data->solicitud_id,
        ]);
        if ($stmt->rowCount() > 0) {
            if ($accion === 'aprobado') {
                $sol = $db->prepare("SELECT user_id, monto FROM solicitudes_prestamo WHERE id = ?");
                $sol->execute([$data->solicitud_id]);
                $solData = $sol->fetch(PDO::FETCH_ASSOC);
                if ($solData) {
                    $db->prepare("UPDATE cuentas SET saldo = saldo + ? WHERE user_id = ?")->execute([$solData['monto'], $solData['user_id']]);
                    $db->prepare("INSERT INTO transacciones (user_id, descripcion, tipo, monto, canal) VALUES (?, ?, 'credito', ?, 'homebanking')")
                       ->execute([$solData['user_id'], 'Desembolso préstamo #' . $data->solicitud_id, $solData['monto']]);
                }
            }
            echo json_encode(["success" => true, "message" => $accion === 'aprobado' ? "Crédito aprobado y desembolsado por Administrador." : "Crédito rechazado por Administrador."]);
        } else {
            echo json_encode(["success" => false, "message" => "Solicitud no encontrada o ya evaluada."]);
        }
        exit();
    }
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan datos."]);
    exit();
}

try {
    // ─── DEPARTAMENTOS ───
    $departamentos = $db->query("
        SELECT DISTINCT departamento FROM perfiles_clientes WHERE departamento IS NOT NULL ORDER BY departamento
    ")->fetchAll(PDO::FETCH_COLUMN);

    // ─── P1: RESUMEN GENERAL ───
    $resumen = $db->query("
        SELECT
            (SELECT COUNT(*) FROM perfiles_clientes) as total_clientes,
            (SELECT COALESCE(SUM(monto_aprobado),0) FROM creditos_preaprobados) as monto_preaprobado,
            (SELECT COALESCE(AVG(monto_aprobado),0) FROM creditos_preaprobados) as ticket_promedio,
            (SELECT COALESCE(AVG(score_transaccional),0) FROM scores_transaccionales) as score_promedio
    ")->fetch(PDO::FETCH_ASSOC);

    // Distribución por segmento (para el bar chart de P1)
    $segmentos = $db->query("
        SELECT
            segmento_preliminar as segmento,
            COUNT(*) as cantidad
        FROM perfiles_clientes
        GROUP BY segmento_preliminar
        ORDER BY cantidad DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Promedios de scoring por componente (P1 bars) — solo si la tabla existe
    $scoring_componentes = [];
    try {
        $scoring_componentes = $db->query("
            SELECT
                ROUND(AVG(COALESCE(s.score_transaccional, 500)) * 0.25) as pts_saldo,
                ROUND(AVG(COALESCE(s.score_transaccional, 500)) * 0.20) as pts_regularidad,
                ROUND(AVG(COALESCE(s.score_transaccional, 500)) * 0.15) as pts_disciplina,
                ROUND(AVG(COALESCE(s.score_transaccional, 500)) * 0.22) as pts_vinculo,
                ROUND(AVG(COALESCE(s.score_transaccional, 500)) * 0.18) as pts_riesgo
            FROM perfiles_clientes p
            LEFT JOIN scores_transaccionales s ON p.user_id = s.user_id
        ")->fetch(PDO::FETCH_ASSOC);
    } catch(Exception $e) {}

    // ─── P2: PERFILES POR SEGMENTO ───
    $perfiles = $db->query("
        SELECT
            p.segmento_preliminar as segmento,
            ROUND(AVG(p.saldo_promedio), 2) as saldo_prom,
            ROUND(AVG(p.ingreso_promedio), 2) as ingresos_est,
            ROUND(AVG(COALESCE(s.score_transaccional, 500))) as score_prom,
            ROUND(AVG(p.antiguedad_cuenta_meses)) as antiguedad_prom,
            COUNT(*) as cantidad
        FROM perfiles_clientes p
        LEFT JOIN scores_transaccionales s ON p.user_id = s.user_id
        GROUP BY p.segmento_preliminar
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Clientes con perfil (top 20 por score)
    $clientes_lista = $db->query("
        SELECT
            CONCAT(SUBSTRING(p.nombres, 1, 1), '. ', p.apellidos) as nombre_corto,
            p.dni,
            p.departamento,
            p.ingreso_promedio as ingreso,
            p.segmento_preliminar as segmento,
            COALESCE(s.score_transaccional, 0) as score
        FROM perfiles_clientes p
        LEFT JOIN scores_transaccionales s ON p.user_id = s.user_id
        ORDER BY score DESC
        LIMIT 20
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Clientes por departamento
    $por_departamento = $db->query("
        SELECT
            p.departamento,
            COUNT(*) as cantidad,
            ROUND(AVG(COALESCE(s.score_transaccional, 500))) as score_prom
        FROM perfiles_clientes p
        LEFT JOIN scores_transaccionales s ON p.user_id = s.user_id
        WHERE p.departamento IS NOT NULL
        GROUP BY p.departamento
        ORDER BY cantidad DESC
        LIMIT 10
    ")->fetchAll(PDO::FETCH_ASSOC);

    // ─── P3: NEGOCIOS (agrupado por antigüedad) ───
    $negocios = $db->query("
        SELECT
            CASE
                WHEN antiguedad_cuenta_meses >= 48 THEN 'Más de 48 meses'
                WHEN antiguedad_cuenta_meses >= 24 THEN '24 a 48 meses'
                WHEN antiguedad_cuenta_meses >= 12 THEN '12 a 24 meses'
                ELSE 'Menos de 12 meses'
            END as antiguedad,
            COUNT(*) as cantidad,
            ROUND(AVG(COALESCE(s.score_transaccional, 500))) as score_prom,
            ROUND(AVG(p.ingreso_promedio), 2) as ingreso_prom,
            ROUND(AVG(p.saldo_promedio), 2) as saldo_prom
        FROM perfiles_clientes p
        LEFT JOIN scores_transaccionales s ON p.user_id = s.user_id
        GROUP BY antiguedad
        ORDER BY cantidad DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // KPIs de negocio
    $negocio_kpis = $db->query("
        SELECT
            ROUND(AVG(p.ingreso_promedio), 2) as ingreso_global,
            ROUND(AVG(p.ingreso_promedio) * 0.30, 2) as cuota_maxima,
            ROUND(AVG(p.saldo_promedio), 2) as saldo_global
        FROM perfiles_clientes p
    ")->fetch(PDO::FETCH_ASSOC);

    // ─── P4: RIESGO SBS ───
    $sbs = $db->query("
        SELECT
            COUNT(*) as total_sbs,
            COALESCE(SUM(deuda_total_sbs), 0) as deuda_total
        FROM perfiles_clientes WHERE num_entidades_sbs > 0
    ")->fetch(PDO::FETCH_ASSOC);

    $sbs_resumen = $db->query("
        SELECT
            SUM(CASE WHEN num_entidades_sbs = 0 THEN 1 ELSE 0 END) as sin_deuda,
            SUM(CASE WHEN num_entidades_sbs BETWEEN 1 AND 3 THEN 1 ELSE 0 END) as con_deuda_leve,
            SUM(CASE WHEN num_entidades_sbs >= 4 THEN 1 ELSE 0 END) as con_deuda_alta,
            SUM(CASE WHEN calificacion_sbs = 'CPP' THEN 1 ELSE 0 END) as calificacion_cpp,
            COUNT(*) as total
        FROM perfiles_clientes
    ")->fetch(PDO::FETCH_ASSOC);

    $sbs_por_segmento = $db->query("
        SELECT
            segmento_preliminar as segmento,
            calificacion_sbs as calificacion,
            ROUND(AVG(deuda_total_sbs), 2) as deuda_promedio,
            COUNT(*) as cantidad
        FROM perfiles_clientes
        WHERE num_entidades_sbs > 0
        GROUP BY segmento_preliminar, calificacion_sbs
        ORDER BY deuda_promedio DESC
        LIMIT 10
    ")->fetchAll(PDO::FETCH_ASSOC);

    $sbs_lista = $db->query("
        SELECT dni, num_entidades_sbs as entidades, calificacion_sbs as peor_estado, deuda_total_sbs as deuda
        FROM perfiles_clientes
        WHERE num_entidades_sbs >= 3
        ORDER BY deuda_total_sbs DESC LIMIT 10
    ")->fetchAll(PDO::FETCH_ASSOC);

    // ─── P5: SOLICITUDES DE CRÉDITO ───
    $creditos_resumen = $db->query("
        SELECT
            COUNT(*) as total_solicitudes,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
            SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobados,
            SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) as rechazados,
            COALESCE(ROUND(AVG(monto), 2), 0) as monto_promedio,
            COALESCE(SUM(monto), 0) as monto_total_solicitado,
            COALESCE(ROUND(AVG(cuota_mensual), 2), 0) as cuota_promedio,
            COALESCE(ROUND(AVG(plazo_meses), 0), 0) as plazo_promedio
        FROM solicitudes_prestamo
    ")->fetch(PDO::FETCH_ASSOC);

    $creditos_lista = $db->query("
        SELECT
            sp.id as solicitud_id,
            p.dni,
            CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
            p.segmento_preliminar as segmento,
            p.ingreso_promedio as ingreso,
            p.num_entidades_sbs as entidades_sbs,
            p.calificacion_sbs,
            p.deuda_total_sbs as deuda_sbs,
            COALESCE(s.score_transaccional, 0) as score,
            sp.id as id,
            sp.monto, sp.plazo_meses as plazo, sp.tasa_anual as tasa,
            sp.cuota_mensual as cuota, sp.proposito, sp.estado,
            sp.observacion, sp.evaluado_por,
            sp.ingresos_declarados, sp.gastos_declarados,
            sp.ingresos_evaluador, sp.gastos_evaluador, sp.propuesta_evaluador,
            DATE_FORMAT(sp.fecha_evaluacion, '%d/%m/%Y %H:%i') as fecha_eval,
            DATE_FORMAT(sp.created_at, '%d/%m/%Y %H:%i') as fecha_solicitud,
            (
                SELECT COALESCE(SUM(
                    CASE 
                        WHEN NOT EXISTS (
                            SELECT 1 FROM transacciones t 
                            WHERE t.user_id = sp.user_id 
                              AND t.descripcion LIKE CONCAT('Pago Cuota Préstamo PRE-', LPAD(sp2.id, 6, '0'), '%')
                              AND MONTH(t.fecha) = MONTH(NOW()) 
                              AND YEAR(t.fecha) = YEAR(NOW())
                        )
                        AND sp2.estado = 'aprobado'
                        AND sp2.created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
                        AND DAY(NOW()) > sp2.dia_pago
                        THEN ROUND(sp2.cuota_mensual * 0.003 * (DAY(NOW()) - sp2.dia_pago), 2)
                        ELSE 0 
                    END
                ), 0)
                FROM solicitudes_prestamo sp2
                WHERE sp2.user_id = sp.user_id
            ) as mora_exacta,
            (
                SELECT COALESCE(MAX(
                    CASE 
                        WHEN NOT EXISTS (
                            SELECT 1 FROM transacciones t 
                            WHERE t.user_id = sp.user_id 
                              AND t.descripcion LIKE CONCAT('Pago Cuota Préstamo PRE-', LPAD(sp2.id, 6, '0'), '%')
                              AND MONTH(t.fecha) = MONTH(NOW()) 
                              AND YEAR(t.fecha) = YEAR(NOW())
                        )
                        AND sp2.estado = 'aprobado'
                        AND sp2.created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
                        AND DAY(NOW()) > sp2.dia_pago
                        THEN DAY(NOW()) - sp2.dia_pago
                        ELSE 0 
                    END
                ), 0)
                FROM solicitudes_prestamo sp2
                WHERE sp2.user_id = sp.user_id
            ) as max_dias_atraso,
            CASE WHEN p.ingreso_promedio > 0 THEN ROUND((sp.cuota_mensual / p.ingreso_promedio) * 100, 1) ELSE 0 END as ratio_cuota_ingreso,
            CASE
                WHEN p.calificacion_sbs IN ('Deficiente', 'Dudoso', 'Perdida') THEN 'RECHAZAR'
                WHEN p.num_entidades_sbs >= 4 THEN 'RECHAZAR'
                WHEN p.ingreso_promedio > 0 AND (sp.cuota_mensual / p.ingreso_promedio) > 0.40 THEN 'REVISAR'
                WHEN COALESCE(s.score_transaccional, 0) < 400 THEN 'REVISAR'
                WHEN p.calificacion_sbs = 'CPP' THEN 'REVISAR'
                ELSE 'VIABLE'
            END as evaluacion_auto
        FROM solicitudes_prestamo sp
        JOIN perfiles_clientes p ON sp.user_id = p.user_id
        LEFT JOIN scores_transaccionales s ON sp.user_id = s.user_id
        ORDER BY sp.created_at DESC LIMIT 50
    ")->fetchAll(PDO::FETCH_ASSOC);

    $creditos_proposito = $db->query("
        SELECT COALESCE(proposito, 'Sin especificar') as proposito, COUNT(*) as cantidad,
            ROUND(AVG(monto), 2) as monto_promedio, SUM(monto) as monto_total
        FROM solicitudes_prestamo GROUP BY proposito ORDER BY cantidad DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // ─── RESPUESTA ───
    echo json_encode([
        "success"            => true,
        "departamentos"      => $departamentos,
        "resumen"            => $resumen,
        "segmentos"          => $segmentos,
        "scoring_componentes"=> $scoring_componentes,
        "perfiles"           => $perfiles,
        "clientes_lista"     => $clientes_lista,
        "por_departamento"   => $por_departamento,
        "negocios"           => $negocios,
        "negocio_kpis"       => $negocio_kpis,
        "sbs"                => $sbs,
        "sbs_resumen"        => $sbs_resumen,
        "sbs_por_segmento"   => $sbs_por_segmento,
        "sbs_lista"          => $sbs_lista,
        "creditos_resumen"   => $creditos_resumen,
        "creditos_lista"     => $creditos_lista,
        "creditos_proposito" => $creditos_proposito,
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
