
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Consultar historial de interacciones
router.get('/', async (req, res) => {

    const { cliente } = req.query;

    let query1 = `
        SELECT s.seguimiento, s.cliente,
               CONCAT(c.nombres, ' ', c.apellidos) AS nombre_cliente,
               s.tipo_seg, s.observacion,
               s.proximo_contacto, s.fecha_registro_seg
        FROM seguimientos s, clientes c
        WHERE s.cliente = c.cliente
    `;

    const parametros = [];

    if (cliente) {
        query1 += ' AND s.cliente = ?';
        parametros.push(cliente);
    }

    query1 += ' ORDER BY s.fecha_registro_seg DESC';

    try {
        const [rows] = await db.query(query1, parametros);

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

// Registrar seguimiento
router.post('/', async (req, res) => {

    const {
        cliente,
        tipo_seg,
        observacion,
        proximo_contacto
    } = req.body;

    const tipos = [
        'llamada', 'whatsapp', 'correo', 'presencial', 'otro'
    ];

    if (!cliente || !tipos.includes(tipo_seg) ||
        typeof observacion !== 'string' || !observacion.trim()) {

        return res.status(400).json({
            status: false,
            message: 'Completa los campos obligatorios'
        });
    }

    const query2 = `
        INSERT INTO seguimientos
        (cliente, tipo_seg, observacion, proximo_contacto)
        VALUES (?, ?, ?, ?)
    `;

    try {
        const [rows] = await db.query(query2, [
            cliente,
            tipo_seg,
            observacion.trim(),
            proximo_contacto
                ? proximo_contacto.replace('T', ' ')
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

module.exports = router;
