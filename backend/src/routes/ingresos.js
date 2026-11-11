const express = require('express');
const { verificarToken, requerirRol } = require('../middlewares/auth');
const ingresos = require('../services/ingresos');

const router = express.Router();
router.use(verificarToken, requerirRol('Administrador', 'Guarda'));

router.get('/activos', async (req, res, next) => {
  try { res.json(await ingresos.activos()); } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await ingresos.registrar({
      ...(req.body || {}),
      id_usuario: req.user.id,
    }));
  } catch (e) { next(e); }
});

module.exports = router;
