/* const { Router } = require('express');
const controller = require('../controllers/citas.controller');
const { requireFields, allowValues, validateId } = require('../middleware/validate');

const router = Router();

const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'realizada'];

router.get('/', controller.listar);
router.get('/:id', validateId(), controller.obtener);
router.post(
  '/',
  requireFields(['cliente_id', 'propiedad_id', 'fecha', 'hora']),
  allowValues({ estado: ESTADOS }),
  controller.crear,
);
router.put('/:id', validateId(), allowValues({ estado: ESTADOS }), controller.actualizar);
router.delete('/:id', validateId(), controller.eliminar);

module.exports = router;
 */