/* const repository = require('../repositories/citas.repository');
const clientesRepository = require('../repositories/clientes.repository');
const propiedadesRepository = require('../repositories/propiedades.repository');
const AppError = require('../utils/AppError');

async function validarReferencias(data) {
  if (data.cliente_id !== undefined) {
    const cliente = await clientesRepository.findById(data.cliente_id);
    if (!cliente) {
      throw new AppError('El cliente indicado no existe', 422);
    }
  }

  if (data.propiedad_id !== undefined) {
    const propiedad = await propiedadesRepository.findById(data.propiedad_id);
    if (!propiedad) {
      throw new AppError('La propiedad indicada no existe', 422);
    }
  }
}

async function listar() {
  return repository.findAll();
}

async function obtener(id) {
  const cita = await repository.findById(id);

  if (!cita) {
    throw new AppError('Cita no encontrada', 404);
  }

  return cita;
}

async function crear(data) {
  await validarReferencias(data);
  return repository.create(data);
}

async function actualizar(id, data) {
  await obtener(id);
  await validarReferencias(data);
  return repository.update(id, data);
}

async function eliminar(id) {
  await obtener(id);
  await repository.remove(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
 */