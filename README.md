# EkuBank Home Banking - Proyecto de Simulación Académica

Este proyecto es una simulación de Banca por Internet (Home Banking) desarrollada como proyecto final universitario para el curso de **Desarrollo de Aplicaciones Web**. 

El propósito de este sitio web es **estrictamente académico**, brindando una simulación interactiva de flujos transaccionales (transferencias, simulación de score financiero y solicitudes de crédito) en un entorno seguro y aislado (sandbox).

---

## 🚀 Guía de Evaluación para Profesores (Flujo de Pruebas)

Para evaluar la interacción completa y el flujo de aprobación de créditos, utilice las siguientes credenciales pre-cargadas:

### 👤 1. Flujo del Cliente
1. Inicie sesión en la plataforma principal como **Cliente**:
   * **DNI:** `12345678`
   * **Contraseña:** `123456`
2. Desde el panel, diríjase a la sección **Préstamos** y realice una solicitud de crédito (ej. S/ 5,000 a 12 meses).

### 👔 2. Flujo del Asesor (Evaluador)
1. Cierre sesión de cliente e ingrese a **Acceso colaboradores** (enlace en el pie de página de la web).
2. Inicie sesión con el rol de **Asesor Financiero**:
   * **Código de Colaborador:** `EMP00001`
   * **Contraseña:** `654321`
3. En el panel de control del asesor verá la solicitud pendiente. Podrá ingresar los montos evaluados, observaciones y **Aprobar** o **Rechazar** el crédito.
4. Si lo aprueba, al volver a iniciar sesión como **Cliente (DNI 12345678)** verá reflejado el desembolso directamente incrementando su saldo disponible en tiempo real.

---

## 🛡️ Robustecimiento de Seguridad

Se han diseñado e implementado múltiples capas de seguridad defensiva a nivel de frontend y backend para mitigar ataques comunes y hardening del sistema:

### 1. Bloqueo Incremental contra Fuerza Bruta (Rate Limiting)
Para proteger las cuentas de clientes y empleados ante intentos reiterados de adivinar contraseñas, el servidor aplica bloqueos de acceso incrementales basados en el historial de fallos consecutivos:
* **1er Bloqueo (3 intentos erróneos):** Cuenta bloqueada por **1 minuto**.
* **2do Bloqueo (6 intentos erróneos):** Cuenta bloqueada por **5 minutos**.
* **3er Bloqueo (9+ intentos erróneos):** Cuenta bloqueada por **10 minutos**.

### 2. Detección y Alertas de Intrusión (Banner en Dashboard)
Cada intento fallido se audita en la tabla `alertas_seguridad`. En el próximo inicio de sesión exitoso del usuario legítimo, se mostrará un **banner de advertencia** destacado que le notificará detalladamente sobre los accesos bloqueados: indicando la **fecha/hora**, la **dirección IP** y el **navegador** utilizado por el atacante.

### 3. Seguridad en Backend (API PHP)
* **Protección contra Inyección SQL:** Todas las consultas a la base de datos MySQL utilizan sentencias preparadas mediante la interfaz de abstracción **PDO**.
* **Almacenamiento de Contraseñas:** Se utiliza el algoritmo de hashing fuerte **bcrypt** (a través de la función nativa `password_hash` de PHP) para evitar que contraseñas planas queden expuestas.
* **Mitigación de IDOR (Insecure Direct Object Reference):** Cada petición que involucre datos sensibles del cliente requiere la verificación cruzada de un token de sesión seguro generado en el inicio de sesión y la vinculación lógica del DNI del usuario autenticado.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React + Vite + Tailwind CSS + Framer Motion (Single Page Application).
* **Backend:** PHP nativo bajo patrón de arquitectura MVC (Model-View-Controller).
* **Base de Datos:** MySQL conectada mediante PDO.