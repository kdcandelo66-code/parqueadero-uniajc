const express = require('express');
const { verificarToken, requerirRol } = require('../middlewares/auth');
const integrantes = require('../services/integrantes');

const router = express.Router();
router.use(verificarToken);

router.get('/:placa/historial', requerirRol('Administrador', 'Guarda'), async (req, res, next) => {
  try { res.json(await integrantes.historialPorPlaca(req.params.placa)); }
  catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  if (req.user.rol !== 'Administrador')
    return res.status(403).json({ mensaje: 'No tiene permisos para esta acción' });
  try { res.status(201).json(await integrantes.registrarMotocicleta(req.body || {})); }
  catch (e) { next(e); }
});

module.exports = router;
