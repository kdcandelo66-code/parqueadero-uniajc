const db = require('../config/db');
const { ErrorNegocio } = require('./usuarios');

async function activos() {
  const [rows] = await db.query(
    `SELECT i.id_ingreso, i.fecha_hora_ingreso, e.numero_carne, e.nombre_completo,
            m.placa, u.nombre_completo AS guarda
       FROM ingresos i
       JOIN estudiantes e ON e.id_estudiante = i.id_estudiante
       JOIN motocicletas m ON m.id_motocicleta = i.id_motocicleta
       JOIN usuarios u ON u.id_usuario = i.id_usuario
      WHERE i.estado_movimiento = 'activo'
      ORDER BY i.fecha_hora_ingreso DESC`);
  return rows;
}

async function registrar({ numero_carne, id_motocicleta, id_usuario }) {
  const carne = typeof numero_carne === 'string' ? numero_carne.trim().toUpperCase() : '';
  const idMoto = Number(id_motocicleta);
  if (!carne) throw new ErrorNegocio(400, 'El número de carné es obligatorio');
  if (!Number.isInteger(idMoto) || idMoto <= 0)
    throw new ErrorNegocio(400, 'Seleccione una motocicleta válida');

  const conn = await db.getConnection();
  let ingresoId;
  try {
    await conn.beginTransaction();
    const [[parqueadero]] = await conn.query(
      `SELECT id_parqueadero, capacidad_maxima FROM parqueadero
        ORDER BY id_parqueadero LIMIT 1 FOR UPDATE`);
    if (!parqueadero) throw new ErrorNegocio(404, 'No hay parqueadero configurado');

    const [[integrante]] = await conn.query(
      `SELECT e.id_estudiante, e.estado_autorizacion, e.motivo_bloqueo,
              m.id_motocicleta
         FROM estudiantes e
         JOIN estudiante_motocicleta em ON em.id_estudiante = e.id_estudiante
         JOIN motocicletas m ON m.id_motocicleta = em.id_motocicleta
        WHERE e.numero_carne = ? AND e.estado = 'activo'
          AND em.fecha_fin IS NULL AND m.estado = 'activa'
          AND m.id_motocicleta = ?
        FOR UPDATE`, [carne, idMoto]);
    if (!integrante) throw new ErrorNegocio(404, 'La motocicleta no está asociada a un integrante activo');
    if (integrante.estado_autorizacion !== 'AUTORIZADO')
      throw new ErrorNegocio(403, `Integrante NO AUTORIZADO: ${integrante.motivo_bloqueo || 'sin motivo especificado'}`);

    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM ingresos WHERE estado_movimiento = 'activo'`);
    if (Number(total) >= parqueadero.capacidad_maxima)
      throw new ErrorNegocio(409, 'El parqueadero está lleno');

    const [resultado] = await conn.query(
      `INSERT INTO ingresos (id_estudiante, id_motocicleta, id_usuario)
       VALUES (?, ?, ?)`, [integrante.id_estudiante, idMoto, id_usuario]);
    ingresoId = resultado.insertId;
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') throw new ErrorNegocio(409, 'La motocicleta ya tiene un ingreso activo');
    throw e;
  } finally {
    conn.release();
  }

  const [[ingreso]] = await db.query(
    `SELECT i.id_ingreso, i.fecha_hora_ingreso, i.estado_movimiento,
            e.numero_carne, e.nombre_completo, m.placa
       FROM ingresos i
       JOIN estudiantes e ON e.id_estudiante = i.id_estudiante
       JOIN motocicletas m ON m.id_motocicleta = i.id_motocicleta
      WHERE i.id_ingreso = ?`, [ingresoId]);
  return ingreso;
}

module.exports = { activos, registrar };
