
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

module.exports = router;
