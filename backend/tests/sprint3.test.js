// Casos de integración del Sprint 3. Requiere MySQL y el backend/.env configurado.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const app = require('../src/app');
const db = require('../src/config/db');
const usuarios = require('../src/services/usuarios');
const parqueadero = require('../src/services/parqueadero');

let server, base, token, adminToken, idUsuario, idEstudiante, idMotocicleta, idIngreso;
const runId = randomBytes(4).toString('hex').toUpperCase();
const carne = `S3${runId}`;
const placa = `T${runId.slice(0, 7)}`;
const nombreUsuario = `s3_${runId}_guarda`;
const nombreAdmin = `s3_${runId}_admin`;
const CLAVE = 'ClaveSegura2026';

async function api(metodo, ruta, { body, authToken = token } = {}) {
  const res = await fetch(base + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function limpiar() {
  if (idEstudiante) {
    await db.query(
      `DELETE s FROM salidas s JOIN ingresos i ON i.id_ingreso = s.id_ingreso
        WHERE i.id_estudiante = ?`, [idEstudiante]);
    await db.query('DELETE FROM ingresos WHERE id_estudiante = ?', [idEstudiante]);
    await db.query('DELETE FROM estudiante_motocicleta WHERE id_estudiante = ?', [idEstudiante]);
  }
  if (idUsuario) await db.query('DELETE FROM novedades WHERE id_usuario = ?', [idUsuario]);
  await db.query('DELETE FROM motocicletas WHERE placa = ?', [placa]);
  await db.query('DELETE FROM estudiantes WHERE numero_carne = ?', [carne]);
  await db.query('DELETE FROM usuarios WHERE usuario IN (?, ?)', [nombreUsuario, nombreAdmin]);
  const [[configuracion]] = await db.query(
    'SELECT capacidad_maxima FROM parqueadero ORDER BY id_parqueadero LIMIT 1');
  if (configuracion) await parqueadero.cambiarCapacidad(configuracion.capacidad_maxima);
}

before(async () => {
  await usuarios.crear({
    nombre_completo: 'Guarda Sprint Tres', usuario: nombreUsuario,
    contrasena: CLAVE, rol: 'Guarda',
  });
  [[{ id_usuario: idUsuario }]] = await db.query(
    'SELECT id_usuario FROM usuarios WHERE usuario = ?', [nombreUsuario]);
  await usuarios.crear({
    nombre_completo: 'Administrador Sprint Tres', usuario: nombreAdmin,
    contrasena: CLAVE, rol: 'Administrador',
  });
  const [estudiante] = await db.query(
    `INSERT INTO estudiantes
       (numero_carne, nombre_completo, documento_identidad, programa_academico,
        correo_institucional, estado_autorizacion)
     VALUES (?, 'Integrante Sprint Tres', '1234567890', 'Ingeniería de Sistemas',
        'sprint3@uniajc.edu.co', 'AUTORIZADO')`, [carne]);
  idEstudiante = estudiante.insertId;
  const [motocicleta] = await db.query(
    `INSERT INTO motocicletas (placa, tipo, marca, modelo, color)
     VALUES (?, 'Motocicleta', 'Yamaha', '2025', 'Rojo')`, [placa]);
  idMotocicleta = motocicleta.insertId;
  await db.query(
    `INSERT INTO estudiante_motocicleta (id_estudiante, id_motocicleta, fecha_inicio)
     VALUES (?, ?, CURRENT_DATE)`, [idEstudiante, idMotocicleta]);
  const [ingreso] = await db.query(
    'INSERT INTO ingresos (id_estudiante, id_motocicleta, id_usuario) VALUES (?, ?, ?)',
    [idEstudiante, idMotocicleta, idUsuario]);
  idIngreso = ingreso.insertId;

  await new Promise((ok) => { server = app.listen(0, ok); });
  base = `http://127.0.0.1:${server.address().port}`;
  const login = await api('POST', '/api/auth/login', {
    body: { usuario: nombreUsuario, contrasena: CLAVE },
  });
  assert.equal(login.status, 200);
  token = login.data.token;
  const loginAdmin = await api('POST', '/api/auth/login', {
    body: { usuario: nombreAdmin, contrasena: CLAVE },
  });
  assert.equal(loginAdmin.status, 200);
  adminToken = loginAdmin.data.token;
});

after(async () => {
  await limpiar();
  await db.end();
  if (server) await new Promise((ok) => server.close(ok));
});

test('CP-17 Registra salida, calcula permanencia y permite nuevo ingreso', async () => {
  const sinId = await api('POST', '/api/salidas', { body: {} });
  assert.equal(sinId.status, 400);
  const inexistente = await api('POST', '/api/salidas', { body: { id_ingreso: 999999999 } });
  assert.equal(inexistente.status, 404);

  for (const consulta of [carne, placa]) {
    const encontrado = await api('GET', `/api/ingresos/activos?consulta=${encodeURIComponent(consulta)}`);
    assert.ok(encontrado.data.some((item) => item.id_ingreso === idIngreso));
  }
  const ocupacionAntes = await api('GET', '/api/parqueadero');
  assert.equal(ocupacionAntes.status, 200);

  const salida = await api('POST', '/api/salidas', { body: { id_ingreso: idIngreso } });
  assert.equal(salida.status, 201);
  assert.equal(salida.data.id_ingreso, idIngreso);
  assert.equal(salida.data.numero_carne, carne);
  assert.ok(Number(salida.data.tiempo_permanencia) >= 0);

  const ocupacionSalida = await api('GET', '/api/parqueadero');
  assert.equal(ocupacionSalida.data.espacios_ocupados, ocupacionAntes.data.espacios_ocupados - 1);
  const activosDespues = await api('GET', `/api/ingresos/activos?consulta=${encodeURIComponent(placa)}`);
  assert.equal(activosDespues.data.some((item) => item.id_ingreso === idIngreso), false);

  const repetida = await api('POST', '/api/salidas', { body: { id_ingreso: idIngreso } });
  assert.equal(repetida.status, 409);

  const ingresos = await api('POST', '/api/ingresos', {
    body: { numero_carne: carne, id_motocicleta: idMotocicleta },
  });
  assert.equal(ingresos.status, 201);

  const historialMoto = await api('GET', `/api/motocicletas/${placa}/historial`);
  assert.ok(historialMoto.data.movimientos.some((item) => item.id_ingreso === idIngreso
    && item.fecha_hora_salida));
  const historialCarne = await api('GET', `/api/integrantes/${carne}/historial`);
  const movimientoCerrado = historialCarne.data.asociaciones
    .flatMap((asociacion) => asociacion.ingresos)
    .find((item) => item.id_ingreso === idIngreso);
  assert.ok(movimientoCerrado.fecha_hora_salida);

  const resumenActual = await api('GET', '/api/parqueadero');
  const capacidadLlena = await api('PUT', '/api/parqueadero/capacidad', {
    authToken: adminToken,
    body: { capacidad_maxima: resumenActual.data.espacios_ocupados },
  });
  try {
    assert.equal(capacidadLlena.status, 200);
    const ingresoConParqueaderoLleno = await api('POST', '/api/ingresos', {
      body: { numero_carne: carne, id_motocicleta: idMotocicleta },
    });
    assert.equal(ingresoConParqueaderoLleno.status, 409);
    assert.match(ingresoConParqueaderoLleno.data.mensaje, /capacidad máxima alcanzada/);
  } finally {
    const capacidadRestaurada = await api('PUT', '/api/parqueadero/capacidad', {
      authToken: adminToken,
      body: { capacidad_maxima: resumenActual.data.capacidad_maxima },
    });
    assert.equal(capacidadRestaurada.status, 200);
  }
  const recientes = await api('GET', '/api/salidas');
  assert.ok(recientes.data.some((item) => item.id_salida === salida.data.id_salida));
});

test('CP-18 Rechaza novedades inválidas y registra carné, placa y usuario', async () => {
  const vacia = await api('POST', '/api/novedades', { body: { descripcion: '   ' } });
  assert.equal(vacia.status, 400);

  const carneDesconocido = await api('POST', '/api/novedades', {
    body: { numero_carne: `${carne}X`, descripcion: 'Reporte de prueba' },
  });
  assert.equal(carneDesconocido.status, 404);
  const placaDesconocida = await api('POST', '/api/novedades', {
    body: { placa: `${placa}X`, descripcion: 'Reporte de prueba' },
  });
  assert.equal(placaDesconocida.status, 404);

  const creada = await api('POST', '/api/novedades', {
    body: { numero_carne: carne.toLowerCase(), placa: placa.toLowerCase(), descripcion: 'Prueba de novedad Sprint 3' },
  });
  assert.equal(creada.status, 201);
  assert.equal(creada.data.numero_carne, carne);
  assert.equal(creada.data.placa, placa);
  assert.equal(creada.data.usuario, 'Guarda Sprint Tres');

  const listado = await api('GET', '/api/novedades');
  assert.ok(listado.data.some((item) => item.id_novedad === creada.data.id_novedad));
});

test('CP-19 Rutas de salida y novedades requieren autenticación', async () => {
  token = '';
  assert.equal((await api('GET', '/api/salidas')).status, 401);
  assert.equal((await api('GET', '/api/novedades')).status, 401);
  token = (await api('POST', '/api/auth/login', {
    body: { usuario: nombreUsuario, contrasena: CLAVE },
  })).data.token;
});

test('CP-20 El Administrador consulta reportes, filtros y movimientos', async () => {
  const reporte = await api('GET', '/api/reportes', { authToken: adminToken });
  assert.equal(reporte.status, 200);
  assert.ok(reporte.data.resumen.ingresos >= 1);
  assert.ok(reporte.data.resumen.salidas >= 1);
  assert.ok(reporte.data.movimientos.some((movimiento) => movimiento.placa === placa));

  const filtrado = await api('GET', '/api/reportes?desde=2026-11-17&hasta=2026-11-16', {
    authToken: adminToken,
  });
  assert.equal(filtrado.status, 400);
  const soloGuarda = await api('GET', '/api/reportes', { authToken: token });
  assert.equal(soloGuarda.status, 403);
});
