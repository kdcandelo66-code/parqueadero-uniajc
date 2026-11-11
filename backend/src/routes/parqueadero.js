// T9: capacidad máxima (HU-05)
const express = require('express');
const { verificarToken, requerirRol } = require('../middlewares/auth');
const parqueadero = require('../services/parqueadero');

const router = express.Router();
router.use(verificarToken);

router.get('/', requerirRol('Administrador', 'Guarda'), async (req, res, next) => {
  try { res.json(await parqueadero.resumen()); } catch (e) { next(e); }
});
router.put('/capacidad', requerirRol('Administrador'), async (req, res, next) => {
  try { res.json(await parqueadero.cambiarCapacidad(req.body?.capacidad_maxima)); } catch (e) { next(e); }
});

module.exports = router;
