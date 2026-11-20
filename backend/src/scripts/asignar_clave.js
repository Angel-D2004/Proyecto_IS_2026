
require('dotenv').config();

const bcrypt = require('bcryptjs');
const readline = require('node:readline');
const pool = require('../config/db');

async function main() {

    const id = Number(process.argv[2]);

    if (!Number.isInteger(id) || id <= 0) {
        console.log(
            'Uso: node src/scripts/asignar_clave.js ID'
        );
        process.exitCode = 1;
        return;
    }

    const [usuarios] = await pool.query(
        `SELECT usuario, nombre, rol
         FROM usuarios
         WHERE usuario = ?`,
        [id]
    );

    if (!usuarios.length) {
        console.log('Usuario no encontrado');
        return;
    }

    console.log('Usuario:', usuarios[0].nombre);
    console.log('Rol:', usuarios[0].rol);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Para este script local de pruebas,
    // la contraseña se introduce en la terminal.
    const contrasena = await new Promise(resolve => {
        rl.question(
            'Contraseña temporal: ',
            resolve
        );
    });

    rl.close();

    if (contrasena.length < 8) {
        console.log('Use al menos 8 caracteres');
        return;
    }

    const hash = await bcrypt.hash(contrasena, 12);

    await pool.query(
        `UPDATE usuarios
         SET contrasena_hash = ?
         WHERE usuario = ?`,
        [hash, id]
    );

    console.log('Contraseña asignada correctamente');
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
