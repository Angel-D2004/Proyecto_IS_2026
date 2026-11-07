const AppError = require('../utils/AppError');

/** Comprueba que los campos indicados vengan en el body. */
function requireFields(fields) {
  return function validateRequired(req, res, next) {
    const missing = fields.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '',
    );

    if (missing.length > 0) {
      return next(new AppError(`Campos requeridos: ${missing.join(', ')}`, 422));
    }

    return next();
  };
}

/** Comprueba que los campos con valores enumerados sean válidos. */
function allowValues(allowed) {
  return function validateAllowed(req, res, next) {
    for (const [field, values] of Object.entries(allowed)) {
      const value = req.body[field];
      if (value !== undefined && value !== null && !values.includes(value)) {
        return next(
          new AppError(`Valor inválido para '${field}'. Permitidos: ${values.join(', ')}`, 422),
        );
      }
    }

    return next();
  };
}

/** Comprueba que los identificadores de ruta sean enteros positivos. */
function validateId(param = 'id') {
  return function validateIdentifier(req, res, next) {
    const value = Number(req.params[param]);
    if (!Number.isInteger(value) || value <= 0) {
      return next(new AppError(`El parámetro '${param}' debe ser un entero positivo`, 400));
    }
    req.params[param] = String(value);
    return next();
  };
}

module.exports = { requireFields, allowValues, validateId };
