// Casos de integración del Sprint 2. Requiere el esquema actualizado y backend/.env configurado.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const app = require('../src/app');
const db = require('../src/config/db');
const usuarios = require('../src/services/usuarios');
const integrantes = require('../src/services/integrantes');

let server, base, adminToken, guardaToken, idIntegrante;
const runId = randomBytes(4).toString('hex').toUpperCase();
const carne = `S2${runId}`;
const placa = `S${runId.slice(0, 7)}`;
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
  await db.query('DELETE FROM motocicletas WHERE placa = ?', [placa]);
  await db.query('DELETE FROM estudiantes WHERE numero_carne = ?', [carne]);
  await db.query('DELETE FROM usuarios WHERE usuario IN (?, ?)', [usuarioAdmin, usuarioGuarda]);
}

before(async () => {
  await usuarios.crear({ nombre_completo: 'Admin Sprint Dos', usuario: usuarioAdmin, contrasena: CLAVE, rol: 'Administrador' });
  await usuarios.crear({ nombre_completo: 'Guarda Sprint Dos', usuario: usuarioGuarda, contrasena: CLAVE, rol: 'Guarda' });
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
});

test('CP-14 Registra motocicleta asociada y rechaza placa duplicada', async () => {
  const datos = { numero_carne: carne, placa, tipo: 'Motocicleta', marca: 'Honda', modelo: '2025', color: 'Negro' };
  const creada = await api('POST', '/api/motocicletas', { token: adminToken, body: datos });
  assert.equal(creada.status, 201);
  assert.equal(creada.data.motocicletas[0].placa, placa);

  const repetida = await api('POST', '/api/motocicletas', {
    token: adminToken, body: datos,
  });
  assert.equal(repetida.status, 409);
});

test('CP-15 Consulta por carné y bloquea ingresos no autorizados mostrando el motivo', async () => {
  await integrantes.actualizarAutorizacion(carne, {
    estado_autorizacion: 'NO AUTORIZADO', motivo_bloqueo: 'Documentación pendiente',
  });
  const consulta = await api('GET', `/api/integrantes/${carne}`, { token: guardaToken });
  assert.equal(consulta.status, 200);
  assert.equal(consulta.data.motivo_bloqueo, 'Documentación pendiente');

  const ingreso = await api('POST', '/api/ingresos', {
    token: guardaToken,
    body: { numero_carne: carne, id_motocicleta: consulta.data.motocicletas[0].id_motocicleta },
  });
  assert.equal(ingreso.status, 403);
  assert.match(ingreso.data.mensaje, /Documentación pendiente/);
});

test('CP-16 Autoriza e ingresa la motocicleta una sola vez; conserva el historial', async () => {
  const integrante = await integrantes.actualizarAutorizacion(carne, { estado_autorizacion: 'AUTORIZADO' });
  const idMoto = integrante.motocicletas[0].id_motocicleta;
  const ingreso = await api('POST', '/api/ingresos', {
    token: guardaToken, body: { numero_carne: carne, id_motocicleta: idMoto },
  });
  assert.equal(ingreso.status, 201);
  assert.equal(ingreso.data.numero_carne, carne);

  const repetido = await api('POST', '/api/ingresos', {
    token: guardaToken, body: { numero_carne: carne, id_motocicleta: idMoto },
  });
  assert.equal(repetido.status, 409);

  const activos = await api('GET', '/api/ingresos/activos', { token: guardaToken });
  assert.ok(activos.data.some((i) => i.id_ingreso === ingreso.data.id_ingreso));
  const historial = await api('GET', `/api/integrantes/${carne}/historial`, { token: guardaToken });
  assert.ok(historial.data.asociaciones[0].ingresos.some((i) => i.id_ingreso === ingreso.data.id_ingreso));
});
