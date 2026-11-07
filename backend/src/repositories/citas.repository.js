const { pool } = require('../config/db');
const BaseRepository = require('./base.repository');

const COLUMNS = ['cliente_id', 'propiedad_id', 'fecha', 'hora', 'estado', 'notas'];

const SELECT_WITH_RELATIONS = `
  SELECT c.*,
         cl.nombre AS cliente_nombre,
         p.titulo  AS propiedad_titulo
    FROM citas c
    JOIN clientes cl ON cl.id = c.cliente_id
    JOIN propiedades p ON p.id = c.propiedad_id
`;

class CitasRepository extends BaseRepository {
  constructor() {
    super(pool, 'citas', COLUMNS);
  }

  async findAll() {
    const [rows] = await this.pool.query(
      `${SELECT_WITH_RELATIONS} ORDER BY c.fecha DESC, c.hora DESC`,
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute(
      `${SELECT_WITH_RELATIONS} WHERE c.id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }
}

module.exports = new CitasRepository();
