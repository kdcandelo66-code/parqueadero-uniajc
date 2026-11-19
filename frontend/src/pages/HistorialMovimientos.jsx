import { useState } from 'react';
import { api } from '../services/api.js';

export default function HistorialMovimientos() {
  const [numeroCarne, setNumeroCarne] = useState('');
  const [placa, setPlaca] = useState('');
  const [movimientos, setMovimientos] = useState(null);
  const [mensaje, setMensaje] = useState('');

  async function consultar(e) {
    e.preventDefault();
    setMensaje('');
    setMovimientos(null);
    try {
      const placaFiltro = placa.trim().toUpperCase();
      if (numeroCarne.trim()) {
        const resultado = await api.historialIntegrante(numeroCarne.trim());
        setMovimientos(resultado.asociaciones.flatMap((asociacion) =>
          asociacion.ingresos
            .filter(() => !placaFiltro || asociacion.placa === placaFiltro)
            .map((ingreso) => ({
              ...ingreso,
              nombre_completo: resultado.integrante.nombre_completo,
              numero_carne: resultado.integrante.numero_carne,
              placa: asociacion.placa,
            }))));
      } else {
        const resultado = await api.historialMotocicleta(placa.trim().toUpperCase());
        setMovimientos(resultado.movimientos.map((movimiento) => ({
          ...movimiento,
          placa: resultado.motocicleta.placa,
        })));
      }
    } catch (error) {
      setMensaje(error.message);
    }
  }

  return (
    <section className="tarjeta">
      <h3>Historial de movimientos</h3>
      <form className="busqueda" onSubmit={consultar}>
        <input aria-label="Carné para consultar historial" placeholder="Número de carné"
          value={numeroCarne} onChange={(e) => setNumeroCarne(e.target.value)} />
        <span>o</span>
        <input aria-label="Placa para consultar historial" placeholder="Placa"
          value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} />
        <button disabled={!numeroCarne.trim() && !placa.trim()}>Consultar</button>
      </form>
      {mensaje && <p className="alerta" role="status">{mensaje}</p>}
      {movimientos && (movimientos.length ? (
        <div className="tabla-desbordable">
          <table>
            <thead><tr><th>Integrante</th><th>Carné</th><th>Placa</th><th>Ingreso</th><th>Salida</th><th>Permanencia (min)</th><th>Guarda ingreso / salida</th></tr></thead>
            <tbody>{movimientos.map((movimiento) => (
              <tr key={movimiento.id_ingreso}>
                <td>{movimiento.nombre_completo}</td>
                <td>{movimiento.numero_carne}</td>
                <td>{movimiento.placa}</td>
                <td>{new Date(movimiento.fecha_hora_ingreso).toLocaleString()}</td>
                <td>{movimiento.fecha_hora_salida
                  ? new Date(movimiento.fecha_hora_salida).toLocaleString()
                  : 'Activo'}</td>
                <td>{movimiento.tiempo_permanencia ?? '—'}</td>
                <td>{movimiento.guarda || movimiento.guarda_ingreso}
                  {movimiento.guarda_salida ? ` / ${movimiento.guarda_salida}` : ''}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="vacio">No hay movimientos para la consulta.</p>)}
    </section>
  );
}
