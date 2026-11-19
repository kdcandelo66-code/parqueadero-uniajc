const express = require('express');
const { verificarToken, requerirRol } = require('../middlewares/auth');
const novedades = require('../services/novedades');

const router = express.Router();
router.use(verificarToken, requerirRol('Administrador', 'Guarda'));

router.get('/', async (req, res, next) => {
  try { res.json(await novedades.listar()); } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await novedades.crear(req.body || {}, req.user.id)); }
  catch (e) { next(e); }
});

module.exports = router;
