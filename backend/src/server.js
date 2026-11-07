const app = require('./config/app');
require('dotenv').config();
const db = require('./config/db');


const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        // Comprobamos la conexión con MySQL
        await db.query('SELECT 1');

        console.log('Conexión con MySQL exitosa');

        app.listen(PORT, () => {
            console.log(`Servidor funcionando en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error al conectar con MySQL:', error.message);
        process.exit(1);
    }
}

iniciarServidor();






/* const { createApp } = require('./config/app');
const { env } = require('./config/env');
const { testConnection } = require('./config/db');

async function main() {
  const app = createApp();

  try {
    await testConnection();
    console.log(`[db] Conexión establecida con ${env.db.host}:${env.db.port}/${env.db.database}`);
  } catch (error) {
    console.warn(`[db] No se pudo conectar (${error.message}). La API arranca igual.`);
  }

  app.listen(env.port, () => {
    console.log(`[api] Escuchando en http://localhost:${env.port}/api`);
  });
}

main().catch((error) => {
  console.error('[api] Error fatal al iniciar:', error);
  process.exit(1);
});
 */