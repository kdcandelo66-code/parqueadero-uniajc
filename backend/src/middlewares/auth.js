// T6 y T7: verificación del token JWT y control de acceso por rol (HU-02)
const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
  const authHeader = (req.headers.authorization || '').trim();
  const partes = authHeader.split(/\s+/);
  const tipo = partes[0]?.toLowerCase();
  const token = partes.slice(1).join(' ');

  if (tipo !== 'bearer' || !token) {
    return res.status(401).json({ mensaje: 'Sesión no válida' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ mensaje: 'Sesión no válida' });
  }
};

exports.requerirRol = (...roles) => (req, res, next) =>
  roles.includes(req.user?.rol)
    ? next()
    : res.status(403).json({ mensaje: 'No tiene permisos para esta acción' });
