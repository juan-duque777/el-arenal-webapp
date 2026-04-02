const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear el Pool de conexiones (Mejor que una sola conexión)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar la conexión (Para asegurarnos de que todo sirve)
async function testConnection() {
    try {
        const connection = await db.getConnection();
        console.log('✅ Base de Datos "el_arenal_db" conectada exitosamente.');
        connection.release(); // Libera la conexión para que no se tranque el sistema
    } catch (error) {
        console.error('❌ Error fatal al conectar la Base de Datos:');
        console.error(error.message);
    }
}

testConnection();

module.exports = db;