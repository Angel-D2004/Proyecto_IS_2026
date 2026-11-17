
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Consultar oportunidades de venta
router.get('/', async (req, res) => {

    const query1 = `
        SELECT o.oportunidad, o.interes,
               CONCAT(c.nombres, ' ', c.apellidos) AS nombre_cliente,
               p.nombre AS nombre_propiedad,
               p.precio, o.estado_oportu,
               o.observacion_opor, o.fecha_registro_opor
        FROM oportunidades o, intereses i,
             clientes c, propiedades p
        WHERE o.interes = i.interes
        AND i.cliente = c.cliente
        AND i.propiedad = p.propiedad
        ORDER BY o.fecha_registro_opor DESC
    `;

    try {
        const [rows] = await db.query(query1);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {
        console.error("Database error:", error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar oportunidades'
        });
    }
});

// Crear oportunidad de venta
router.post('/', async (req, res) => {

    const { interes, observacion_opor } = req.body;

    if (!interes) {
        return res.status(400).json({
            status: false,
            message: 'Selecciona un interés registrado'
        });
    }

    const query2 = `
        INSERT INTO oportunidades
        (interes, observacion_opor)
        VALUES (?, ?)
    `;

    try {
        const [rows] = await db.query(query2, [
            interes,
            observacion_opor || null
        ]);

        return res.status(201).json({
            status: true,
            message: 'Oportunidad creada correctamente',
            data: { oportunidad: rows.insertId }
        });

    } catch (error) {
        console.error("Database error:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: false,
                message: 'Ya existe una oportunidad para este interés'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al crear oportunidad'
        });
    }
});


// Actualizar estado de una oportunidad
router.put('/:id/estado', async (req, res) => {

    const { id } = req.params;
    const { estado } = req.body;

    if (!['abierta', 'en_proceso', 'perdida', 'ganada'].includes(estado)) {
        return res.status(400).json({
            status: false,
            message: 'Estado no válido'
        });
    }

    const query3 = `
        UPDATE oportunidades
        SET estado_oportu = ?
        WHERE oportunidad = ?
        AND estado_oportu != 'ganada'
    `;

    try {

        const [rows] = await db.query(query3, [estado, id]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'No se encontró una oportunidad modificable'
            });
        }

        return res.json({
            status: true,
            message: 'Estado actualizado correctamente'
        });

    } catch (error) {

        console.error("Database error:", error);

        return res.status(500).json({
            status: false,
            message: 'Error al actualizar oportunidad'
        });
    }
});


// Registrar seguimiento de una oportunidad
router.post('/:id/seguimientos', async (req, res) => {

    const { id } = req.params;
    const { observacion, proxima_accion } = req.body;

    if (typeof observacion !== 'string' || !observacion.trim()) {
        return res.status(400).json({
            status: false,
            message: 'La observación es obligatoria'
        });
    }

    const query4 = `
        INSERT INTO seguimiento_oportunidades
        (oportunidad, observacion_segopor, proxima_accion)
        VALUES (?, ?, ?)
    `;

    try {

        const [rows] = await db.query(query4, [
            id,
            observacion.trim(),
            proxima_accion
                ? proxima_accion.replace('T', ' ')
                : null
        ]);

        return res.status(201).json({
            status: true,
            message: 'Seguimiento registrado correctamente',
            data: { seguimiento: rows.insertId }
        });

    } catch (error) {

        console.error("Database error:", error);

        return res.status(500).json({
            status: false,
            message: 'Error al registrar seguimiento'
        });
    }
});


// Consultar historial de una oportunidad
router.get('/:id/seguimientos', async (req, res) => {

    const { id } = req.params;

    const query5 = `
        SELECT *
        FROM seguimiento_oportunidades
        WHERE oportunidad = ?
        ORDER BY fecha_registro DESC, seguimiento DESC
    `;

    try {

        const [rows] = await db.query(query5, [id]);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error("Database error:", error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar seguimientos'
        });
    }
});


// Consultar oportunidades con acciones pendientes
router.get('/pendientes', async (req, res) => {

    const query6 = `
        SELECT o.oportunidad,
               CONCAT(c.nombres, ' ', c.apellidos) AS nombre_cliente,
               p.nombre AS nombre_propiedad,
               o.estado_oportu,
               s.observacion_segopor,
               s.proxima_accion

        FROM oportunidades o, intereses i,
             clientes c, propiedades p,
             seguimiento_oportunidades s

        WHERE o.interes = i.interes
        AND i.cliente = c.cliente
        AND i.propiedad = p.propiedad
        AND s.oportunidad = o.oportunidad

        AND s.seguimiento = (
            SELECT MAX(s2.seguimiento)
            FROM seguimiento_oportunidades s2
            WHERE s2.oportunidad = o.oportunidad
        )

        AND o.estado_oportu IN ('abierta', 'en_proceso')
        AND s.proxima_accion <= NOW()

        ORDER BY s.proxima_accion ASC
    `;

    try {

        const [rows] = await db.query(query6);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error("Database error:", error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar oportunidades pendientes'
        });
    }
});


module.exports = router;
