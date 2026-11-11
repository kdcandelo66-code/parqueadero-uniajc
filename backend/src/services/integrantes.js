const db = require('../config/db');
const { ErrorNegocio } = require('./usuarios');

const ESTADOS_AUTORIZACION = ['AUTORIZADO', 'NO AUTORIZADO'];

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarIntegrante(datos) {
  const integrante = {
    numero_carne: texto(datos.numero_carne).toUpperCase(),
    nombre_completo: texto(datos.nombre_completo),
    documento_identidad: texto(datos.documento_identidad),
    programa_academico: texto(datos.programa_academico),
    correo_institucional: texto(datos.correo_institucional).toLowerCase(),
    telefono: texto(datos.telefono) || null,
  };

  if (!/^[A-Z0-9][A-Z0-9.-]{1,29}$/.test(integrante.numero_carne))
    throw new ErrorNegocio(400, 'El número de carné es obligatorio y solo admite letras, números, punto y guion');
  if (integrante.nombre_completo.length < 3 || integrante.nombre_completo.length > 120)
    throw new ErrorNegocio(400, 'El nombre completo debe tener entre 3 y 120 caracteres');
  if (!/^[A-Za-z0-9.-]{5,30}$/.test(integrante.documento_identidad))
    throw new ErrorNegocio(400, 'El documento de identidad debe tener entre 5 y 30 caracteres válidos');
  if (!integrante.programa_academico || integrante.programa_academico.length > 100)
    throw new ErrorNegocio(400, 'El programa académico es obligatorio (máximo 100 caracteres)');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(integrante.correo_institucional) || integrante.correo_institucional.length > 120)
    throw new ErrorNegocio(400, 'Ingrese un correo institucional válido');
  if (integrante.telefono && integrante.telefono.length > 20)
    throw new ErrorNegocio(400, 'El teléfono no puede superar 20 caracteres');
  return integrante;
}

function validarMotocicleta(datos) {
  const moto = {
    placa: texto(datos.placa).toUpperCase(),
    tipo: texto(datos.tipo),
    marca: texto(datos.marca),
    modelo: texto(datos.modelo),
    color: texto(datos.color),
  };
  if (!/^[A-Z0-9-]{5,10}$/.test(moto.placa))
    throw new ErrorNegocio(400, 'La placa debe tener entre 5 y 10 caracteres alfanuméricos');
  for (const [campo, maximo] of [['tipo', 30], ['marca', 40], ['modelo', 20], ['color', 30]]) {
    if (!moto[campo] || moto[campo].length > maximo)
      throw new ErrorNegocio(400, `El campo ${campo} es obligatorio (máximo ${maximo} caracteres)`);
  }
  return moto;
}

async function listar() {
  const [rows] = await db.query(
    `SELECT id_estudiante, numero_carne, nombre_completo, documento_identidad,
            programa_academico, correo_institucional, telefono,
            estado_autorizacion, motivo_bloqueo, estado
       FROM estudiantes ORDER BY nombre_completo`);
  return rows;
}

async function obtenerPorCarne(numeroCarne) {
  const carne = texto(numeroCarne).toUpperCase();
  const [[integrante]] = await db.query(
    `SELECT id_estudiante, numero_carne, nombre_completo, documento_identidad,
            programa_academico, correo_institucional, telefono,
            estado_autorizacion, motivo_bloqueo, estado
       FROM estudiantes WHERE numero_carne = ?`, [carne]);
  if (!integrante) throw new ErrorNegocio(404, 'Integrante no encontrado');

  const [motocicletas] = await db.query(
    `SELECT m.id_motocicleta, m.placa, m.tipo, m.marca, m.modelo, m.color
       FROM estudiante_motocicleta em
       JOIN motocicletas m ON m.id_motocicleta = em.id_motocicleta
      WHERE em.id_estudiante = ? AND em.fecha_fin IS NULL AND m.estado = 'activa'
      ORDER BY m.placa`, [integrante.id_estudiante]);
  return { ...integrante, motocicletas };
}

async function crear(datos) {
  const integrante = validarIntegrante(datos);
  try {
    const [r] = await db.query(
      `INSERT INTO estudiantes
         (numero_carne, nombre_completo, documento_identidad, programa_academico,
          correo_institucional, telefono, estado_autorizacion, motivo_bloqueo)
       VALUES (?, ?, ?, ?, ?, ?, 'NO AUTORIZADO', 'Pendiente de autorización')`,
      [integrante.numero_carne, integrante.nombre_completo, integrante.documento_identidad,
        integrante.programa_academico, integrante.correo_institucional, integrante.telefono]);
    return obtenerPorCarne(integrante.numero_carne);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') throw new ErrorNegocio(409, 'El número de carné ya está registrado');
    throw e;
  }
}

