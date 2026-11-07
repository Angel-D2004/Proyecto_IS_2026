/**
 * Envuelve controladores async para que cualquier rechazo llegue a next()
 * y sea manejado por el middleware de errores.
 */
module.exports = function asyncHandler(handler) {
  return function wrapped(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
