// Casos de integración del Sprint 2. Requiere el esquema actualizado y backend/.env configurado.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const app = require('../src/app');
const db = require('../src/config/db');
const usuarios = require('../src/services/usuarios');
const integrantes = require('../src/services/integrantes');
const parqueadero = require('../src/services/parqueadero');

let server, base, adminToken, guardaToken, idIntegrante, idIngreso, idGuarda, capacidadOriginal;
const runId = randomBytes(4).toString('hex').toUpperCase();
const carne = `S2${runId}`;
const placa = `S${runId.slice(0, 7)}`;
const placaCapacidad = `C${runId.slice(0, 7)}`;
const placaOcupadaPrefijo = `D${runId.slice(0, 4)}`;
const usuarioAdmin = `s2_${runId}_admin`;
const usuarioGuarda = `s2_${runId}_guarda`;
const CLAVE = 'ClaveSegura2026';

async function api(metodo, ruta, { token, body } = {}) {
  const res = await fetch(base + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function limpiar() {
  if (idIntegrante) {
    await db.query(
      `DELETE s FROM salidas s JOIN ingresos i ON i.id_ingreso = s.id_ingreso
        WHERE i.id_estudiante = ?`, [idIntegrante]);
    await db.query('DELETE FROM ingresos WHERE id_estudiante = ?', [idIntegrante]);
    await db.query('DELETE FROM estudiante_motocicleta WHERE id_estudiante = ?', [idIntegrante]);
  }
  await db.query(
    'DELETE FROM motocicletas WHERE placa IN (?, ?) OR placa LIKE ?',
    [placa, placaCapacidad, `${placaOcupadaPrefijo}%`]);
  await db.query('DELETE FROM estudiantes WHERE numero_carne = ?', [carne]);
  await db.query('DELETE FROM usuarios WHERE usuario IN (?, ?)', [usuarioAdmin, usuarioGuarda]);
  if (capacidadOriginal) await parqueadero.cambiarCapacidad(capacidadOriginal);
}

before(async () => {
  capacidadOriginal = (await parqueadero.resumen()).capacidad_maxima;
  await usuarios.crear({ nombre_completo: 'Admin Sprint Dos', usuario: usuarioAdmin, contrasena: CLAVE, rol: 'Administrador' });
  const guarda = await usuarios.crear({ nombre_completo: 'Guarda Sprint Dos', usuario: usuarioGuarda, contrasena: CLAVE, rol: 'Guarda' });
  idGuarda = guarda.id_usuario;
  await new Promise((ok) => { server = app.listen(0, ok); });
  base = `http://127.0.0.1:${server.address().port}`;
  adminToken = (await api('POST', '/api/auth/login', { body: { usuario: usuarioAdmin, contrasena: CLAVE } })).data.token;
  guardaToken = (await api('POST', '/api/auth/login', { body: { usuario: usuarioGuarda, contrasena: CLAVE } })).data.token;
});

after(async () => {
  await limpiar();
  await db.end();
  if (server) await new Promise((ok) => server.close(ok));
});

test('CP-13 Registra integrantes con datos requeridos y rechaza carné duplicado', async () => {
  const incompleto = await api('POST', '/api/integrantes', {
    token: adminToken, body: { numero_carne: carne },
  });
  assert.equal(incompleto.status, 400);

  const datos = {
    numero_carne: carne, nombre_completo: 'Integrante Sprint Dos',
    documento_identidad: '1234567890', programa_academico: 'Ingeniería de Sistemas',
    correo_institucional: 'sprint2@uniajc.edu.co', telefono: '',
  };
  const creado = await api('POST', '/api/integrantes', { token: adminToken, body: datos });
  assert.equal(creado.status, 201);
  assert.equal(creado.data.estado_autorizacion, 'NO AUTORIZADO');
  assert.equal(creado.data.motivo_bloqueo, 'Pendiente de autorización');
  idIntegrante = creado.data.id_estudiante;

  const repetido = await api('POST', '/api/integrantes', { token: adminToken, body: datos });
  assert.equal(repetido.status, 409);
  assert.match(repetido.data.mensaje, /El número de carné ya está registrado/);
});

test('CP-14 Registra motocicleta asociada y rechaza placa duplicada', async () => {
  const datos = {
    numero_carne: carne, placa, tipo: 'Motocicleta', marca: 'Honda',
    modelo: '2025', color: 'Negro', estado: 'activa',
  };
  const estadoInvalido = await api('POST', '/api/motocicletas', {
    token: adminToken, body: { ...datos, estado: 'en reparación' },
  });
  assert.equal(estadoInvalido.status, 400);

  const creada = await api('POST', '/api/motocicletas', { token: adminToken, body: datos });
  assert.equal(creada.status, 201);
  assert.equal(creada.data.motocicletas[0].placa, placa);
  assert.equal(creada.data.motocicletas[0].estado_motocicleta, 'activa');

  const repetida = await api('POST', '/api/motocicletas', {
    token: adminToken, body: datos,
  });
  assert.equal(repetida.status, 409);
  assert.match(repetida.data.mensaje, /placa ya está registrada/);
});

test('CP-15 HU-09 Consulta por carné y muestra autorización y motocicleta asociada', async () => {
  const consulta = await api('GET', `/api/integrantes/${carne}`, { token: guardaToken });
  assert.equal(consulta.status, 200);
  assert.equal(consulta.data.numero_carne, carne);
  assert.equal(consulta.data.estado_autorizacion, 'NO AUTORIZADO');
  assert.equal(consulta.data.motivo_bloqueo, 'Pendiente de autorización');
  assert.equal(consulta.data.motocicletas[0].placa, placa);
});

test('CP-16 HU-11 Autoriza y registra un ingreso activo', async () => {
  const integrante = await integrantes.actualizarAutorizacion(carne, { estado_autorizacion: 'AUTORIZADO' });
  const idMoto = integrante.motocicletas[0].id_motocicleta;
  const ingreso = await api('POST', '/api/ingresos', {
    token: guardaToken, body: { numero_carne: carne, id_motocicleta: idMoto },
  });
  assert.equal(ingreso.status, 201);
  assert.equal(ingreso.data.numero_carne, carne);
  assert.equal(ingreso.data.estado_movimiento, 'activo');
  idIngreso = ingreso.data.id_ingreso;

  const repetido = await api('POST', '/api/ingresos', {
    token: guardaToken, body: { numero_carne: carne, id_motocicleta: idMoto },
  });
  assert.equal(repetido.status, 409);

  const activos = await api('GET', '/api/ingresos/activos', { token: guardaToken });
  assert.ok(activos.data.some((i) => i.id_ingreso === ingreso.data.id_ingreso));
});

test('CP-17 HU-08 Consulta el historial asociado al integrante y su motocicleta', async () => {
  const consulta = await api('GET', `/api/integrantes/${carne}`, { token: guardaToken });
  assert.equal(consulta.status, 200);
  assert.ok(consulta.data.motocicletas[0].ultimo_ingreso);

  const historial = await api('GET', `/api/integrantes/${carne}/historial`, { token: guardaToken });
  assert.equal(historial.status, 200);
  assert.equal(historial.data.integrante.numero_carne, carne);
  assert.ok(historial.data.asociaciones.some((asociacion) =>
    asociacion.placa === placa && asociacion.ingresos.some((i) =>
      i.id_ingreso === idIngreso && i.estado_movimiento === 'activo')));
});

test('CP-18 HU-10 Rechaza ingresos no autorizados y al alcanzar la capacidad máxima', async () => {
  const creada = await api('POST', '/api/motocicletas', {
    token: adminToken,
    body: {
      numero_carne: carne, placa: placaCapacidad, tipo: 'Motocicleta',
      marca: 'Yamaha', modelo: '2025', color: 'Azul', estado: 'activa',
    },
  });
  assert.equal(creada.status, 201);
  const idMotoLibre = creada.data.motocicletas.find((m) => m.placa === placaCapacidad).id_motocicleta;

  await integrantes.actualizarAutorizacion(carne, {
    estado_autorizacion: 'NO AUTORIZADO', motivo_bloqueo: 'Documentación pendiente',
  });
  const noAutorizado = await api('POST', '/api/ingresos', {
    token: guardaToken, body: { numero_carne: carne, id_motocicleta: idMotoLibre },
  });
  assert.equal(noAutorizado.status, 403);
  assert.match(noAutorizado.data.mensaje, /Documentación pendiente/);

  await integrantes.actualizarAutorizacion(carne, { estado_autorizacion: 'AUTORIZADO' });
  const resumenOriginal = await api('GET', '/api/parqueadero', { token: adminToken });
  assert.equal(resumenOriginal.status, 200);
  assert.equal(resumenOriginal.data.capacidad_maxima, 400);
  assert.ok(resumenOriginal.data.espacios_ocupados < 400);

  const faltantes = 400 - resumenOriginal.data.espacios_ocupados;
  const placasOcupadas = Array.from({ length: faltantes }, (_, indice) =>
    `${placaOcupadaPrefijo}${indice.toString(16).padStart(3, '0')}`);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const valoresMotos = placasOcupadas.flatMap((placaOcupada) =>
      [placaOcupada, 'Motocicleta', 'Yamaha', '2025', 'Gris', 'activa']);
    await conn.query(
      `INSERT INTO motocicletas (placa, tipo, marca, modelo, color, estado)
       VALUES ${placasOcupadas.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}`,
      valoresMotos);
    const [motocicletas] = await conn.query(
      'SELECT id_motocicleta FROM motocicletas WHERE placa LIKE ?',
      [`${placaOcupadaPrefijo}%`]);
    assert.equal(motocicletas.length, faltantes);
    await conn.query(
      `INSERT INTO estudiante_motocicleta (id_estudiante, id_motocicleta, fecha_inicio)
       VALUES ${motocicletas.map(() => '(?, ?, CURRENT_DATE)').join(', ')}`,
      motocicletas.flatMap((moto) => [idIntegrante, moto.id_motocicleta]));
    await conn.query(
      `INSERT INTO ingresos (id_estudiante, id_motocicleta, id_usuario)
       VALUES ${motocicletas.map(() => '(?, ?, ?)').join(', ')}`,
      motocicletas.flatMap((moto) => [idIntegrante, moto.id_motocicleta, idGuarda]));
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
  await parqueadero.cambiarCapacidad(400);

  const lleno = await api('GET', '/api/parqueadero', { token: adminToken });
  assert.equal(lleno.data.capacidad_maxima, 400);
  assert.equal(lleno.data.espacios_ocupados, 400);
  assert.equal(lleno.data.espacios_disponibles, 0);
  const rechazo = await api('POST', '/api/ingresos', {
    token: guardaToken, body: { numero_carne: carne, id_motocicleta: idMotoLibre },
  });
  assert.equal(rechazo.status, 409);
  assert.match(rechazo.data.mensaje, /capacidad máxima alcanzada/);
  const resumenDespues = await api('GET', '/api/parqueadero', { token: adminToken });
  assert.equal(resumenDespues.data.capacidad_maxima, 400);
  assert.equal(resumenDespues.data.espacios_ocupados, 400);
  assert.equal(resumenDespues.data.espacios_disponibles, 0);
});
