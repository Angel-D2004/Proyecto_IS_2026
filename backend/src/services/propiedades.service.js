/* const repository = require('../repositories/propiedades.repository');
const AppError = require('../utils/AppError');

async function listar() {
  return repository.findAll();
}

async function obtener(id) {
  const propiedad = await repository.findById(id);

  if (!propiedad) {
    throw new AppError('Propiedad no encontrada', 404);
  }

  return propiedad;
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