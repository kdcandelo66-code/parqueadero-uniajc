// T9: parámetro de capacidad máxima (HU-05)
const db = require('../config/db');
const { ErrorNegocio } = require('./usuarios');

// La ocupación se calcula con los ingresos que aún no tienen salida
async function ocupados(conn = db) {
  const [[{ total }]] = await conn.query(
    `SELECT COUNT(*) AS total FROM ingresos WHERE estado_movimiento = 'activo'`);
  return Number(total);
}

async function resumen() {
  const [[p]] = await db.query(
    `SELECT id_parqueadero, nombre, capacidad_maxima FROM parqueadero ORDER BY id_parqueadero LIMIT 1`);
  if (!p) throw new ErrorNegocio(404, 'No hay parqueadero configurado');
  const ocup = await ocupados();
  return {
    id_parqueadero: p.id_parqueadero,
    nombre: p.nombre,
    capacidad_maxima: p.capacidad_maxima,
    espacios_ocupados: ocup,
    espacios_disponibles: p.capacidad_maxima - ocup,
    porcentaje_ocupacion: Number(((ocup / p.capacidad_maxima) * 100).toFixed(2)),
  };
}

async function cambiarCapacidad(valor) {
  const capacidad = Number(valor);
  if (!Number.isInteger(capacidad) || capacidad <= 0)
    throw new ErrorNegocio(400, 'La capacidad debe ser un número entero mayor que cero');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[p]] = await conn.query(
      `SELECT id_parqueadero FROM parqueadero ORDER BY id_parqueadero LIMIT 1 FOR UPDATE`);
    if (!p) throw new ErrorNegocio(404, 'No hay parqueadero configurado');
    const ocup = await ocupados(conn);
    if (capacidad < ocup)
      throw new ErrorNegocio(400, `La capacidad no puede ser menor que los espacios ocupados (${ocup})`);
    await conn.query(`UPDATE parqueadero SET capacidad_maxima = ? WHERE id_parqueadero = ?`, [capacidad, p.id_parqueadero]);
    await conn.query(
      `UPDATE espacios SET espacios_ocupados = ?, espacios_disponibles = ?,
              porcentaje_ocupacion = ?, fecha_hora_actualizacion = NOW()
        WHERE id_parqueadero = ?`,
      [ocup, capacidad - ocup, ((ocup / capacidad) * 100).toFixed(2), p.id_parqueadero]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  return resumen();
}

module.exports = { resumen, cambiarCapacidad };
