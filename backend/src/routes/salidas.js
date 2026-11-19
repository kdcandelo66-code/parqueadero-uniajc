const express = require('express');
const { verificarToken, requerirRol } = require('../middlewares/auth');
const salidas = require('../services/salidas');

const router = express.Router();
router.use(verificarToken, requerirRol('Administrador', 'Guarda'));

router.get('/', async (req, res, next) => {
  try { res.json(await salidas.recientes()); } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await salidas.registrar(req.body?.id_ingreso, req.user.id)); }
  catch (e) { next(e); }
});

module.exports = router;
