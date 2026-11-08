const express = require('express');
const router = express.Router();
const db = require('../config/db');

// consultamos los clientes 
router.get('/', async (req, res) => {
    try {
        const [clientes] = await db.query(
            'SELECT * FROM clientes ORDER BY cliente DESC'
        );

        res.json({
            status: true,
            data: clientes
        });

    } catch (error) {
        console.error('Error al consultar clientes:', error);

        res.status(500).json({
            status: false,
            message: 'Error al consultar clientes'
        });
    }
});

// Registrar un nuevo prospecto
router.post('/', async (req, res) => {
    try {
        const { nombres, apellidos, telefono, email, origen } = req.body;

        if (!nombres?.trim() || !apellidos?.trim()) {
            return res.status(400).json({
                status: false,
                message: 'El nombre y apellido son obligatorios'
            });
        }

        const [resultado] = await db.execute(
            `INSERT INTO clientes
             (nombres, apellidos, telefono, email, origen)
             VALUES (?, ?, ?, ?, ?)`,
            [
                nombres.trim(),
                apellidos.trim(),
                telefono || null,
                email || null,
                origen || null
            ]
        );

        res.status(201).json({
            status: true,
            message: 'Prospecto registrado correctamente',
            data: {
                cliente: resultado.insertId
            }
        });

    } catch (error) {
        console.error('Error al registrar prospecto:', error);

        res.status(500).json({
            status: false,
            message: 'Error al registrar prospecto'
        });
    }
});



router.put('/:id', async (req, res) => {
    console.log('PUT body:', req.body);
    try {
        const { id } = req.params;
        const { nombres, apellidos, telefono, email, origen } = req.body;

        if (!nombres?.trim() || !apellidos?.trim()) {
            return res.status(400).json({
                status: false,
                message: 'El nombre y apellido son obligatorios'
            });
        }

        const [resultado] = await db.execute(
            `UPDATE clientes
             SET nombres = ?, apellidos = ?, telefono = ?,
                 email = ?, origen = ?
             WHERE cliente = ?`,
            [
                nombres.trim(),
                apellidos.trim(),
                telefono || null,
                email || null,
                origen || null,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'Cliente no encontrado'
            });
        }

        res.json({
            status: true,
            message: 'Cliente actualizado correctamente'
        });

    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({
            status: false,
            message: 'Error al actualizar cliente'
        });
    }
});


module.exports = router;