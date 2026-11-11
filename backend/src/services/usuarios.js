// T8: gestión de usuarios autorizados (HU-03, HU-04)
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const ROLES = ['Administrador', 'Guarda'];
const COSTO_BCRYPT = 10;

class ErrorNegocio extends Error {
  constructor(status, mensaje) { super(mensaje); this.status = status; }
}

function validar({ nombre_completo, usuario, contrasena, rol, estado }, esNuevo) {
  const nombre = nombre_completo === undefined ? undefined : String(nombre_completo).trim();
  const nombreUsuario = usuario === undefined ? undefined : String(usuario).trim();

  if (esNuevo || nombre_completo !== undefined) {
    if (!nombre || nombre.length < 3)
      throw new ErrorNegocio(400, 'El nombre completo es obligatorio (mínimo 3 caracteres)');
  }
  if (esNuevo) {
    if (!nombreUsuario || !/^[a-zA-Z0-9._-]{3,50}$/.test(nombreUsuario))
      throw new ErrorNegocio(400, 'El usuario debe tener entre 3 y 50 caracteres (letras, números, punto, guion)');
  }
  if (esNuevo || contrasena !== undefined) {
    if (!contrasena || String(contrasena).length < 8)
      throw new ErrorNegocio(400, 'La contraseña debe tener al menos 8 caracteres');
  }
  if (esNuevo || rol !== undefined) {
    if (!ROLES.includes(rol)) throw new ErrorNegocio(400, 'El rol debe ser Administrador o Guarda');
  }
  if (estado !== undefined && !['activo', 'inactivo'].includes(estado))
    throw new ErrorNegocio(400, 'El estado debe ser activo o inactivo');

  return { nombre, nombreUsuario };
}

async function listar() {
  const [rows] = await db.query(
    `SELECT u.id_usuario, u.nombre_completo, u.usuario, r.nombre AS rol, u.estado
       FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
      ORDER BY u.nombre_completo`);
  return rows; // nunca se devuelve contrasena_hash
}

async function crear(datos) {
  const { nombre, nombreUsuario } = validar(datos, true);
  const hash = await bcrypt.hash(datos.contrasena, COSTO_BCRYPT);
  try {
    const [r] = await db.query(
      `INSERT INTO usuarios (id_rol, nombre_completo, usuario, contrasena_hash, estado)
       SELECT id_rol, ?, ?, ?, 'activo' FROM roles WHERE nombre = ?`,
      [nombre, nombreUsuario, hash, datos.rol]);
    return { id_usuario: r.insertId, nombre_completo: nombre, usuario: nombreUsuario, rol: datos.rol, estado: 'activo' };
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') throw new ErrorNegocio(409, 'El nombre de usuario ya existe');
    throw e;
  }
}

// Un usuario no se elimina: se cambia a "inactivo" para conservar la trazabilidad
async function actualizar(id, datos) {
  const { nombre } = validar(datos, false);
  const campos = [], valores = [];
  if (datos.nombre_completo !== undefined) { campos.push('nombre_completo = ?'); valores.push(nombre); }
  if (datos.estado !== undefined) { campos.push('estado = ?'); valores.push(datos.estado); }
  if (datos.rol !== undefined) { campos.push('id_rol = (SELECT id_rol FROM roles WHERE nombre = ?)'); valores.push(datos.rol); }
  if (datos.contrasena !== undefined) { campos.push('contrasena_hash = ?'); valores.push(await bcrypt.hash(datos.contrasena, COSTO_BCRYPT)); }
  if (!campos.length) throw new ErrorNegocio(400, 'No hay datos para actualizar');
  const [r] = await db.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id_usuario = ?`, [...valores, id]);
  if (!r.affectedRows) throw new ErrorNegocio(404, 'Usuario no encontrado');
  const [rows] = await db.query(
    `SELECT u.id_usuario, u.nombre_completo, u.usuario, r.nombre AS rol, u.estado
       FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE u.id_usuario = ?`, [id]);
  return rows[0];
}

module.exports = { listar, crear, actualizar, ErrorNegocio, ROLES };
