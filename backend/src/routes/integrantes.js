const express = require('express');
const { verificarToken, requerirRol } = require('../middlewares/auth');
const integrantes = require('../services/integrantes');

const router = express.Router();
router.use(verificarToken);

router.get('/', requerirRol('Administrador'), async (req, res, next) => {
  try { res.json(await integrantes.listar()); } catch (e) { next(e); }
});

router.post('/', requerirRol('Administrador'), async (req, res, next) => {
  try { res.status(201).json(await integrantes.crear(req.body || {})); } catch (e) { next(e); }
});

router.put('/:numero_carne/autorizacion', requerirRol('Administrador'), async (req, res, next) => {
  try { res.json(await integrantes.actualizarAutorizacion(req.params.numero_carne, req.body || {})); }
  catch (e) { next(e); }
});

router.get('/:numero_carne/historial', requerirRol('Administrador', 'Guarda'), async (req, res, next) => {
  try { res.json(await integrantes.historial(req.params.numero_carne)); } catch (e) { next(e); }
});

router.get('/:numero_carne', requerirRol('Administrador', 'Guarda'), async (req, res, next) => {
  try { res.json(await integrantes.obtenerPorCarne(req.params.numero_carne)); } catch (e) { next(e); }
});

module.exports = router;
