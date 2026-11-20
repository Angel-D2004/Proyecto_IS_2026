
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ========================================
// US-54: RESUMEN GENERAL
// GET /api/reportes/resumen
// ========================================

router.get('/resumen', async (req, res) => {
    try {
        const [[datos]] = await db.query(`
            SELECT
                (SELECT COUNT(*)
                 FROM clientes) AS clientes,

                (SELECT COUNT(*)
                 FROM propiedades) AS propiedades,

                (SELECT COUNT(*)
                 FROM propiedades
                 WHERE estado_venta = 'vendida')
                    AS propiedades_vendidas,

                (SELECT COUNT(*)
                 FROM oportunidades
                 WHERE estado_oportu
                     IN ('abierta', 'en_proceso'))
                    AS oportunidades_activas,

                (SELECT COUNT(*)
                 FROM reservas
                 WHERE estado
                     IN ('pendiente', 'confirmada'))
                    AS reservas_activas,

                (SELECT COUNT(*)
                 FROM solicitudes_credito
                 WHERE estado
                     IN ('pendiente', 'en_revision'))
                    AS creditos_pendientes,

                (SELECT COUNT(*)
                 FROM ventas_cerradas)
                    AS ventas_completadas,

                (SELECT COALESCE(
                    SUM(precio_cierre), 0
                 ) FROM ventas_cerradas)
                    AS monto_total_ventas
        `);

        return res.json({
            status: true,
            data: datos
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al generar resumen'
        });
    }
});

// ========================================
// US-49: VENTAS EN PROCESO
// GET /api/reportes/ventas-proceso
// ========================================

router.get('/ventas-proceso', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                o.oportunidad,
                o.estado_oportu,
                p.nombre AS propiedad,
                p.precio,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS cliente

            FROM oportunidades o
            INNER JOIN intereses i
                ON o.interes = i.interes
            INNER JOIN clientes c
                ON i.cliente = c.cliente
            INNER JOIN propiedades p
                ON i.propiedad = p.propiedad

            WHERE o.estado_oportu
                IN ('abierta', 'en_proceso')

            ORDER BY o.oportunidad DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: 'Error al consultar ventas en proceso'
        });
    }
});

// ========================================
// US-50: PROPIEDADES POR ESTADO
// GET /api/reportes/propiedades
// ========================================

router.get('/propiedades', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                propiedad,
                nombre,
                precio,
                estado_venta
            FROM propiedades
            ORDER BY nombre ASC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: 'Error al consultar propiedades'
        });
    }
});

// ========================================
// US-51: CLIENTES Y OPORTUNIDADES
// GET /api/reportes/clientes-oportunidades
// ========================================

router.get('/clientes-oportunidades', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                c.cliente,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente,
                o.oportunidad,
                o.estado_oportu,
                p.nombre AS nombre_propiedad

            FROM clientes c
            INNER JOIN intereses i
                ON c.cliente = i.cliente
            INNER JOIN oportunidades o
                ON i.interes = o.interes
            INNER JOIN propiedades p
                ON i.propiedad = p.propiedad

            ORDER BY o.oportunidad DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: 'Error al consultar clientes y oportunidades'
        });
    }
});

// ========================================
// US-52: CRÉDITOS PENDIENTES
// GET /api/reportes/creditos-pendientes
// ========================================

router.get('/creditos-pendientes', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                s.solicitud,
                s.entidad_financiera,
                s.monto_solicitado,
                s.estado,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente

            FROM solicitudes_credito s
            INNER JOIN reservas r
                ON s.reserva = r.reserva
            INNER JOIN oportunidades o
                ON r.oportunidad = o.oportunidad
            INNER JOIN intereses i
                ON o.interes = i.interes
            INNER JOIN clientes c
                ON i.cliente = c.cliente

            WHERE s.estado
                IN ('pendiente', 'en_revision')

            ORDER BY s.solicitud DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: 'Error al consultar créditos pendientes'
        });
    }
});

// ========================================
// US-53: RESERVAS ACTIVAS
// GET /api/reportes/reservas-activas
// ========================================

router.get('/reservas-activas', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                r.reserva,
                r.estado,
                r.monto_reserva,
                p.nombre AS nombre_propiedad,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente

            FROM reservas r
            INNER JOIN propiedades p
                ON r.propiedad = p.propiedad
            INNER JOIN oportunidades o
                ON r.oportunidad = o.oportunidad
            INNER JOIN intereses i
                ON o.interes = i.interes
            INNER JOIN clientes c
                ON i.cliente = c.cliente

            WHERE r.estado
                IN ('pendiente', 'confirmada')

            ORDER BY r.reserva DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: 'Error al consultar reservas activas'
        });
    }
});

// ========================================
// US-54: REPORTE MENSUAL DE VENTAS
// GET /api/reportes/ventas-mensuales
// ========================================

router.get('/ventas-mensuales', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                DATE_FORMAT(fecha_cierre, '%Y-%m')
                    AS mes,
                COUNT(*) AS cantidad_ventas,
                COALESCE(SUM(precio_cierre), 0)
                    AS monto_total

            FROM ventas_cerradas
            GROUP BY DATE_FORMAT(
                fecha_cierre, '%Y-%m'
            )
            ORDER BY mes DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: 'Error al consultar ventas mensuales'
        });
    }
});

module.exports = router;