async function actualizarAutorizacion(numeroCarne, datos) {
  const estado = texto(datos.estado_autorizacion);
  let motivo = texto(datos.motivo_bloqueo);
  if (!ESTADOS_AUTORIZACION.includes(estado))
    throw new ErrorNegocio(400, 'El estado debe ser AUTORIZADO o NO AUTORIZADO');
  if (estado === 'NO AUTORIZADO' && !motivo) motivo = 'Pendiente de autorización';
  if (motivo.length > 300)
    throw new ErrorNegocio(400, 'El motivo de bloqueo no puede superar 300 caracteres');
  if (estado === 'AUTORIZADO') motivo = '';

  const [[integrante]] = await db.query(
    `SELECT id_estudiante FROM estudiantes WHERE numero_carne = ?`,
    [texto(numeroCarne).toUpperCase()]);
  if (!integrante) throw new ErrorNegocio(404, 'Integrante no encontrado');
  await db.query(
    `UPDATE estudiantes SET estado_autorizacion = ?, motivo_bloqueo = ?
      WHERE numero_carne = ?`,
    [estado, motivo || null, texto(numeroCarne).toUpperCase()]);
  return obtenerPorCarne(numeroCarne);
}

async function registrarMotocicleta(datos) {
  const moto = validarMotocicleta(datos);
  const carne = texto(datos.numero_carne).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9.-]{1,29}$/.test(carne))
    throw new ErrorNegocio(400, 'El número de carné no es válido');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[integrante]] = await conn.query(
      `SELECT id_estudiante FROM estudiantes WHERE numero_carne = ? AND estado = 'activo' FOR UPDATE`,
      [carne]);
    if (!integrante) throw new ErrorNegocio(404, 'Integrante activo no encontrado');
    const [resultado] = await conn.query(
      `INSERT INTO motocicletas (placa, tipo, marca, modelo, color) VALUES (?, ?, ?, ?, ?)`,
      [moto.placa, moto.tipo, moto.marca, moto.modelo, moto.color]);
    await conn.query(
      `INSERT INTO estudiante_motocicleta (id_estudiante, id_motocicleta, fecha_inicio)
       VALUES (?, ?, CURRENT_DATE)`, [integrante.id_estudiante, resultado.insertId]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') throw new ErrorNegocio(409, 'La placa ya está registrada o asociada');
    throw e;
  } finally {
    conn.release();
  }
  return obtenerPorCarne(carne);
}

async function historial(numeroCarne) {
  const integrante = await obtenerPorCarne(numeroCarne);
  const [asociaciones] = await db.query(
    `SELECT em.id, em.fecha_inicio, em.fecha_fin,
            m.id_motocicleta, m.placa, m.tipo, m.marca, m.modelo, m.color
       FROM estudiante_motocicleta em
       JOIN motocicletas m ON m.id_motocicleta = em.id_motocicleta
      WHERE em.id_estudiante = ?
      ORDER BY em.fecha_inicio DESC, em.id DESC`, [integrante.id_estudiante]);
  const [ingresos] = await db.query(
    `SELECT em.id AS id_asociacion, i.id_ingreso, i.id_motocicleta,
            i.fecha_hora_ingreso, i.estado_movimiento,
            u.nombre_completo AS guarda
       FROM ingresos i
       JOIN estudiante_motocicleta em
         ON em.id_estudiante = i.id_estudiante
        AND em.id_motocicleta = i.id_motocicleta
        AND DATE(i.fecha_hora_ingreso) >= em.fecha_inicio
        AND (em.fecha_fin IS NULL OR DATE(i.fecha_hora_ingreso) <= em.fecha_fin)
       JOIN usuarios u ON u.id_usuario = i.id_usuario
      WHERE i.id_estudiante = ?
      ORDER BY i.fecha_hora_ingreso DESC`, [integrante.id_estudiante]);
  return {
    integrante,
    asociaciones: asociaciones.map((asociacion) => ({
      ...asociacion,
      ingresos: ingresos.filter((ingreso) => ingreso.id_asociacion === asociacion.id),
    })),
  };
}

module.exports = {
  listar, crear, obtenerPorCarne, actualizarAutorizacion, registrarMotocicleta, historial,
};
