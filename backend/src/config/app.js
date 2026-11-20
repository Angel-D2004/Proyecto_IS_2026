const express = require('express');
const cors = require('cors');



require('dotenv').config();

const usuariosRoutes = require('../routes/usuarios');
const clientesRoutes = require('../routes/clientes');
const propiedadesRoutes = require('../routes/propiedades');
const citasRoutes = require('../routes/citas');
const interesesRoutes = require('../routes/intereses');
const seguimientosRoutes = require('../routes/seguimientos');
const oportunidadesRoutes = require('../routes/oportunidades');
const pagosRoutes = require('../routes/pagos');
const evaluacionesRoutes = require('../routes/evaluaciones');
const reservasRoutes = require('../routes/reservas');
const solicitudesRoutes = require('../routes/solicitudes');
const documentosRoutes = require('../routes/documentos');
const cierresRoutes = require('../routes/cierres');
const ventasFinalesRoutes = require('../routes/ventas_finales');
const reportesRoutes = require('../routes/reportes');

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

app.use('/api/citas', citasRoutes);

app.use('/api/intereses', interesesRoutes);

app.use('/api/seguimientos', seguimientosRoutes);

app.use('/api/oportunidades', oportunidadesRoutes);

app.use('/api/pagos', pagosRoutes);

app.use('/api/evaluaciones', evaluacionesRoutes);

app.use('/api/reservas', reservasRoutes);

app.use('/api/solicitudes', solicitudesRoutes);

app.use('/api/documentos', documentosRoutes);

app.use('/api/cierres', cierresRoutes);

app.use('/api/ventas_finales', ventasFinalesRoutes);

app.use('/api/reportes', reportesRoutes);

module.exports = app;