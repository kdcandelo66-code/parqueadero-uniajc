// T5: servidor Express (API REST). El cliente React solo se comunica con esta API
// y esta es la única que accede a la base de datos MySQL.
require('dotenv').config();
const express = require('express');
const cors = require('cors');

if (!process.env.JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en el archivo .env');
}

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/parqueadero', require('./routes/parqueadero'));
app.use('/api/integrantes', require('./routes/integrantes'));
app.use('/api/motocicletas', require('./routes/motocicletas'));
app.use('/api/ingresos', require('./routes/ingresos'));

app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

// Manejo central de errores: los errores de negocio traen su código HTTP
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ mensaje: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ mensaje: 'JSON no válido' });
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

module.exports = app;
