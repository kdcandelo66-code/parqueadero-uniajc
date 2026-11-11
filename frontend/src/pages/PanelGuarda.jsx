// Panel del Guarda: consulta de autorización e ingreso de motocicletas.
import { useEffect, useState } from 'react';
import Encabezado from './Encabezado.jsx';
import { api } from '../services/api.js';

export default function PanelGuarda({ usuario, onSalir, resumenInicial = null }) {
  const [resumen, setResumen] = useState(resumenInicial);
  const [integrante, setIntegrante] = useState(null);
  const [carne, setCarne] = useState('');
  const [motocicleta, setMotocicleta] = useState('');
  const [ingresos, setIngresos] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  async function cargarPanel() {
    try {
      const [p, i] = await Promise.all([api.parqueadero(), api.ingresosActivos()]);
      setResumen(p);
      setIngresos(i);
    } catch (e) { setMensaje({ tipo: 'alerta', texto: e.message }); }
  }
  useEffect(() => { cargarPanel(); }, []);

  async function consultar(e) {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    setIntegrante(null);
    setMotocicleta('');
    try {
      const resultado = await api.consultarIntegrante(carne.trim());
      setIntegrante(resultado);
      setMotocicleta(resultado.motocicletas[0]?.id_motocicleta || '');
    } catch (err) { setMensaje({ tipo: 'alerta', texto: err.message }); }
  }

  async function registrarIngreso() {
    setMensaje({ tipo: '', texto: '' });
    try {
      await api.registrarIngreso(integrante.numero_carne, Number(motocicleta));
      setMensaje({ tipo: 'exito', texto: 'Ingreso registrado correctamente.' });
      await cargarPanel();
    } catch (err) { setMensaje({ tipo: 'alerta', texto: err.message }); }
  }

  return (
    <>
      <Encabezado usuario={usuario} onSalir={onSalir} />
      <main className="contenido">
        <h2>Panel del guarda</h2>
        {mensaje.texto && <p className={mensaje.tipo} role="status">{mensaje.texto}</p>}
        <section className="indicadores">
          <Indicador titulo="Capacidad total" valor={resumen?.capacidad_maxima} />
          <Indicador titulo="Ocupados" valor={resumen?.espacios_ocupados} tono="ocupado" />
          <Indicador titulo="Disponibles" valor={resumen?.espacios_disponibles} tono="libre" />
          <Indicador titulo="Ocupación" valor={resumen ? `${resumen.porcentaje_ocupacion}%` : null} />
        </section>

        <section className="tarjeta">
          <h3>Búsqueda rápida</h3>
          <form className="busqueda" onSubmit={consultar}>
            <input placeholder="Número de carné" value={carne} onChange={(e) => setCarne(e.target.value)} required />
            <button>Consultar</button>
          </form>
          {integrante && (
            <div className="resultado-consulta">
              <h4>{integrante.nombre_completo}</h4>
              <p>Carné: {integrante.numero_carne} · Programa: {integrante.programa_academico}</p>
              <p className={integrante.estado_autorizacion === 'AUTORIZADO' ? 'exito' : 'alerta'}>
                {integrante.estado_autorizacion}
                {integrante.estado_autorizacion === 'NO AUTORIZADO' && ` · Motivo: ${integrante.motivo_bloqueo || 'No especificado'}`}
              </p>
              {integrante.motocicletas.length > 0 ? (
                <div className="fila">
                  <label>Motocicleta asociada
                    <select value={motocicleta} onChange={(e) => setMotocicleta(e.target.value)}>
                      {integrante.motocicletas.map((m) =>
                        <option key={m.id_motocicleta} value={m.id_motocicleta}>{m.placa} · {m.marca} {m.modelo} · {m.color}</option>)}
                    </select>
                  </label>
                  <button type="button" disabled={integrante.estado_autorizacion !== 'AUTORIZADO'} onClick={registrarIngreso}>
                    Registrar ingreso
                  </button>
                </div>
              ) : <p className="nota">No tiene motocicletas activas asociadas.</p>}
            </div>
          )}
        </section>

        <section className="tarjeta">
          <h3>Ingresos activos</h3>
          {ingresos.length ? (
            <div className="tabla-desbordable">
              <table>
                <thead><tr><th>Hora</th><th>Integrante</th><th>Carné</th><th>Placa</th><th>Guarda</th></tr></thead>
                <tbody>{ingresos.map((i) => (
                  <tr key={i.id_ingreso}>
                    <td>{new Date(i.fecha_hora_ingreso).toLocaleString()}</td>
                    <td>{i.nombre_completo}</td><td>{i.numero_carne}</td><td>{i.placa}</td><td>{i.guarda}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <p className="vacio">Sin ingresos activos.</p>}
        </section>
      </main>
    </>
  );
}

function Indicador({ titulo, valor, tono = '' }) {
  return (
    <div className={`indicador ${tono}`}>
      <span>{titulo}</span>
      <strong>{valor ?? '—'}</strong>
    </div>
  );
}
