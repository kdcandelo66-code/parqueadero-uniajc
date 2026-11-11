// T8 y T9: panel del Administrador — usuarios autorizados (HU-03) y capacidad máxima (HU-05)
import { useEffect, useState } from 'react';
import Encabezado from './Encabezado.jsx';
import { api } from '../services/api.js';

const VACIO = { nombre_completo: '', usuario: '', contrasena: '', rol: 'Guarda' };

export default function PanelAdministrador({ usuario, onSalir, demo = null }) {
  const [lista, setLista] = useState(demo?.usuarios || []);
  const [resumen, setResumen] = useState(demo?.resumen || null);
  const [capacidad, setCapacidad] = useState(demo?.resumen?.capacidad_maxima ?? '');
  const [nuevo, setNuevo] = useState(VACIO);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  async function cargar() {
    try {
      const [u, p] = await Promise.all([api.usuarios(), api.parqueadero()]);
      setLista(u); setResumen(p); setCapacidad(p.capacidad_maxima);
    } catch (e) { setMensaje({ tipo: 'alerta', texto: e.message }); }
  }
  useEffect(() => { if (!demo) cargar(); }, [demo]);

  async function ejecutar(accion, exito) {
    setMensaje({ tipo: '', texto: '' });
    try { await accion(); setMensaje({ tipo: 'exito', texto: exito }); await cargar(); }
    catch (e) { setMensaje({ tipo: 'alerta', texto: e.message }); }
  }

  const crear = (e) => {
    e.preventDefault();
    ejecutar(async () => { await api.crearUsuario(nuevo); setNuevo(VACIO); }, 'Usuario creado');
  };
  const guardarCapacidad = (e) => {
    e.preventDefault();
    ejecutar(() => api.cambiarCapacidad(Number(capacidad)), 'Capacidad actualizada');
  };
  const cambiarEstado = (u) => ejecutar(
    () => api.actualizarUsuario(u.id_usuario, { estado: u.estado === 'activo' ? 'inactivo' : 'activo' }),
    'Estado actualizado');

  return (
    <>
      <Encabezado usuario={usuario} onSalir={onSalir} />
      <main className="contenido">
        <h2>Panel del administrador</h2>
        {mensaje.texto && <p className={mensaje.tipo}>{mensaje.texto}</p>}

        <div className="columnas dos">
          <section className="tarjeta">
            <h3>Capacidad del parqueadero</h3>
            <form className="fila" onSubmit={guardarCapacidad}>
              <label>Capacidad máxima
                <input type="number" min="1" step="1" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} required />
              </label>
              <button>Guardar</button>
            </form>
            {resumen && (
              <p className="nota">Ocupados: {resumen.espacios_ocupados} · Disponibles: {resumen.espacios_disponibles}
                {' '}· Ocupación: {resumen.porcentaje_ocupacion}%</p>
            )}
          </section>

          <section className="tarjeta">
            <h3>Nuevo usuario autorizado</h3>
            <form className="rejilla" onSubmit={crear}>
              <input placeholder="Nombre completo" value={nuevo.nombre_completo} onChange={(e) => setNuevo({ ...nuevo, nombre_completo: e.target.value })} required />
              <input placeholder="Usuario" value={nuevo.usuario} onChange={(e) => setNuevo({ ...nuevo, usuario: e.target.value })} required />
              <input type="password" placeholder="Contraseña (mín. 8)" minLength={8} value={nuevo.contrasena} onChange={(e) => setNuevo({ ...nuevo, contrasena: e.target.value })} required />
              <select value={nuevo.rol} onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}>
                <option>Guarda</option>
                <option>Administrador</option>
              </select>
              <button>Crear usuario</button>
            </form>
          </section>
        </div>

        <section className="tarjeta">
          <h3>Usuarios autorizados</h3>
          <table>
            <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.nombre_completo}</td>
                  <td>{u.usuario}</td>
                  <td>{u.rol}</td>
                  <td><span className={`etiqueta ${u.estado}`}>{u.estado}</span></td>
                  <td>
                    <button className="secundario" onClick={() => cambiarEstado(u)}>
                      {u.estado === 'activo' ? 'Inactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="nota">Los usuarios no se eliminan: se inactivan para conservar la trazabilidad de los movimientos.</p>
        </section>
      </main>
    </>
  );
}
