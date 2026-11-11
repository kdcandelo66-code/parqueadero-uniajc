// Conexión a MySQL (pool de conexiones)
require('dotenv').config();
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'parqueadero_uniajc',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'local',
});

module.exports = db;
