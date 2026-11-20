
const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../config/db');

// =======================================
// LOGIN
// POST /api/auth/login
// =======================================

router.post('/login', async (req, res) => {

    const { email, contrasena } = req.body || {};

    if (
        typeof email !== 'string' ||
        typeof contrasena !== 'string' ||
        !email.trim() ||
        !contrasena
    ) {
        return res.status(400).json({
            status: false,
            message: 'Ingrese correo y contraseña'
        });
    }

    try {

        const [usuarios] = await db.query(`
            SELECT
                usuario,
                nombre,
                email,
                rol,
                activo,
                contrasena_hash
            FROM usuarios
            WHERE email = ?
            LIMIT 1
        `, [email.trim()]);

        // No revelar si el correo existe.
        if (usuarios.length === 0) {
            return res.status(401).json({
                status: false,
                message: 'Credenciales incorrectas'
            });
        }

        const usuario = usuarios[0];

        if (
            !usuario.contrasena_hash ||
            !(await bcrypt.compare(
                contrasena,
                usuario.contrasena_hash
            ))
        ) {
            return res.status(401).json({
                status: false,
                message: 'Credenciales incorrectas'
            });
        }

        if (!usuario.activo) {
            return res.status(403).json({
                status: false,
                message: 'Usuario inactivo'
            });
        }

        const roles = [
            'vendedor',
            'supervisor',
            'administrador'
        ];

        if (!roles.includes(usuario.rol)) {
            return res.status(403).json({
                status: false,
                message: 'Rol no reconocido'
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('Falta configurar JWT_SECRET');
        }

        const token = jwt.sign(
            { usuario: usuario.usuario },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            status: true,
            message: 'Inicio de sesión correcto',
            data: {
                token,
                usuario: {
                    usuario: usuario.usuario,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Error al iniciar sesión'
        });
    }
});

// =======================================
// CONSULTAR SESIÓN ACTUAL
// GET /api/auth/me
// =======================================

router.get('/me', async (req, res) => {

    const encabezado = req.headers.authorization || '';

    const token = encabezado.startsWith('Bearer ')
        ? encabezado.substring(7)
        : null;

    if (!token || !process.env.JWT_SECRET) {
        return res.status(401).json({
            status: false,
            message: 'Sesión no válida'
        });
    }

    try {

        const datos = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const [usuarios] = await db.query(`
            SELECT usuario, nombre, email, rol
            FROM usuarios
            WHERE usuario = ?
              AND activo = 1
            LIMIT 1
        `, [datos.usuario]);

        if (usuarios.length === 0) {
            return res.status(401).json({
                status: false,
                message: 'Usuario no disponible'
            });
        }

        return res.json({
            status: true,
            data: usuarios[0]
        });

    } catch (error) {

        return res.status(401).json({
            status: false,
            message: 'Sesión vencida o no válida'
        });
    }
});

module.exports = router;
