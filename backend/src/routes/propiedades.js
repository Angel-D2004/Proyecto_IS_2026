
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Consultar todas las propiedades
// Opcional: /api/propiedades?estado=disponible
router.get('/', async (req, res) => {
    try {
        const { estado } = req.query;

        let sql = 'SELECT * FROM propiedades';
        const parametros = [];

        if (estado) {
            if (!['disponible', 'reservada', 'vendida'].includes(estado)) {
                return res.status(400).json({
                    status: false,
                    message: 'Estado no válido'
                });
            }

            sql += ' WHERE estado = ?';
            parametros.push(estado);
        }

        sql += ' ORDER BY propiedad DESC';

        const [propiedades] = await db.query(sql, parametros);

        res.json({
            status: true,
            data: propiedades
        });

    } catch (error) {
        console.error('Error al consultar propiedades:', error);

        res.status(500).json({
            status: false,
            message: 'Error al consultar propiedades'
        });
    }
});

// Registrar propiedad
router.post('/', async (req, res) => {
    try {
        const { codigo, nombre, ubicacion, descripcion, precio } = req.body;

        if (
            typeof codigo !== 'string' || !codigo.trim() ||
            typeof nombre !== 'string' || !nombre.trim() ||
            typeof ubicacion !== 'string' || !ubicacion.trim() ||
            precio === null || precio === undefined ||
            String(precio).trim() === '' ||
            !Number.isFinite(Number(precio)) || Number(precio) <= 0
        ) {
            return res.status(400).json({
                status: false,
                message: 'Verifica los datos obligatorios de la propiedad'
            });
        }

        const [resultado] = await db.execute(
            `INSERT INTO propiedades
             (codigo, nombre, ubicacion, descripcion, precio)
             VALUES (?, ?, ?, ?, ?)`,
            [
                codigo.trim(),
                nombre.trim(),
                ubicacion.trim(),
                descripcion || null,
                Number(precio)
            ]
        );

        res.status(201).json({
            status: true,
            message: 'Propiedad registrada correctamente',
            data: { propiedad: resultado.insertId }
        });

    } catch (error) {
        console.error('Error al registrar propiedad:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: false,
                message: 'Ya existe una propiedad con ese código'
            });
        }

        res.status(500).json({
            status: false,
            message: 'Error al registrar propiedad'
        });
    }
});

// Actualizar estado de propiedad
router.put('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['disponible', 'reservada', 'vendida'].includes(estado)) {
            return res.status(400).json({
                status: false,
                message: 'Estado no válido'
            });
        }

        const [resultado] = await db.execute(
            'UPDATE propiedades SET estado = ? WHERE propiedad = ?',
            [estado, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'Propiedad no encontrada'
            });
        }

        res.json({
            status: true,
            message: 'Estado actualizado correctamente'
        });

    } catch (error) {
        console.error('Error al actualizar propiedad:', error);

        res.status(500).json({
            status: false,
            message: 'Error al actualizar propiedad'
        });
    }
});

module.exports = router;
