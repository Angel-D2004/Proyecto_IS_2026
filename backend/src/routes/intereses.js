
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Consultar intereses registrados
router.get('/', async (req, res) => {

    const query1 = `
        SELECT i.interes, i.cliente, i.propiedad,
               CONCAT(c.nombres, ' ', c.apellidos) AS nombre_cliente,
               p.nombre AS nombre_propiedad,
               p.precio, i.observacion, i.fecha_registro_in
        FROM intereses i, clientes c, propiedades p
        WHERE i.cliente = c.cliente
        AND i.propiedad = p.propiedad
        ORDER BY i.fecha_registro_in DESC
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
            message: 'Error al consultar intereses'
        });
    }
});

// Registrar interés en una propiedad
router.post('/', async (req, res) => {

    const { cliente, propiedad, observacion } = req.body;

    if (!cliente || !propiedad) {
        return res.status(400).json({
            status: false,
            message: 'Selecciona un cliente y una propiedad'
        });
    }

    const query2 = `
        INSERT INTO intereses
        (cliente, propiedad, observacion)
        VALUES (?, ?, ?)
    `;

    try {
        const [rows] = await db.query(query2, [
            cliente,
            propiedad,
            observacion || null
        ]);

        return res.status(201).json({
            status: true,
            message: 'Interés registrado correctamente',
            data: { interes: rows.insertId }
        });

    } catch (error) {
        console.error("Database error:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: false,
                message: 'El cliente ya tiene interés en esta propiedad'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Error al registrar interés'
        });
    }
});


// Consultar historial de interés de una propiedad
router.get('/propiedad/:id', async (req, res) => {

    const { id } = req.params;

    const query3 = `
        SELECT i.interes,
               i.cliente,
               i.propiedad,
               CONCAT(c.nombres, ' ', c.apellidos) AS nombre_cliente,
               p.nombre AS nombre_propiedad,
               i.observacion,
               i.fecha_registro_in

        FROM intereses i, clientes c, propiedades p

        WHERE i.cliente = c.cliente
        AND i.propiedad = p.propiedad
        AND i.propiedad = ?

        ORDER BY i.fecha_registro_in DESC
    `;

    try {

        const [rows] = await db.query(query3, [id]);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error("Database error:", error);

        return res.status(500).json({
            status: false,
            message: 'Error al consultar historial de intereses'
        });
    }
});


module.exports = router;
