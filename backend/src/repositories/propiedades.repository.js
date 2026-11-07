const { pool } = require('../config/db');
const BaseRepository = require('./base.repository');

const COLUMNS = [
  'titulo',
  'direccion',
  'tipo',
  'operacion',
  'precio',
  'estado',
  'descripcion',
];

class PropiedadesRepository extends BaseRepository {
  constructor() {
    super(pool, 'propiedades', COLUMNS);
  }
}

module.exports = new PropiedadesRepository();
