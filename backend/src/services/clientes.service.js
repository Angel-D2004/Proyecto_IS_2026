/* const repository = require('../repositories/clientes.repository');
const AppError = require('../utils/AppError');

async function listar() {
  return repository.findAll();
}

async function obtener(id) {
  const cliente = await repository.findById(id);

  if (!cliente) {
    throw new AppError('Cliente no encontrado', 404);
  }

  return cliente;
}

async function crear(data) {
  return repository.create(data);
}

async function actualizar(id, data) {
  await obtener(id);
  return repository.update(id, data);
}

async function eliminar(id) {
  await obtener(id);
  await repository.remove(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
 */