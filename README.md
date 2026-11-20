# Sistema de Gestión Inmobiliaria

## Descripción

Aplicación web para gestionar el proceso de venta de viviendas, desde el registro de clientes y prospectos hasta la formalización de la venta y la entrega de la propiedad.

## Tecnologías utilizadas

- Frontend: Angular y Tailwind CSS
- Backend: Node.js y Express
- Base de datos: MySQL
- Control de versiones: Git y GitHub

## Módulos del sistema

1. Gestión de clientes y propiedades.
2. Gestión de citas y oportunidades.
3. Seguimiento comercial y planes de pago.
4. Evaluaciones crediticias.
5. Reservas de viviendas.
6. Solicitudes de crédito.
7. Gestión de documentación.
8. Firma de escrituras.
9. Entrega de viviendas.
10. Cierre de ventas y reportes.

## Instalación

### Base de datos

1. Crear una base de datos MySQL.
2. Importar el archivo SQL entregado.
3. Configurar las variables de conexión del backend.

### Backend

```bash
cd backend
npm install
node src/server.js
```

### Frontend

Desde la carpeta del proyecto Angular:

```bash
npm install
ng serve
```

La aplicación se ejecuta en `http://localhost:4200`.

## Pruebas

El proyecto fue desarrollado mediante sprints y pruebas de aceptación de las principales funcionalidades.

## Limitaciones

Este proyecto es un prototipo académico. Antes de su utilización en producción requiere completar los controles de autenticación, permisos de usuario, auditoría y protección de datos personales.