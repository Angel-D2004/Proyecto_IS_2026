/* const { Router } = require('express');
const clientesRoutes = require('./clientes.routes');
const propiedadesRoutes = require('./propiedades.routes');
const citasRoutes = require('./citas.routes');
const ventasRoutes = require('./ventas.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'inmobiliaria-api' });
});

router.use('/clientes', clientesRoutes);
router.use('/propiedades', propiedadesRoutes);
router.use('/citas', citasRoutes);
router.use('/ventas', ventasRoutes);

module.exports = router;
 */