/* const { Router } = require('express');
const controller = require('../controllers/ventas.controller');
const { requireFields, allowValues, validateId } = require('../middleware/validate');

const router = Router();

const ESTADOS = ['en_proceso', 'cerrada', 'cancelada'];

router.get('/', controller.listar);
router.get('/:id', validateId(), controller.obtener);
router.post(
  '/',
  requireFields(['cliente_id', 'propiedad_id', 'fecha', 'monto']),
  allowValues({ estado: ESTADOS }),
  controller.crear,
);
router.put('/:id', validateId(), allowValues({ estado: ESTADOS }), controller.actualizar);
router.delete('/:id', validateId(), controller.eliminar);

module.exports = router;
 */