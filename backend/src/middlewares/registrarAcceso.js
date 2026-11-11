// T12: registro de accesos (HU-04). Guarda fecha y hora, usuario, IP y resultado.
// Nunca guarda la contraseña. Archivo: backend/logs/accesos.log (una línea JSON por intento).
const fs = require('fs');
const path = require('path');

const RUTA_LOG = path.join(__dirname, '..', '..', 'logs', 'accesos.log');

function registrarAcceso(usuario, exitoso, ip = '') {
  const linea = JSON.stringify({
    fecha_hora: new Date().toISOString(),
    usuario: String(usuario || '').slice(0, 50),
    ip,
    resultado: exitoso ? 'exitoso' : 'fallido',
  });
  fs.mkdirSync(path.dirname(RUTA_LOG), { recursive: true });
  fs.appendFile(RUTA_LOG, linea + '\n', (err) => {
    if (err) console.error('No se pudo escribir el registro de accesos:', err.message);
  });
}

module.exports = { registrarAcceso, RUTA_LOG };
