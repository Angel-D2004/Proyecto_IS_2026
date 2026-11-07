/* const service = require('../services/clientes.service');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const data = await service.listar();
  res.json({ data });
});

const obtener = asyncHandler(async (req, res) => {
  const data = await service.obtener(Number(req.params.id));
  res.json({ data });
});

const crear = asyncHandler(async (req, res) => {
  const data = await service.crear(req.body);
  res.status(201).json({ data });
});

const actualizar = asyncHandler(async (req, res) => {
  const data = await service.actualizar(Number(req.params.id), req.body);
  res.json({ data });
});

const eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(Number(req.params.id));
  res.status(204).send();
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
 */