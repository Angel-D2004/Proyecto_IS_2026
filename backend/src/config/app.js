const express = require('express');
const cors = require('cors');


require('dotenv').config();

const usuariosRoutes = require('../routes/usuarios');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({
        mensaje: 'Backend funcionando correctamente'
    });
});

// Rutas de usuarios
app.use('/api/usuarios', usuariosRoutes);

module.exports = app;