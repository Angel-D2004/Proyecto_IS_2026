const { pool } = require('../config/db');
const BaseRepository = require('./base.repository');

const COLUMNS = [
  'cliente_id',
  'propiedad_id',
  'fecha',
  'monto',
  'comision',
  'estado',
  'notas',
];

const SELECT_WITH_RELATIONS = `
  SELECT v.*,
         cl.nombre AS cliente_nombre,
         p.titulo  AS propiedad_titulo
    FROM ventas v
    JOIN clientes cl ON cl.id = v.cliente_id
    JOIN propiedades p ON p.id = v.propiedad_id
`;

class VentasRepository extends BaseRepository {
  constructor() {
    super(pool, 'ventas', COLUMNS);
  }

  async findAll() {
    const [rows] = await this.pool.query(
      `${SELECT_WITH_RELATIONS} ORDER BY v.fecha DESC, v.id DESC`,
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute(
      `${SELECT_WITH_RELATIONS} WHERE v.id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }
}

module.exports = new VentasRepository();
