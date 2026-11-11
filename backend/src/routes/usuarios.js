// T8: rutas exclusivas del Administrador (HU-03)
const express = require('express');
const { verificarToken, requerirRol } = require('../middlewares/auth');
const usuarios = require('../services/usuarios');

const router = express.Router();
router.use(verificarToken, requerirRol('Administrador'));

router.get('/', async (req, res, next) => {
  try { res.json(await usuarios.listar()); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { res.status(201).json(await usuarios.crear(req.body || {})); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensaje: 'Identificador no válido' });
    if (id === req.user.id && req.body?.estado === 'inactivo')
      return res.status(400).json({ mensaje: 'No puede inactivar su propio usuario' });
    res.json(await usuarios.actualizar(id, req.body || {}));
  } catch (e) { next(e); }
});

module.exports = router;
