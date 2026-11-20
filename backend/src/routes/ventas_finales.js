
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ========================================
// US-45: CONSULTAR ENTREGAS SIN CERRAR
// GET /api/ventas-finales/disponibles
// ========================================

router.get('/disponibles', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                ev.entrega,
                ev.fecha_entrega,
                o.oportunidad,
                p.propiedad,
                p.nombre AS nombre_propiedad,
                p.precio,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente

            FROM entregas_viviendas ev

            INNER JOIN firmas_escrituras f
                ON ev.firma = f.firma
            INNER JOIN solicitudes_credito sc
                ON f.solicitud = sc.solicitud
            INNER JOIN reservas r
                ON sc.reserva = r.reserva
            INNER JOIN oportunidades o
                ON r.oportunidad = o.oportunidad
            INNER JOIN intereses i
                ON o.interes = i.interes
            INNER JOIN clientes c
                ON i.cliente = c.cliente
            INNER JOIN propiedades p
                ON r.propiedad = p.propiedad

            LEFT JOIN ventas_cerradas v
                ON ev.entrega = v.entrega

            WHERE v.venta IS NULL
              AND p.estado_venta = 'disponible'

            ORDER BY ev.entrega DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar entregas disponibles'
        });
    }
});

// ========================================
// US-45 y US-47: COMPLETAR VENTA
// POST /api/ventas-finales
// ========================================

router.post('/', async (req, res) => {

    const entrega = Number(req.body?.entrega);

    if (!Number.isInteger(entrega) || entrega <= 0) {
        return res.status(400).json({
            status: false,
            message: 'Seleccione una entrega válida'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Buscar la entrega y su propiedad.
        const [datos] = await connection.query(`
            SELECT
                ev.entrega,
                r.propiedad,
                r.oportunidad

            FROM entregas_viviendas ev

            INNER JOIN firmas_escrituras f
                ON ev.firma = f.firma
            INNER JOIN solicitudes_credito sc
                ON f.solicitud = sc.solicitud
            INNER JOIN reservas r
                ON sc.reserva = r.reserva

            WHERE ev.entrega = ?
        `, [entrega]);

        if (datos.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                status: false,
                message: 'La entrega no existe'
            });
        }

        const operacion = datos[0];

        // Bloquear la propiedad durante el cierre.
        const [propiedades] = await connection.query(`
            SELECT propiedad, precio, estado_venta
            FROM propiedades
            WHERE propiedad = ?
            FOR UPDATE
        `, [operacion.propiedad]);

        if (propiedades.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                status: false,
                message: 'Propiedad no encontrada'
            });
        }

        if (propiedades[0].estado_venta === 'vendida') {
            await connection.rollback();

            return res.status(409).json({
                status: false,
                message: 'Esta propiedad ya está vendida'
            });
        }

        const [existentes] = await connection.query(`
            SELECT venta
            FROM ventas_cerradas
            WHERE entrega = ?
               OR oportunidad = ?
               OR propiedad = ?
        `, [
            entrega,
            operacion.oportunidad,
            operacion.propiedad
        ]);

        if (existentes.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                status: false,
                message: 'La venta ya fue registrada'
            });
        }

        const [resultado] = await connection.query(`
            INSERT INTO ventas_cerradas
            (
                entrega,
                oportunidad,
                propiedad,
                precio_cierre
            )
            VALUES (?, ?, ?, ?)
        `, [
            entrega,
            operacion.oportunidad,
            operacion.propiedad,
            propiedades[0].precio
        ]);

        // Marcar vivienda como vendida.
        await connection.query(`
            UPDATE propiedades
            SET estado_venta = 'vendida'
            WHERE propiedad = ?
        `, [operacion.propiedad]);

        // Marcar oportunidad como ganada.
        await connection.query(`
            UPDATE oportunidades
            SET estado_oportu = 'ganada'
            WHERE oportunidad = ?
        `, [operacion.oportunidad]);

        await connection.commit();

        return res.status(201).json({
            status: true,
            message: 'Venta completada correctamente',
            data: {
                venta: resultado.insertId
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: false,
                message: 'Esta venta ya está registrada'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al completar la venta'
        });

    } finally {
        connection.release();
    }
});

// ========================================
// US-48: HISTORIAL DE VENTAS
// GET /api/ventas-finales
// ========================================

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                v.venta,
                v.entrega,
                v.oportunidad,
                v.propiedad,
                v.precio_cierre,
                v.fecha_cierre,

                p.nombre AS nombre_propiedad,
                p.estado_venta,

                CONCAT(c.nombres, ' ', c.apellidos)
                    AS nombre_cliente,

                ev.fecha_entrega

            FROM ventas_cerradas v

            INNER JOIN propiedades p
                ON v.propiedad = p.propiedad
            INNER JOIN oportunidades o
                ON v.oportunidad = o.oportunidad
            INNER JOIN intereses i
                ON o.interes = i.interes
            INNER JOIN clientes c
                ON i.cliente = c.cliente
            INNER JOIN entregas_viviendas ev
                ON v.entrega = ev.entrega

            ORDER BY v.fecha_cierre DESC, v.venta DESC
        `);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar historial de ventas'
        });
    }
});

module.exports = router;
