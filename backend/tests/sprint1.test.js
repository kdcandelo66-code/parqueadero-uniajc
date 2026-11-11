// T13: casos de prueba CP-01 a CP-12 del Sprint 1 (HU-01 a HU-05)
// Requisitos: MySQL con database/schema.sql cargado y backend/.env configurado.
// Ejecutar:  npm test
// Las pruebas crean datos con el prefijo "cp_" / "CP" y los eliminan al terminar.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const app = require('../src/app');
const db = require('../src/config/db');
const usuarios = require('../src/services/usuarios');
const parqueadero = require('../src/services/parqueadero');

let server, base, parqueaderoOriginal;
const CLAVE = 'ClaveSegura2026';
const runId = randomBytes(4).toString('hex').toUpperCase();
const cuenta = {
  admin: `cp_${runId}_admin`,
  guarda: `cp_${runId}_guarda`,
  inactivo: `cp_${runId}_inactivo`,
  inexistente: `cp_${runId}_no_existe`,
};
const carne = (sufijo) => `CP${runId}${sufijo}`;
const placa = (sufijo) => `C${runId.slice(0, 7)}${sufijo}`;
const usuariosPrueba = [cuenta.admin, cuenta.guarda, cuenta.inactivo];
const carnesPrueba = ['09', '10', '11', '12'].map(carne);
const placasPrueba = ['A1', 'A2', 'B1', 'C1'].map(placa);
const placeholders = (valores) => valores.map(() => '?').join(', ');

