const express = require('express');
const router = express.Router();
const db = require('../config/db');


// Consultar las citas
router.get('/', async (req, res) => {

    const { estado } = req.query;

    let query4 = `
        SELECT c.cita, c.cliente,
               CONCAT(cl.nombres, ' ', cl.apellidos) AS nombre_cliente,
               c.fecha, c.lugar, c.motivo, c.estado_cita, c.resultado
        FROM citas c, clientes cl
        WHERE c.cliente = cl.cliente
    `;

    const parametros = [];

    try {

        // Verificamos si se quiere consultar por estado
        if (estado) {

            if (!['pendiente', 'realizada', 'cancelada'].includes(estado)) {
                return res.status(400).json({
                    status: false,
                    message: 'Estado de cita no válido'
                });
            }

            query4 += ' AND c.estado_cita = ?';
            parametros.push(estado);
        }

        // Ordenamos las citas por fecha
        query4 += ' ORDER BY c.fecha_registro_cita ASC';

        const [rows] = await db.query(query4, parametros);

        return res.json({
            status: true,
            data: rows
        });

    } catch (error) {

        console.error("Database error:", error);

        return res.status(500).json({
            status: false,
            message: "Error al consultar las citas"
        });
    }
});

// Registrar una nueva cita
router.post('/', async (req, res) => {

    const { cliente, fecha, lugar, motivo } = req.body;

    // Validamos los campos obligatorios
    if (!cliente || !fecha || !lugar) {
        return res.status(400).json({
            status: false,
            message: 'El cliente, fecha y lugar son obligatorios'
        });
    }

    const query5 = `
        INSERT INTO citas (cliente, fecha, lugar, motivo)
        VALUES (?, ?, ?, ?)
    `;

    try {

        const [rows] = await db.query(query5, [
            cliente,
            fecha.replace('T', ' '),
            lugar,
            motivo || null
        ]);

        return res.status(201).json({
            status: true,
            message: 'Cita registrada correctamente',
            data: {
                cita: rows.insertId
            }
        });

    } catch (error) {

        console.error("Database error:", error);

        return res.status(500).json({
            status: false,
            message: 'Error al registrar la cita'
        });
    }
});

// Registrar el resultado de una cita
router.put('/:id/resultado', async (req, res) => {

    const { id } = req.params;
    const { estado_cita, resultado } = req.body;

    // Validamos el estado de la cita
    if (!['realizada', 'cancelada'].includes(estado_cita)) {
        return res.status(400).json({
            status: false,
            message: 'Estado de cita no válido'
        });
    }

    // Validamos las observaciones
    if (typeof resultado !== 'string' || !resultado.trim()) {
        return res.status(400).json({
            status: false,
            message: 'Las observaciones son obligatorias'
        });
    }

    const query6 = `
        UPDATE citas
        SET estado_cita = ?, resultado = ?
        WHERE cita = ? AND estado_cita = 'pendiente'
    `;

    try {

        const [rows] = await db.query(query6, [
            estado_cita,
            resultado.trim(),
            id
        ]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'No se encontró una cita pendiente'
            });
        }

        return res.json({
            status: true,
            message: 'Resultado registrado correctamente'
        });

    } catch (error) {

        console.error("Database error:", error);

        return res.status(500).json({
            status: false,
            message: 'Error al registrar resultado'
        });
    }
});

module.exports = router;