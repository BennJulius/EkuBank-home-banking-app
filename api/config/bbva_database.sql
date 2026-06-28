-- ============================================================
--  EKUBANK HOME BANKING — Script de Base de Datos
--  Subir a Hostinger via phpMyAdmin o panel MySQL
--  Ejecutar TODO este archivo de una sola vez
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Tabla: usuarios_mock
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios_mock` (
  `id`            CHAR(36)      NOT NULL PRIMARY KEY,
  `email`         VARCHAR(150)  NOT NULL UNIQUE,
  `password_hash` VARCHAR(255)  NOT NULL,
  `nombre`        VARCHAR(100)  NOT NULL,
  `apellido`      VARCHAR(100)  NOT NULL,
  `rol`           ENUM('cliente','asesor','admin') NOT NULL DEFAULT 'cliente',
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: perfiles_clientes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `perfiles_clientes` (
  `id`                      INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id`                 CHAR(36)      NOT NULL,
  `dni`                     CHAR(8)       NOT NULL UNIQUE,
  `nombres`                 VARCHAR(100)  NOT NULL,
  `apellidos`               VARCHAR(100)  NOT NULL,
  `departamento`            VARCHAR(60)   DEFAULT NULL,
  `saldo_promedio`          DECIMAL(12,2) DEFAULT 0.00,
  `ingreso_promedio`        DECIMAL(12,2) DEFAULT 0.00,
  `segmento_preliminar`     ENUM('PREMIER','ESTANDAR','BASICO') DEFAULT 'BASICO',
  `num_entidades_sbs`       TINYINT       DEFAULT 0,
  `calificacion_sbs`        VARCHAR(20)   DEFAULT 'Normal',
  `deuda_total_sbs`         DECIMAL(12,2) DEFAULT 0.00,
  `antiguedad_cuenta_meses` SMALLINT      DEFAULT 0,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios_mock`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: cuentas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cuentas` (
  `id`            INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id`       CHAR(36)      NOT NULL,
  `tipo`          ENUM('ahorro','corriente') NOT NULL DEFAULT 'ahorro',
  `numero_cuenta` VARCHAR(20)   NOT NULL UNIQUE,
  `saldo`         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios_mock`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: transacciones
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transacciones` (
  `id`          INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id`     CHAR(36)       NOT NULL,
  `descripcion` VARCHAR(200)   NOT NULL,
  `fecha`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo`        ENUM('credito','debito') NOT NULL,
  `monto`       DECIMAL(12,2)  NOT NULL,
  `canal`       ENUM('homebanking','app_movil','ventanilla','cajero') NOT NULL DEFAULT 'homebanking',
  FOREIGN KEY (`user_id`) REFERENCES `usuarios_mock`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: intentos_login (protección contra fuerza bruta)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `intentos_login` (
  `id`          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `identifier`  VARCHAR(100) NOT NULL,
  `intentos`    TINYINT      NOT NULL DEFAULT 0,
  `bloqueado_hasta` DATETIME DEFAULT NULL,
  `ultimo_intento`  DATETIME DEFAULT NULL,
  UNIQUE KEY `idx_identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: alertas_seguridad (historial de accesos fallidos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `alertas_seguridad` (
  `id`          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `identifier`  VARCHAR(100) NOT NULL,
  `fecha`       DATETIME     NOT NULL,
  `ip_address`  VARCHAR(50)  DEFAULT 'Desconocido',
  `user_agent`  VARCHAR(255) DEFAULT 'Desconocido',
  `visto`       TINYINT(1)   DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: sesiones (protección IDOR con tokens)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sesiones` (
  `id`          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id`     CHAR(36)     NOT NULL,
  `token`       VARCHAR(128) NOT NULL UNIQUE,
  `rol`         ENUM('cliente','asesor','admin') NOT NULL DEFAULT 'cliente',
  `expira`      DATETIME     NOT NULL,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios_mock`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: solicitudes_prestamo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `solicitudes_prestamo` (
  `id`            INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id`       CHAR(36)      NOT NULL,
  `monto`         DECIMAL(12,2) NOT NULL,
  `plazo_meses`   TINYINT       NOT NULL,
  `tasa_anual`    DECIMAL(5,4)  NOT NULL DEFAULT 0.3500,
  `cuota_mensual` DECIMAL(12,2) NOT NULL,
  `proposito`     VARCHAR(200)  DEFAULT NULL,
  `estado`        ENUM('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente',
  `evaluado_por`  CHAR(36)      DEFAULT NULL,
  `fecha_evaluacion` DATETIME   DEFAULT NULL,
  `observacion`   VARCHAR(300)  DEFAULT NULL,
  `ingresos_declarados` DECIMAL(12,2) DEFAULT NULL,
  `gastos_declarados` DECIMAL(12,2) DEFAULT NULL,
  `ingresos_evaluador` DECIMAL(12,2) DEFAULT NULL,
  `gastos_evaluador` DECIMAL(12,2) DEFAULT NULL,
  `propuesta_evaluador` ENUM('aprobado','rechazado') DEFAULT NULL,
  `dia_pago`      TINYINT       DEFAULT 5,
  `fecha_desembolso` DATE       DEFAULT NULL,
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios_mock`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: scores_transaccionales
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `scores_transaccionales` (
  `id`                  INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id`             CHAR(36)      NOT NULL,
  `score_transaccional` SMALLINT      NOT NULL DEFAULT 500,
  `fecha_calculo`       DATE          NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios_mock`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Tabla: creditos_preaprobados
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `creditos_preaprobados` (
  `id`              INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id`         CHAR(36)      NOT NULL UNIQUE,
  `monto_aprobado`  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `vigente`         TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios_mock`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  DATOS DE PRUEBA REALISTAS — 20 clientes + 1 asesor
--  Contraseña genérica: "123456" (6 dígitos)
--  Hash: $2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q
-- ============================================================

-- ─── USUARIOS (20 clientes + 1 asesor) ───

INSERT IGNORE INTO `usuarios_mock` (id, email, password_hash, nombre, apellido, rol) VALUES
  ('11111111-0000-0000-0000-000000000001', 'juan.perez@test.com',    '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Juan',      'Pérez',       'cliente'),
  ('11111111-0000-0000-0000-000000000002', 'maria.garcia@test.com',  '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'María',     'García',      'cliente'),
  ('11111111-0000-0000-0000-000000000003', 'carlos.lopez@test.com',  '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Carlos',    'López',       'cliente'),
  ('11111111-0000-0000-0000-000000000004', 'ana.torres@test.com',    '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Ana',       'Torres',      'cliente'),
  ('11111111-0000-0000-0000-000000000005', 'roberto.diaz@test.com',  '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Roberto',   'Díaz',        'cliente'),
  ('11111111-0000-0000-0000-000000000006', 'lucia.ramos@test.com',   '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Lucía',     'Ramos',       'cliente'),
  ('11111111-0000-0000-0000-000000000007', 'fernando.castro@test.com','$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Fernando',  'Castro',      'cliente'),
  ('11111111-0000-0000-0000-000000000008', 'patricia.flores@test.com','$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Patricia',  'Flores',      'cliente'),
  ('11111111-0000-0000-0000-000000000009', 'miguel.vargas@test.com', '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Miguel',    'Vargas',      'cliente'),
  ('11111111-0000-0000-0000-000000000010', 'carmen.huaman@test.com', '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Carmen',    'Huamán',      'cliente'),
  ('11111111-0000-0000-0000-000000000011', 'jorge.quispe@test.com',  '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Jorge',     'Quispe',      'cliente'),
  ('11111111-0000-0000-0000-000000000012', 'rosa.mendoza@test.com',  '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Rosa',      'Mendoza',     'cliente'),
  ('11111111-0000-0000-0000-000000000013', 'andres.silva@test.com',  '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Andrés',    'Silva',       'cliente'),
  ('11111111-0000-0000-0000-000000000014', 'elena.rojas@test.com',   '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Elena',     'Rojas',       'cliente'),
  ('11111111-0000-0000-0000-000000000015', 'pedro.gutierrez@test.com','$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Pedro',     'Gutiérrez',   'cliente'),
  ('11111111-0000-0000-0000-000000000016', 'sofia.herrera@test.com', '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Sofía',     'Herrera',     'cliente'),
  ('11111111-0000-0000-0000-000000000017', 'diego.morales@test.com', '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Diego',     'Morales',     'cliente'),
  ('11111111-0000-0000-0000-000000000018', 'valeria.ponce@test.com', '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Valeria',   'Ponce',       'cliente'),
  ('11111111-0000-0000-0000-000000000019', 'raul.espinoza@test.com', '$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Raúl',      'Espinoza',    'cliente'),
  ('11111111-0000-0000-0000-000000000020', 'claudia.salazar@test.com','$2y$12$GNAbsZt44o59SHI5tLg3q.nEnUrpT1W94TF2BfkdF/nTZ2nXOrY.q', 'Claudia',   'Salazar',     'cliente');

-- Empleado asesor (Código: EMP00001 · Clave: 654321)
INSERT IGNORE INTO `usuarios_mock` (id, email, password_hash, nombre, apellido, rol) VALUES
  ('22222222-0000-0000-0000-000000000002', 'asesor@ekubank.net.pe',
   '$2y$12$J101uh1pB5DQ4y788/7cJeipnrJP/GgGeeLqt8j4QYa7YdOEseHvy', 'Carlos', 'Mendoza', 'asesor');

-- Empleado administrador (Código: EMP00002 · Clave: 654321)
INSERT IGNORE INTO `usuarios_mock` (id, email, password_hash, nombre, apellido, rol) VALUES
  ('22222222-0000-0000-0000-000000000003', 'admin@ekubank.net.pe',
   '$2y$12$J101uh1pB5DQ4y788/7cJeipnrJP/GgGeeLqt8j4QYa7YdOEseHvy', 'Mariela', 'Alvarado', 'admin');

-- ─── PERFILES DE CLIENTES (datos realistas peruanos) ───

INSERT IGNORE INTO `perfiles_clientes` (user_id, dni, nombres, apellidos, departamento, saldo_promedio, ingreso_promedio, segmento_preliminar, num_entidades_sbs, calificacion_sbs, deuda_total_sbs, antiguedad_cuenta_meses) VALUES
  ('11111111-0000-0000-0000-000000000001', '12345678', 'Juan',      'Pérez',       'Lima',       1820.00, 3200.00, 'ESTANDAR', 1, 'Normal',      2500.00,  36),
  ('11111111-0000-0000-0000-000000000002', '23456789', 'María',     'García',      'Lima',       8500.00, 12000.00,'PREMIER',  0, 'Normal',      0.00,     60),
  ('11111111-0000-0000-0000-000000000003', '34567890', 'Carlos',    'López',       'Arequipa',   950.00,  1800.00, 'BASICO',   3, 'CPP',         8200.00,  12),
  ('11111111-0000-0000-0000-000000000004', '45678901', 'Ana',       'Torres',      'Lima',       5200.00, 8500.00, 'PREMIER',  0, 'Normal',      0.00,     48),
  ('11111111-0000-0000-0000-000000000005', '56789012', 'Roberto',   'Díaz',        'Cusco',      1200.00, 2400.00, 'ESTANDAR', 2, 'Normal',      4500.00,  24),
  ('11111111-0000-0000-0000-000000000006', '67890123', 'Lucía',     'Ramos',       'Lima',       3100.00, 5500.00, 'ESTANDAR', 0, 'Normal',      0.00,     42),
  ('11111111-0000-0000-0000-000000000007', '78901234', 'Fernando',  'Castro',      'Piura',      620.00,  1400.00, 'BASICO',   5, 'Deficiente',  15600.00, 8),
  ('11111111-0000-0000-0000-000000000008', '89012345', 'Patricia',  'Flores',      'Trujillo',   4800.00, 7200.00, 'PREMIER',  1, 'Normal',      3200.00,  54),
  ('11111111-0000-0000-0000-000000000009', '90123456', 'Miguel',    'Vargas',      'Arequipa',   1500.00, 2800.00, 'ESTANDAR', 1, 'Normal',      1800.00,  30),
  ('11111111-0000-0000-0000-000000000010', '01234567', 'Carmen',    'Huamán',      'Cusco',      750.00,  1500.00, 'BASICO',   0, 'Normal',      0.00,     18),
  ('11111111-0000-0000-0000-000000000011', '11223344', 'Jorge',     'Quispe',      'Puno',       480.00,  1200.00, 'BASICO',   4, 'CPP',         11300.00, 6),
  ('11111111-0000-0000-0000-000000000012', '22334455', 'Rosa',      'Mendoza',     'Lima',       6200.00, 9800.00, 'PREMIER',  0, 'Normal',      0.00,     72),
  ('11111111-0000-0000-0000-000000000013', '33445566', 'Andrés',    'Silva',       'Trujillo',   2100.00, 3800.00, 'ESTANDAR', 2, 'Normal',      5100.00,  28),
  ('11111111-0000-0000-0000-000000000014', '44556677', 'Elena',     'Rojas',       'Lima',       9200.00, 15000.00,'PREMIER',  0, 'Normal',      0.00,     84),
  ('11111111-0000-0000-0000-000000000015', '55667788', 'Pedro',     'Gutiérrez',   'Arequipa',   1100.00, 2200.00, 'BASICO',   1, 'Normal',      1500.00,  15),
  ('11111111-0000-0000-0000-000000000016', '66778899', 'Sofía',     'Herrera',     'Lima',       3800.00, 6000.00, 'ESTANDAR', 0, 'Normal',      0.00,     38),
  ('11111111-0000-0000-0000-000000000017', '77889900', 'Diego',     'Morales',     'Piura',      900.00,  1600.00, 'BASICO',   3, 'CPP',         7800.00,  10),
  ('11111111-0000-0000-0000-000000000018', '88990011', 'Valeria',   'Ponce',       'Lima',       7100.00, 11000.00,'PREMIER',  1, 'Normal',      2000.00,  66),
  ('11111111-0000-0000-0000-000000000019', '99001122', 'Raúl',      'Espinoza',    'Cusco',      1400.00, 2600.00, 'ESTANDAR', 2, 'Normal',      3800.00,  22),
  ('11111111-0000-0000-0000-000000000020', '00112233', 'Claudia',   'Salazar',     'Trujillo',   2600.00, 4200.00, 'ESTANDAR', 0, 'Normal',      0.00,     34);

-- Asesor
INSERT IGNORE INTO `perfiles_clientes` (user_id, dni, nombres, apellidos, departamento, segmento_preliminar) VALUES
  ('22222222-0000-0000-0000-000000000002', 'EMP00001', 'Carlos Mendoza', 'Asesor Financiero', 'Lima', 'PREMIER');

-- Administrador
INSERT IGNORE INTO `perfiles_clientes` (user_id, dni, nombres, apellidos, departamento, segmento_preliminar) VALUES
  ('22222222-0000-0000-0000-000000000003', 'EMP00002', 'Mariela Alvarado', 'Administrador Principal', 'Lima', 'PREMIER');

-- ─── CUENTAS BANCARIAS ───

INSERT IGNORE INTO `cuentas` (user_id, tipo, numero_cuenta, saldo) VALUES
  ('11111111-0000-0000-0000-000000000001', 'ahorro',    '019-1234567', 3450.80),
  ('11111111-0000-0000-0000-000000000002', 'ahorro',    '019-2345678', 15200.50),
  ('11111111-0000-0000-0000-000000000003', 'ahorro',    '019-3456789', 820.30),
  ('11111111-0000-0000-0000-000000000004', 'corriente', '019-4567890', 9800.00),
  ('11111111-0000-0000-0000-000000000005', 'ahorro',    '019-5678901', 1850.60),
  ('11111111-0000-0000-0000-000000000006', 'ahorro',    '019-6789012', 5600.40),
  ('11111111-0000-0000-0000-000000000007', 'ahorro',    '019-7890123', 280.00),
  ('11111111-0000-0000-0000-000000000008', 'corriente', '019-8901234', 8400.90),
  ('11111111-0000-0000-0000-000000000009', 'ahorro',    '019-9012345', 2100.70),
  ('11111111-0000-0000-0000-000000000010', 'ahorro',    '019-0123456', 640.20),
  ('11111111-0000-0000-0000-000000000011', 'ahorro',    '019-1122334', 180.00),
  ('11111111-0000-0000-0000-000000000012', 'corriente', '019-2233445', 12500.00),
  ('11111111-0000-0000-0000-000000000013', 'ahorro',    '019-3344556', 3200.80),
  ('11111111-0000-0000-0000-000000000014', 'corriente', '019-4455667', 22000.00),
  ('11111111-0000-0000-0000-000000000015', 'ahorro',    '019-5566778', 980.50),
  ('11111111-0000-0000-0000-000000000016', 'ahorro',    '019-6677889', 6800.30),
  ('11111111-0000-0000-0000-000000000017', 'ahorro',    '019-7788990', 350.00),
  ('11111111-0000-0000-0000-000000000018', 'corriente', '019-8899001', 14200.60),
  ('11111111-0000-0000-0000-000000000019', 'ahorro',    '019-9900112', 1600.40),
  ('11111111-0000-0000-0000-000000000020', 'ahorro',    '019-0011223', 4500.90);

-- ─── TRANSACCIONES (historial variado y realista) ───

INSERT IGNORE INTO `transacciones` (user_id, descripcion, fecha, tipo, monto, canal) VALUES
  -- Juan Pérez
  ('11111111-0000-0000-0000-000000000001', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 3200.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000001', 'Pago supermercado Wong',      '2025-06-02 15:30:00', 'debito',   185.50, 'app_movil'),
  ('11111111-0000-0000-0000-000000000001', 'Recarga Claro',               '2025-06-03 10:00:00', 'debito',    30.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000001', 'Transferencia recibida',      '2025-06-03 18:45:00', 'credito',  450.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000001', 'Pago luz Enel',               '2025-06-05 09:20:00', 'debito',    95.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000001', 'Retiro cajero BCP',           '2025-06-06 14:00:00', 'debito',   200.00, 'cajero'),
  -- María García
  ('11111111-0000-0000-0000-000000000002', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 12000.00,'homebanking'),
  ('11111111-0000-0000-0000-000000000002', 'Pago Saga Falabella',         '2025-06-02 12:00:00', 'debito',   890.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000002', 'Transferencia enviada',       '2025-06-04 16:30:00', 'debito',  2000.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000002', 'Depósito plazo fijo',         '2025-06-05 10:00:00', 'debito',  5000.00, 'ventanilla'),
  -- Carlos López
  ('11111111-0000-0000-0000-000000000003', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 1800.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000003', 'Pago mercado local',          '2025-06-02 11:00:00', 'debito',    65.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000003', 'Pago cuota préstamo',         '2025-06-05 09:00:00', 'debito',   320.00, 'homebanking'),
  -- Ana Torres
  ('11111111-0000-0000-0000-000000000004', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 8500.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000004', 'Compra Ripley Online',        '2025-06-03 20:15:00', 'debito',   450.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000004', 'Transferencia enviada',       '2025-06-04 11:30:00', 'debito',  1500.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000004', 'Pago agua Sedapal',           '2025-06-05 08:00:00', 'debito',    42.00, 'app_movil'),
  -- Roberto Díaz
  ('11111111-0000-0000-0000-000000000005', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 2400.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000005', 'Recarga Movistar',            '2025-06-02 09:30:00', 'debito',    20.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000005', 'Pago cuota préstamo',         '2025-06-05 09:00:00', 'debito',   180.00, 'homebanking'),
  -- Lucía Ramos
  ('11111111-0000-0000-0000-000000000006', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 5500.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000006', 'Pago clínica dental',         '2025-06-03 14:00:00', 'debito',   350.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000006', 'Compra Plaza Vea',            '2025-06-04 18:30:00', 'debito',   220.00, 'app_movil'),
  -- Fernando Castro
  ('11111111-0000-0000-0000-000000000007', 'Depósito sueldo',             '2025-05-28 08:00:00', 'credito', 1400.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000007', 'Pago alquiler',               '2025-06-01 10:00:00', 'debito',   600.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000007', 'Pago cuota tarjeta',          '2025-06-05 09:00:00', 'debito',   450.00, 'homebanking'),
  -- Patricia Flores
  ('11111111-0000-0000-0000-000000000008', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 7200.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000008', 'Pago Netflix + Spotify',      '2025-06-02 00:05:00', 'debito',    52.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000008', 'Transferencia recibida',      '2025-06-04 15:00:00', 'credito', 1200.00, 'homebanking'),
  -- Miguel Vargas
  ('11111111-0000-0000-0000-000000000009', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 2800.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000009', 'Pago universidad UNSA',       '2025-06-03 09:00:00', 'debito',   850.00, 'ventanilla'),
  -- Carmen Huamán
  ('11111111-0000-0000-0000-000000000010', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 1500.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000010', 'Retiro cajero',               '2025-06-03 16:00:00', 'debito',   300.00, 'cajero'),
  -- Jorge Quispe
  ('11111111-0000-0000-0000-000000000011', 'Depósito eventual',           '2025-05-25 08:00:00', 'credito', 1200.00, 'ventanilla'),
  ('11111111-0000-0000-0000-000000000011', 'Pago cuota tarjeta Interbank','2025-06-01 09:00:00', 'debito',   380.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000011', 'Pago cuota tarjeta BCP',      '2025-06-01 09:30:00', 'debito',   290.00, 'homebanking'),
  -- Rosa Mendoza
  ('11111111-0000-0000-0000-000000000012', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 9800.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000012', 'Transferencia enviada',       '2025-06-02 10:00:00', 'debito',  3000.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000012', 'Pago seguros Pacífico',       '2025-06-03 09:00:00', 'debito',   280.00, 'app_movil'),
  -- Andrés Silva
  ('11111111-0000-0000-0000-000000000013', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 3800.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000013', 'Recarga Entel',               '2025-06-02 12:00:00', 'debito',    25.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000013', 'Pago cuota auto',             '2025-06-05 09:00:00', 'debito',   680.00, 'homebanking'),
  -- Elena Rojas
  ('11111111-0000-0000-0000-000000000014', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito',15000.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000014', 'Inversión Fondos Mutuos',     '2025-06-02 11:00:00', 'debito',  5000.00, 'ventanilla'),
  ('11111111-0000-0000-0000-000000000014', 'Pago colegio hijos',          '2025-06-03 08:00:00', 'debito',  1800.00, 'homebanking'),
  -- Pedro Gutiérrez
  ('11111111-0000-0000-0000-000000000015', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 2200.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000015', 'Pago tienda material',        '2025-06-04 15:00:00', 'debito',   420.00, 'app_movil'),
  -- Sofía Herrera
  ('11111111-0000-0000-0000-000000000016', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 6000.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000016', 'Compra Zara Online',          '2025-06-03 22:00:00', 'debito',   310.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000016', 'Pago gym BodyTech',           '2025-06-05 07:00:00', 'debito',   180.00, 'app_movil'),
  -- Diego Morales
  ('11111111-0000-0000-0000-000000000017', 'Depósito eventual',           '2025-05-30 08:00:00', 'credito', 1600.00, 'ventanilla'),
  ('11111111-0000-0000-0000-000000000017', 'Pago cuota Interbank',        '2025-06-01 09:00:00', 'debito',   520.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000017', 'Retiro cajero',               '2025-06-04 18:00:00', 'debito',   200.00, 'cajero'),
  -- Valeria Ponce
  ('11111111-0000-0000-0000-000000000018', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito',11000.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000018', 'Pago viaje Latam',            '2025-06-02 20:00:00', 'debito',  1400.00, 'app_movil'),
  ('11111111-0000-0000-0000-000000000018', 'Transferencia enviada',       '2025-06-04 14:00:00', 'debito',  2500.00, 'homebanking'),
  -- Raúl Espinoza
  ('11111111-0000-0000-0000-000000000019', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 2600.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000019', 'Pago internet Claro',         '2025-06-03 09:00:00', 'debito',    89.00, 'app_movil'),
  -- Claudia Salazar
  ('11111111-0000-0000-0000-000000000020', 'Depósito sueldo',             '2025-06-01 08:00:00', 'credito', 4200.00, 'homebanking'),
  ('11111111-0000-0000-0000-000000000020', 'Pago clínica',                '2025-06-03 11:00:00', 'debito',   560.00, 'ventanilla'),
  ('11111111-0000-0000-0000-000000000020', 'Transferencia recibida',      '2025-06-05 13:00:00', 'credito',  800.00, 'homebanking');

-- ─── SCORES TRANSACCIONALES (1 por cliente) ───

INSERT IGNORE INTO `scores_transaccionales` (user_id, score_transaccional, fecha_calculo) VALUES
  ('11111111-0000-0000-0000-000000000001', 580, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000002', 740, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000003', 320, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000004', 710, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000005', 480, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000006', 620, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000007', 210, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000008', 690, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000009', 510, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000010', 440, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000011', 180, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000012', 760, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000013', 530, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000014', 790, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000015', 410, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000016', 640, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000017', 250, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000018', 720, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000019', 460, '2025-06-01'),
  ('11111111-0000-0000-0000-000000000020', 560, '2025-06-01');

-- ─── CRÉDITOS PREAPROBADOS (solo clientes elegibles) ───

INSERT IGNORE INTO `creditos_preaprobados` (user_id, monto_aprobado, vigente) VALUES
  ('11111111-0000-0000-0000-000000000002', 15000.00, 1),
  ('11111111-0000-0000-0000-000000000004', 12000.00, 1),
  ('11111111-0000-0000-0000-000000000006',  8000.00, 1),
  ('11111111-0000-0000-0000-000000000008', 10000.00, 1),
  ('11111111-0000-0000-0000-000000000012', 18000.00, 1),
  ('11111111-0000-0000-0000-000000000014', 25000.00, 1),
  ('11111111-0000-0000-0000-000000000016',  9000.00, 1),
  ('11111111-0000-0000-0000-000000000018', 14000.00, 1),
  ('11111111-0000-0000-0000-000000000001',  4500.00, 1),
  ('11111111-0000-0000-0000-000000000009',  3800.00, 1),
  ('11111111-0000-0000-0000-000000000020',  6000.00, 1);

-- ─── SOLICITUDES DE PRÉSTAMO (variadas: pendientes, aprobadas, rechazadas) ───

INSERT IGNORE INTO `solicitudes_prestamo` (user_id, monto, plazo_meses, tasa_anual, cuota_mensual, proposito, estado, created_at) VALUES
  -- Pendientes (el asesor las puede evaluar)
  ('11111111-0000-0000-0000-000000000001', 3000.00, 12, 0.3500, 290.44, 'Gastos personales',       'pendiente', '2025-06-08 10:00:00'),
  ('11111111-0000-0000-0000-000000000005', 5000.00, 18, 0.3500, 335.21, 'Remodelación vivienda',   'pendiente', '2025-06-07 14:30:00'),
  ('11111111-0000-0000-0000-000000000003', 8000.00, 24, 0.3500, 408.52, 'Capital de trabajo',      'pendiente', '2025-06-09 09:15:00'),
  ('11111111-0000-0000-0000-000000000010', 2000.00,  6, 0.3500, 358.22, 'Educación',               'pendiente', '2025-06-09 16:00:00'),
  ('11111111-0000-0000-0000-000000000017', 6000.00, 12, 0.3500, 580.88, 'Consolidación de deudas', 'pendiente', '2025-06-10 08:45:00'),
  ('11111111-0000-0000-0000-000000000007', 4000.00, 12, 0.3500, 387.25, 'Gastos médicos',          'pendiente', '2025-06-10 11:20:00'),
  ('11111111-0000-0000-0000-000000000011', 3500.00, 12, 0.3500, 338.85, 'Capital de trabajo',      'pendiente', '2025-06-10 15:00:00'),
  -- Aprobadas
  ('11111111-0000-0000-0000-000000000002', 10000.00, 24, 0.3500, 510.65, 'Viaje',                  'aprobado',  '2025-05-15 10:00:00'),
  ('11111111-0000-0000-0000-000000000004',  8000.00, 18, 0.3500, 536.34, 'Remodelación vivienda',  'aprobado',  '2025-05-20 11:00:00'),
  ('11111111-0000-0000-0000-000000000006',  5000.00, 12, 0.3500, 484.40, 'Educación',              'aprobado',  '2025-05-25 14:00:00'),
  ('11111111-0000-0000-0000-000000000016',  4000.00, 12, 0.3500, 387.52, 'Gastos personales',      'aprobado',  '2025-05-28 09:30:00'),
  -- Rechazadas
  ('11111111-0000-0000-0000-000000000007', 12000.00, 36, 0.3500, 434.76, 'Capital de trabajo',     'rechazado', '2025-05-10 08:00:00'),
  ('11111111-0000-0000-0000-000000000011', 15000.00, 24, 0.3500, 765.98, 'Consolidación de deudas','rechazado', '2025-05-12 16:00:00');

-- ============================================================
-- FIN DEL SCRIPT
-- Contraseña clientes: "123456" → hash bcrypt en todos
-- Asesor: Código EMP00001, Clave 654321
-- ============================================================
