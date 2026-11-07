const { pool } = require('../config/db');
const BaseRepository = require('./base.repository');

const COLUMNS = ['nombre', 'email', 'telefono', 'tipo', 'direccion', 'notas'];

class ClientesRepository extends BaseRepository {
  constructor() {
    super(pool, 'clientes', COLUMNS);
  }
}

module.exports = new ClientesRepository();
