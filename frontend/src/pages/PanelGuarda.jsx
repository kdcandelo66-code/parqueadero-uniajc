// T11: prototipo del panel principal del guarda (Tabla 6).
// Sprint 1: los indicadores de capacidad son reales (GET /api/parqueadero).
// La búsqueda, los movimientos y los botones de ingreso/salida se conectan en los Sprints 2 y 3.
import { useEffect, useState } from 'react';
import Encabezado from './Encabezado.jsx';
import { api } from '../services/api.js';

export default function PanelGuarda({ usuario, onSalir, resumenInicial = null }) {
  const [resumen, setResumen] = useState(resumenInicial);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resumenInicial) return;
    api.parqueadero().then(setResumen).catch((e) => setError(e.message));
  }, [resumenInicial]);

  return (
    <>
      <Encabezado usuario={usuario} onSalir={onSalir} />
      <main className="contenido">
        <h2>Panel del guarda</h2>
        {error && <p className="alerta">{error}</p>}
        <section className="indicadores">
          <Indicador titulo="Capacidad total" valor={resumen?.capacidad_maxima} />
          <Indicador titulo="Ocupados" valor={resumen?.espacios_ocupados} tono="ocupado" />
          <Indicador titulo="Disponibles" valor={resumen?.espacios_disponibles} tono="libre" />
          <Indicador titulo="Ocupación" valor={resumen ? `${resumen.porcentaje_ocupacion}%` : null} />
        </section>

        <section className="tarjeta">
          <h3>Búsqueda rápida</h3>
          <div className="busqueda">
            <input placeholder="Número de carné o placa" disabled />
            <button disabled>Consultar</button>
          </div>
          <p className="nota">Disponible en el Sprint 2 (HU-09 y HU-10): mostrará nombre, carné, programa,
            estado de autorización, motocicleta, placa y botones de ingreso y salida.</p>
        </section>

        <div className="columnas">
          <section className="tarjeta">
            <h3>Últimos ingresos</h3>
            <p className="vacio">Sin movimientos registrados (Sprint 2 · HU-11)</p>
          </section>
          <section className="tarjeta">
            <h3>Últimas salidas</h3>
            <p className="vacio">Sin movimientos registrados (Sprint 3 · HU-12)</p>
          </section>
          <section className="tarjeta">
            <h3>Alertas y novedades</h3>
            <p className="vacio">Sin novedades (Sprint 3 · HU-15)</p>
          </section>
        </div>
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
