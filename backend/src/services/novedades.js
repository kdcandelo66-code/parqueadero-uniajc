const db = require('../config/db');
const { ErrorNegocio } = require('./usuarios');

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

async function listar() {
  const [rows] = await db.query(
    `SELECT n.id_novedad, n.fecha_hora, n.numero_carne, n.placa, n.descripcion,
            u.nombre_completo AS usuario,
            e.nombre_completo AS integrante, m.marca, m.modelo
       FROM novedades n
       JOIN usuarios u ON u.id_usuario = n.id_usuario
       LEFT JOIN estudiantes e ON e.id_estudiante = n.id_estudiante
       LEFT JOIN motocicletas m ON m.id_motocicleta = n.id_motocicleta
      ORDER BY n.fecha_hora DESC, n.id_novedad DESC
      LIMIT 100`);
  return rows;
}

async function crear(datos, idUsuario) {
  const descripcion = texto(datos.descripcion);
  const numeroCarne = texto(datos.numero_carne).toUpperCase();
  const placa = texto(datos.placa).toUpperCase();
  if (!descripcion || descripcion.length > 300)
    throw new ErrorNegocio(400, 'La descripción es obligatoria y no puede superar 300 caracteres');
  if (numeroCarne && numeroCarne.length > 30)
    throw new ErrorNegocio(400, 'El número de carné no puede superar 30 caracteres');
  if (placa && placa.length > 10)
    throw new ErrorNegocio(400, 'La placa no puede superar 10 caracteres');

  let idEstudiante = null;
  let idMotocicleta = null;
  if (numeroCarne) {
    const [[integrante]] = await db.query(
      `SELECT id_estudiante FROM estudiantes WHERE numero_carne = ?`, [numeroCarne]);
    if (!integrante) throw new ErrorNegocio(404, 'No existe un integrante con ese carné');
    idEstudiante = integrante.id_estudiante;
  }
  if (placa) {
    const [[motocicleta]] = await db.query(
      `SELECT id_motocicleta FROM motocicletas WHERE placa = ?`, [placa]);
    if (!motocicleta) throw new ErrorNegocio(404, 'No existe una motocicleta con esa placa');
    idMotocicleta = motocicleta.id_motocicleta;
  }

  const [resultado] = await db.query(
    `INSERT INTO novedades
       (id_usuario, numero_carne, placa, descripcion, id_estudiante, id_motocicleta)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [idUsuario, numeroCarne || null, placa || null, descripcion, idEstudiante, idMotocicleta]);
  const [[novedad]] = await db.query(
    `SELECT n.id_novedad, n.fecha_hora, n.numero_carne, n.placa, n.descripcion,
            u.nombre_completo AS usuario,
            e.nombre_completo AS integrante, m.marca, m.modelo
       FROM novedades n
       JOIN usuarios u ON u.id_usuario = n.id_usuario
       LEFT JOIN estudiantes e ON e.id_estudiante = n.id_estudiante
       LEFT JOIN motocicletas m ON m.id_motocicleta = n.id_motocicleta
      WHERE n.id_novedad = ?`, [resultado.insertId]);
  return novedad;
}

module.exports = { listar, crear };
