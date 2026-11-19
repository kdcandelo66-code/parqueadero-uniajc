const express = require('express');
const { verificarToken, requerirRol } = require('../middlewares/auth');
const reportes = require('../services/reportes');

const router = express.Router();
router.use(verificarToken, requerirRol('Administrador'));

router.get('/', async (req, res, next) => {
  try { res.json(await reportes.consultar(req.query)); } catch (e) { next(e); }
});

module.exports = router;
