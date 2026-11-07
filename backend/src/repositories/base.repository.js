const AppError = require('../utils/AppError');

/**
 * Repositorio genérico con CRUD sobre una tabla.
 * Las subclases definen la tabla y las columnas escribibles.
 * Los nombres de tabla/columna son constantes internas, nunca entrada del usuario.
 */
class BaseRepository {
  constructor(pool, table, columns) {
    this.pool = pool;
    this.table = table;
    this.columns = columns;
  }

  async findAll() {
    const [rows] = await this.pool.query(
      `SELECT * FROM \`${this.table}\` ORDER BY id DESC`,
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.execute(
      `SELECT * FROM \`${this.table}\` WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(data) {
    const fields = this.columns.filter((column) => data[column] !== undefined);

    if (fields.length === 0) {
      throw new AppError('No se enviaron campos para crear el registro', 422);
    }

    const columnsSql = fields.map((column) => `\`${column}\``).join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map((column) => data[column]);

    const [result] = await this.pool.execute(
      `INSERT INTO \`${this.table}\` (${columnsSql}) VALUES (${placeholders})`,
      values,
    );

    return this.findById(result.insertId);
  }

  async update(id, data) {
    const fields = this.columns.filter((column) => data[column] !== undefined);

    if (fields.length === 0) {
      throw new AppError('No se enviaron campos para actualizar', 422);
    }

    const setSql = fields.map((column) => `\`${column}\` = ?`).join(', ');
    const values = fields.map((column) => data[column]);

    await this.pool.execute(
      `UPDATE \`${this.table}\` SET ${setSql} WHERE id = ?`,
      [...values, id],
    );

    return this.findById(id);
  }

  async remove(id) {
    const [result] = await this.pool.execute(
      `DELETE FROM \`${this.table}\` WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }
}

module.exports = BaseRepository;
