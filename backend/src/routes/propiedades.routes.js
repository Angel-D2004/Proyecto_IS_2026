/* const { Router } = require('express');
const controller = require('../controllers/propiedades.controller');
const { requireFields, allowValues, validateId } = require('../middleware/validate');

const router = Router();

const TIPOS = ['casa', 'departamento', 'terreno', 'local', 'oficina'];
const OPERACIONES = ['venta', 'alquiler'];
const ESTADOS = ['disponible', 'reservada', 'vendida', 'alquilada'];

router.get('/', controller.listar);
router.get('/:id', validateId(), controller.obtener);
router.post(
  '/',
  requireFields(['titulo', 'direccion', 'precio']),
  allowValues({ tipo: TIPOS, operacion: OPERACIONES, estado: ESTADOS }),
  controller.crear,
);
router.put(
  '/:id',
  validateId(),
  allowValues({ tipo: TIPOS, operacion: OPERACIONES, estado: ESTADOS }),
  controller.actualizar,
);
router.delete('/:id', validateId(), controller.eliminar);

module.exports = router;
 */