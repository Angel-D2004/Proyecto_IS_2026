const { env } = require('../config/env');

module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Error interno del servidor';

  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Ya existe un registro con esos datos';
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'La referencia indicada no existe';
  }

  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 409;
    message = 'No se puede eliminar: el registro tiene datos relacionados';
  }

  if (statusCode >= 500) {
    console.error('[api]', error);
  }

  const body = { error: { message } };

  if (env.nodeEnv === 'development' && statusCode >= 500) {
    body.error.detail = error.message;
  }

  return res.status(statusCode).json(body);
};
