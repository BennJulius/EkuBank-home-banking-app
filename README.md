# EkuBank Home Banking - Desarrollo de Aplicaciones Web

Este proyecto es una simulación del Home Banking de EkuBank, desarrollado para la evaluación del curso.

## Arquitectura

* **Frontend:** Desarrollado con React, Vite y Tailwind CSS (SPA).
* **Backend (API):** Implementado con PHP nativo siguiendo una estructura MVC (Model-View-Controller) para una gestión modular. Desplegado en un subdominio de Hostinger.
* **Base de Datos:** MySQL gestionada a través de phpMyAdmin en Hostinger. Conexión mediante PDO para mayor seguridad y prevención de inyección SQL.

## Flujo de Autenticación (Evaluación C4)

Para probar la conexión en vivo con la base de datos de producción, utilice las siguientes credenciales de prueba:
* **DNI:** 12345678
* **Contraseña:** 123456

> **Nota de Seguridad:** El archivo `database.php` en este repositorio público contiene credenciales de ejemplo. Las credenciales reales se encuentran configuradas de forma segura y aislada en el servidor de Hostinger.