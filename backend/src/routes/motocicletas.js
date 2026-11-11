const express = require('express');
const { verificarToken, requerirRol } = require('../middlewares/auth');
const integrantes = require('../services/integrantes');

const router = express.Router();
router.use(verificarToken, requerirRol('Administrador'));

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await integrantes.registrarMotocicleta(req.body || {})); }
  catch (e) { next(e); }
});

module.exports = router;
