const express = require('express');
const cors = require('cors');



require('dotenv').config();

const usuariosRoutes = require('../routes/usuarios');
const clientesRoutes = require('../routes/clientes');
const propiedadesRoutes = require('../routes/propiedades');

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

app.use('/api/clientes', clientesRoutes);

app.use('/api/propiedades', propiedadesRoutes);

module.exports = app;