async function api(metodo, ruta, { token, body } = {}) {
  const res = await fetch(base + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}
const login = (usuario, contrasena = CLAVE) => api('POST', '/api/auth/login', { body: { usuario, contrasena } });

async function limpiar() {
  await db.query(`DELETE s FROM salidas s JOIN ingresos i ON i.id_ingreso = s.id_ingreso
                  JOIN motocicletas m ON m.id_motocicleta = i.id_motocicleta
                  WHERE m.placa IN (${placeholders(placasPrueba)})`, placasPrueba);
  await db.query(`DELETE i FROM ingresos i JOIN motocicletas m ON m.id_motocicleta = i.id_motocicleta
                  WHERE m.placa IN (${placeholders(placasPrueba)})`, placasPrueba);
  await db.query(`DELETE FROM motocicletas WHERE placa IN (${placeholders(placasPrueba)})`, placasPrueba);
  await db.query(`DELETE FROM estudiantes WHERE numero_carne IN (${placeholders(carnesPrueba)})`, carnesPrueba);
  await db.query(`DELETE FROM usuarios WHERE usuario IN (${placeholders(usuariosPrueba)})`, usuariosPrueba);
}

before(async () => {
  [[parqueaderoOriginal]] = await db.query(
    'SELECT id_parqueadero, capacidad_maxima FROM parqueadero ORDER BY id_parqueadero LIMIT 1');
  if (!parqueaderoOriginal) throw new Error('No hay parqueadero configurado para ejecutar las pruebas');
  await usuarios.crear({ nombre_completo: 'Admin de Pruebas', usuario: cuenta.admin, contrasena: CLAVE, rol: 'Administrador' });
  await usuarios.crear({ nombre_completo: 'Guarda de Pruebas', usuario: cuenta.guarda, contrasena: CLAVE, rol: 'Guarda' });
  const inactivo = await usuarios.crear({ nombre_completo: 'Usuario Inactivo', usuario: cuenta.inactivo, contrasena: CLAVE, rol: 'Guarda' });
  await usuarios.actualizar(inactivo.id_usuario, { estado: 'inactivo' });
  await new Promise((ok) => { server = app.listen(0, ok); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await limpiar();
  if (parqueaderoOriginal) await parqueadero.cambiarCapacidad(parqueaderoOriginal.capacidad_maxima);
  await db.end();
  server?.close();
});

test('CP-01 Administrador con credenciales válidas recibe 200 y token con rol Administrador', async () => {
  const r = await login(cuenta.admin);
  assert.equal(r.status, 200);
  assert.ok(r.data.token);
  assert.equal(r.data.rol, 'Administrador');
});

test('CP-02 Contraseña incorrecta: 401 con mensaje genérico', async () => {
  const r = await login(cuenta.admin, 'otraClave123');
  assert.equal(r.status, 401);
  assert.equal(r.data.mensaje, 'Usuario o contraseña no válidos');
  const r2 = await login(cuenta.inexistente);
  assert.equal(r2.data.mensaje, r.data.mensaje, 'el mensaje no debe revelar qué dato falló');
});

test('CP-03 Usuario inactivo no puede iniciar sesión', async () => {
  const r = await login(cuenta.inactivo);
  assert.equal(r.status, 401);
});

test('CP-04 Ruta protegida sin token: 401', async () => {
  assert.equal((await api('GET', '/api/usuarios')).status, 401);
  assert.equal((await api('GET', '/api/parqueadero')).status, 401);
});

test('CP-05 Un Guarda llama a GET /api/usuarios: 403', async () => {
  const { data } = await login(cuenta.guarda);
  const r = await api('GET', '/api/usuarios', { token: data.token });
  assert.equal(r.status, 403);
});

test('CP-06 Crear usuario con nombre existente: 409', async () => {
  const { data } = await login(cuenta.admin);
  const r = await api('POST', '/api/usuarios', {
    token: data.token,
    body: { nombre_completo: 'Duplicado', usuario: cuenta.guarda, contrasena: CLAVE, rol: 'Guarda' },
  });
  assert.equal(r.status, 409);
});

test('CP-07 contrasena_hash es un hash bcrypt y no el texto de la contraseña', async () => {
  const [[u]] = await db.query('SELECT contrasena_hash FROM usuarios WHERE usuario = ?', [cuenta.admin]);
  assert.notEqual(u.contrasena_hash, CLAVE);
  assert.match(u.contrasena_hash, /^\$2[aby]\$10\$.{53}$/);
});

test('CP-08 Capacidad 0 o negativa: 400', async () => {
  const { data } = await login(cuenta.admin);
  for (const valor of [0, -5, 'abc', 2.5]) {
    const r = await api('PUT', '/api/parqueadero/capacidad', { token: data.token, body: { capacidad_maxima: valor } });
    assert.equal(r.status, 400, `valor ${valor}`);
  }
});

test('CP-09 Capacidad menor que los espacios ocupados: 400', async () => {
  const { data } = await login(cuenta.admin);
  const [[g]] = await db.query('SELECT id_usuario FROM usuarios WHERE usuario = ?', [cuenta.guarda]);
  const [e] = await db.query(
    `INSERT INTO estudiantes (numero_carne, nombre_completo, documento_identidad, programa_academico, correo_institucional, estado_autorizacion)
     VALUES (?, 'Estudiante Prueba', '1000000001', 'Ingeniería de Sistemas', 'cp1@estudiante.uniajc.edu.co', 'AUTORIZADO')`,
    [carne('09')]);
  for (const numeroPlaca of ['A1', 'A2'].map(placa)) {
    const [m] = await db.query(
      `INSERT INTO motocicletas (placa, tipo, marca, modelo, color) VALUES (?, 'Motocicleta', 'Marca', '2024', 'Negro')`, [numeroPlaca]);
    await db.query(`INSERT INTO ingresos (id_estudiante, id_motocicleta, id_usuario) VALUES (?, ?, ?)`,
      [e.insertId, m.insertId, g.id_usuario]);
  }
  const resumen = await api('GET', '/api/parqueadero', { token: data.token });
  assert.ok(resumen.data.espacios_ocupados >= 2);
  const r = await api('PUT', '/api/parqueadero/capacidad', {
    token: data.token, body: { capacidad_maxima: resumen.data.espacios_ocupados - 1 },
  });
  assert.equal(r.status, 400);
  const ok = await api('PUT', '/api/parqueadero/capacidad', {
    token: data.token, body: { capacidad_maxima: resumen.data.espacios_ocupados + 10 },
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.espacios_disponibles, 10);
});

// CP-10 a CP-12: reglas de integridad en la base de datos (dentro de una transacción que se revierte)
async function enTransaccion(fn) {
  const conn = await db.getConnection();
  try { await conn.beginTransaction(); await fn(conn); } finally { await conn.rollback(); conn.release(); }
}

test('CP-10 Carné o placa repetidos: la base rechaza el segundo registro', async () => {
  await enTransaccion(async (c) => {
    const est = `INSERT INTO estudiantes (numero_carne, nombre_completo, documento_identidad, programa_academico, correo_institucional)
                 VALUES (?, 'A', '1', 'P', 'a@uniajc.edu.co')`;
    await c.query(est, [carne('10')]);
    await assert.rejects(c.query(est, [carne('10')]), { code: 'ER_DUP_ENTRY' });
    const moto = `INSERT INTO motocicletas (placa, tipo, marca, modelo, color) VALUES (?, 'M', 'M', '2024', 'Rojo')`;
    await c.query(moto, [placa('B1')]);
    await assert.rejects(c.query(moto, [placa('B1')]), { code: 'ER_DUP_ENTRY' });
  });
});

test('CP-11 Dos ingresos activos para la misma motocicleta: la base rechaza el segundo', async () => {
  await enTransaccion(async (c) => {
    const [[g]] = await c.query('SELECT id_usuario FROM usuarios WHERE usuario = ?', [cuenta.guarda]);
    const [e] = await c.query(`INSERT INTO estudiantes (numero_carne, nombre_completo, documento_identidad, programa_academico, correo_institucional)
                               VALUES (?, 'B', '2', 'P', 'b@uniajc.edu.co')`, [carne('11')]);
    const [m] = await c.query(`INSERT INTO motocicletas (placa, tipo, marca, modelo, color) VALUES (?, 'M', 'M', '2024', 'Azul')`, [placa('C1')]);
    const ingreso = [`INSERT INTO ingresos (id_estudiante, id_motocicleta, id_usuario) VALUES (?, ?, ?)`, [e.insertId, m.insertId, g.id_usuario]];
    const [i1] = await c.query(...ingreso);
    await assert.rejects(c.query(...ingreso), { code: 'ER_DUP_ENTRY' });
    // Cerrado el primer ingreso, la misma motocicleta sí puede volver a ingresar
    await c.query(`UPDATE ingresos SET estado_movimiento = 'cerrado' WHERE id_ingreso = ?`, [i1.insertId]);
    await c.query(...ingreso);
  });
});

test('CP-12 Salida con id_ingreso inexistente o repetido: la base la rechaza', async () => {
  await enTransaccion(async (c) => {
    const [[g]] = await c.query('SELECT id_usuario FROM usuarios WHERE usuario = ?', [cuenta.guarda]);
    await assert.rejects(
      c.query(`INSERT INTO salidas (id_ingreso, id_usuario) VALUES (999999999, ?)`, [g.id_usuario]),
      { code: 'ER_NO_REFERENCED_ROW_2' });
    const [e] = await c.query(`INSERT INTO estudiantes (numero_carne, nombre_completo, documento_identidad, programa_academico, correo_institucional)
                               VALUES (?, 'C', '3', 'P', 'c@uniajc.edu.co')`, [carne('12')]);
    const [m] = await c.query(`INSERT INTO motocicletas (placa, tipo, marca, modelo, color) VALUES (?, 'M', 'M', '2024', 'Gris')`, [placa('D1')]);
    const [i] = await c.query(`INSERT INTO ingresos (id_estudiante, id_motocicleta, id_usuario) VALUES (?, ?, ?)`,
      [e.insertId, m.insertId, g.id_usuario]);
    const salida = [`INSERT INTO salidas (id_ingreso, id_usuario) VALUES (?, ?)`, [i.insertId, g.id_usuario]];
    await c.query(...salida);
    await assert.rejects(c.query(...salida), { code: 'ER_DUP_ENTRY' });
  });
});
