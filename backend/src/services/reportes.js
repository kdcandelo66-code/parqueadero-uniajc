const db = require('../config/db');
const parqueadero = require('./parqueadero');
const { ErrorNegocio } = require('./usuarios');

function validarFecha(valor, campo) {
  if (valor === undefined || valor === '') return null;
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor))
    throw new ErrorNegocio(400, `La fecha ${campo} debe tener formato AAAA-MM-DD`);
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor)
    throw new ErrorNegocio(400, `La fecha ${campo} no es válida`);
  return valor;
}

function filtroFecha(alias, desde, hasta) {
  const condiciones = [];
  const valores = [];
  if (desde) {
    condiciones.push(`${alias} >= ?`);
    valores.push(desde);
  }
  if (hasta) {
    condiciones.push(`${alias} < DATE_ADD(?, INTERVAL 1 DAY)`);
    valores.push(hasta);
  }
  return {
    sql: condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '',
    valores,
  };
}

async function consultar({ desde: desdeEntrada, hasta: hastaEntrada } = {}) {
  const desde = validarFecha(desdeEntrada, 'desde');
  const hasta = validarFecha(hastaEntrada, 'hasta');
  if (desde && hasta && desde > hasta)
    throw new ErrorNegocio(400, 'La fecha desde no puede ser posterior a la fecha hasta');

  const filtroIngresos = filtroFecha('i.fecha_hora_ingreso', desde, hasta);
  const filtroSalidas = filtroFecha('s.fecha_hora_salida', desde, hasta);
  const [conteoIngresos, conteoSalidas, activos, movimientos, ocupacion] = await Promise.all([
    db.query(`SELECT COUNT(*) AS total FROM ingresos i ${filtroIngresos.sql}`, filtroIngresos.valores),
    db.query(
      `SELECT COUNT(*) AS total FROM salidas s ${filtroSalidas.sql}`,
      filtroSalidas.valores),
    db.query(`SELECT COUNT(*) AS total FROM ingresos WHERE estado_movimiento = 'activo'`),
    db.query(
      `SELECT * FROM (
         SELECT i.id_ingreso AS id_movimiento, 'Ingreso' AS tipo,
                i.fecha_hora_ingreso AS fecha_hora, e.numero_carne, e.nombre_completo,
                m.placa, u.nombre_completo AS responsable
           FROM ingresos i
           JOIN estudiantes e ON e.id_estudiante = i.id_estudiante
           JOIN motocicletas m ON m.id_motocicleta = i.id_motocicleta
           JOIN usuarios u ON u.id_usuario = i.id_usuario
           ${filtroIngresos.sql}
         UNION ALL
         SELECT s.id_salida AS id_movimiento, 'Salida' AS tipo,
                s.fecha_hora_salida AS fecha_hora, e.numero_carne, e.nombre_completo,
                m.placa, u.nombre_completo AS responsable
           FROM salidas s
           JOIN ingresos i ON i.id_ingreso = s.id_ingreso
           JOIN estudiantes e ON e.id_estudiante = i.id_estudiante
           JOIN motocicletas m ON m.id_motocicleta = i.id_motocicleta
           JOIN usuarios u ON u.id_usuario = s.id_usuario
           ${filtroSalidas.sql}
       ) AS movimientos
       ORDER BY fecha_hora DESC, tipo
       LIMIT 500`,
      [...filtroIngresos.valores, ...filtroSalidas.valores]),
    parqueadero.resumen(),
  ]);
  return {
    resumen: {
      ingresos: Number(conteoIngresos[0][0].total),
      salidas: Number(conteoSalidas[0][0].total),
      ingresos_activos: Number(activos[0][0].total),
      ...ocupacion,
    },
    movimientos: movimientos[0],
    limite_movimientos: 500,
  };
}

module.exports = { consultar };
