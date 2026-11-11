// T6: inicio de sesión con contraseñas protegidas (HU-02, HU-04)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { registrarAcceso } = require('../middlewares/registrarAcceso');
const { verificarToken } = require('../middlewares/auth');

const router = express.Router();
const MENSAJE_GENERICO = 'Usuario o contraseña no válidos';

router.post('/login', async (req, res, next) => {
  try {
    const usuario = String(req.body?.usuario ?? '').trim();
    const contrasena = req.body?.contrasena;
    if (!usuario || !contrasena) return res.status(400).json({ mensaje: 'Ingrese usuario y contraseña' });

    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre_completo, u.contrasena_hash, r.nombre AS rol
         FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.usuario = ? AND u.estado = 'activo'`, [usuario]);
    const u = rows[0];
    const ok = Boolean(u) && await bcrypt.compare(String(contrasena), u.contrasena_hash);

    registrarAcceso(usuario, ok, req.ip); // T12
    if (!ok) return res.status(401).json({ mensaje: MENSAJE_GENERICO });

    const token = jwt.sign({ id: u.id_usuario, rol: u.rol, nombre: u.nombre_completo },
      process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRA || '8h' });
    res.json({ token, rol: u.rol, nombre: u.nombre_completo });
  } catch (e) { next(e); }
});

// Datos de la sesión actual (el frontend lo usa al recargar la página)
router.get('/sesion', verificarToken, (req, res) =>
  res.json({ id: req.user.id, rol: req.user.rol, nombre: req.user.nombre }));

module.exports = router;
