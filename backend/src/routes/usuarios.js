const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await pool.query(
            'SELECT usuario, nombre, email, rol, activo FROM Usuarios'
        );

        res.json({
            status: true,
            data: usuarios
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: false,
            message: 'Error al consultar los usuarios'
        });
    }
});

module.exports = router;