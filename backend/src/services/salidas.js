const db = require('../config/db');
const { ErrorNegocio } = require('./usuarios');
const parqueadero = require('./parqueadero');

async function recientes() {
  const [rows] = await db.query(
    `SELECT s.id_salida, s.id_ingreso, s.fecha_hora_salida, s.tiempo_permanencia,
            i.fecha_hora_ingreso, e.numero_carne, e.nombre_completo, m.placa,
            u.nombre_completo AS guarda
       FROM salidas s
       JOIN ingresos i ON i.id_ingreso = s.id_ingreso
       JOIN estudiantes e ON e.id_estudiante = i.id_estudiante
       JOIN motocicletas m ON m.id_motocicleta = i.id_motocicleta
       JOIN usuarios u ON u.id_usuario = s.id_usuario
      ORDER BY s.fecha_hora_salida DESC
      LIMIT 100`);
  return rows;
}

async function registrar(idIngreso, idUsuario) {
  const ingresoId = typeof idIngreso === 'number'
    ? idIngreso
    : typeof idIngreso === 'string' && /^\d+$/.test(idIngreso.trim())
      ? Number(idIngreso)
      : NaN;
  if (!Number.isInteger(ingresoId) || ingresoId <= 0)
    throw new ErrorNegocio(400, 'Seleccione un ingreso válido');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[configuracion]] = await conn.query(
      `SELECT id_parqueadero, capacidad_maxima FROM parqueadero
        ORDER BY id_parqueadero LIMIT 1 FOR UPDATE`);
    if (!configuracion) throw new ErrorNegocio(404, 'No hay parqueadero configurado');
    const [[ingreso]] = await conn.query(
      `SELECT id_ingreso, fecha_hora_ingreso, estado_movimiento
         FROM ingresos WHERE id_ingreso = ? FOR UPDATE`, [ingresoId]);
    if (!ingreso) throw new ErrorNegocio(404, 'Ingreso no encontrado');
    if (ingreso.estado_movimiento !== 'activo')
      throw new ErrorNegocio(409, 'El ingreso ya está cerrado');

    await conn.query(
      `UPDATE ingresos SET estado_movimiento = 'cerrado' WHERE id_ingreso = ?`,
      [ingresoId]);
    await conn.query(
      `INSERT INTO salidas (id_ingreso, id_usuario, tiempo_permanencia)
       VALUES (?, ?, GREATEST(TIMESTAMPDIFF(MINUTE, ?, NOW()), 0))`,
      [ingresoId, idUsuario, ingreso.fecha_hora_ingreso]);
    await parqueadero.sincronizarEspacios(
      conn, configuracion.id_parqueadero, configuracion.capacidad_maxima);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') throw new ErrorNegocio(409, 'Este ingreso ya tiene una salida registrada');
    throw e;
  } finally {
    conn.release();
  }

  const [[salida]] = await db.query(
    `SELECT s.id_salida, s.id_ingreso, s.fecha_hora_salida, s.tiempo_permanencia,
            i.fecha_hora_ingreso, e.numero_carne, e.nombre_completo, m.placa,
            u.nombre_completo AS guarda
       FROM salidas s
       JOIN ingresos i ON i.id_ingreso = s.id_ingreso
       JOIN estudiantes e ON e.id_estudiante = i.id_estudiante
       JOIN motocicletas m ON m.id_motocicleta = i.id_motocicleta
       JOIN usuarios u ON u.id_usuario = s.id_usuario
      WHERE s.id_ingreso = ?`, [ingresoId]);
  return salida;
}

module.exports = { recientes, registrar };
