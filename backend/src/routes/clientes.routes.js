/* const { Router } = require('express');
const controller = require('../controllers/clientes.controller');
const { requireFields, allowValues, validateId } = require('../middleware/validate');

const router = Router();

const TIPOS = ['comprador', 'vendedor', 'inquilino', 'propietario'];

router.get('/', controller.listar);
router.get('/:id', validateId(), controller.obtener);
router.post('/', requireFields(['nombre', 'email']), allowValues({ tipo: TIPOS }), controller.crear);
router.put('/:id', validateId(), allowValues({ tipo: TIPOS }), controller.actualizar);
router.delete('/:id', validateId(), controller.eliminar);

module.exports = router;
 */