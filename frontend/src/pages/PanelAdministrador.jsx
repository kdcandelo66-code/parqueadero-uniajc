// Gestión del Administrador: usuarios, integrantes y motocicletas.
import { useEffect, useState } from 'react';
import Encabezado from './Encabezado.jsx';
import { api } from '../services/api.js';

const VACIO = { nombre_completo: '', usuario: '', contrasena: '', rol: 'Guarda' };
const INTEGRANTE_VACIO = {
  numero_carne: '', nombre_completo: '', documento_identidad: '',
  programa_academico: '', correo_institucional: '', telefono: '',
};
const MOTO_VACIA = { numero_carne: '', placa: '', tipo: 'Motocicleta', marca: '', modelo: '', color: '' };

export default function PanelAdministrador({ usuario, onSalir, demo = null }) {
  const [lista, setLista] = useState(demo?.usuarios || []);
  const [integrantes, setIntegrantes] = useState(demo?.integrantes || []);
  const [resumen, setResumen] = useState(demo?.resumen || null);
  const [capacidad, setCapacidad] = useState(demo?.resumen?.capacidad_maxima ?? '');
  const [nuevo, setNuevo] = useState(VACIO);
  const [nuevoIntegrante, setNuevoIntegrante] = useState(INTEGRANTE_VACIO);
  const [nuevaMoto, setNuevaMoto] = useState(MOTO_VACIA);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  async function cargar() {
    try {
      const [u, p, i] = await Promise.all([api.usuarios(), api.parqueadero(), api.integrantes()]);
      setLista(u); setResumen(p); setCapacidad(p.capacidad_maxima); setIntegrantes(i);
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
  const crearIntegrante = (e) => {
    e.preventDefault();
    ejecutar(async () => {
      await api.crearIntegrante(nuevoIntegrante);
      setNuevoIntegrante(INTEGRANTE_VACIO);
    }, 'Integrante registrado. Queda pendiente de autorización.');
  };
  const crearMotocicleta = (e) => {
    e.preventDefault();
    ejecutar(async () => {
      await api.crearMotocicleta(nuevaMoto);
      setNuevaMoto(MOTO_VACIA);
    }, 'Motocicleta registrada y asociada al integrante.');
  };
  const actualizarBorrador = (carne, campo, valor) => setIntegrantes((actuales) =>
    actuales.map((integrante) => integrante.numero_carne === carne
      ? { ...integrante, [campo]: valor }
      : integrante));
  const guardarAutorizacion = (integrante) => ejecutar(
    () => api.actualizarAutorizacion(integrante.numero_carne, {
      estado_autorizacion: integrante.estado_autorizacion,
      motivo_bloqueo: integrante.motivo_bloqueo,
    }),
    'Autorización actualizada');
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

        <div className="columnas dos">
          <section className="tarjeta">
            <h3>Registrar integrante</h3>
            <form className="rejilla" onSubmit={crearIntegrante}>
              <input placeholder="Número de carné" value={nuevoIntegrante.numero_carne} onChange={(e) => setNuevoIntegrante({ ...nuevoIntegrante, numero_carne: e.target.value })} required />
              <input placeholder="Nombre completo" value={nuevoIntegrante.nombre_completo} onChange={(e) => setNuevoIntegrante({ ...nuevoIntegrante, nombre_completo: e.target.value })} required />
              <input placeholder="Documento de identidad" value={nuevoIntegrante.documento_identidad} onChange={(e) => setNuevoIntegrante({ ...nuevoIntegrante, documento_identidad: e.target.value })} required />
              <input placeholder="Programa académico" value={nuevoIntegrante.programa_academico} onChange={(e) => setNuevoIntegrante({ ...nuevoIntegrante, programa_academico: e.target.value })} required />
              <input type="email" placeholder="Correo institucional" value={nuevoIntegrante.correo_institucional} onChange={(e) => setNuevoIntegrante({ ...nuevoIntegrante, correo_institucional: e.target.value })} required />
              <input placeholder="Teléfono (opcional)" value={nuevoIntegrante.telefono} onChange={(e) => setNuevoIntegrante({ ...nuevoIntegrante, telefono: e.target.value })} />
              <button>Registrar integrante</button>
            </form>
          </section>

          <section className="tarjeta">
            <h3>Registrar y asociar motocicleta</h3>
            <form className="rejilla" onSubmit={crearMotocicleta}>
              <select value={nuevaMoto.numero_carne} onChange={(e) => setNuevaMoto({ ...nuevaMoto, numero_carne: e.target.value })} required>
                <option value="">Seleccione un integrante</option>
                {integrantes.filter((i) => i.estado === 'activo').map((i) =>
                  <option key={i.id_estudiante} value={i.numero_carne}>{i.numero_carne} · {i.nombre_completo}</option>)}
              </select>
              <input placeholder="Placa" value={nuevaMoto.placa} onChange={(e) => setNuevaMoto({ ...nuevaMoto, placa: e.target.value.toUpperCase() })} required />
              <input placeholder="Tipo" value={nuevaMoto.tipo} onChange={(e) => setNuevaMoto({ ...nuevaMoto, tipo: e.target.value })} required />
              <input placeholder="Marca" value={nuevaMoto.marca} onChange={(e) => setNuevaMoto({ ...nuevaMoto, marca: e.target.value })} required />
              <input placeholder="Modelo" value={nuevaMoto.modelo} onChange={(e) => setNuevaMoto({ ...nuevaMoto, modelo: e.target.value })} required />
              <input placeholder="Color" value={nuevaMoto.color} onChange={(e) => setNuevaMoto({ ...nuevaMoto, color: e.target.value })} required />
              <button disabled={!integrantes.some((i) => i.estado === 'activo')}>Registrar motocicleta</button>
            </form>
          </section>
        </div>

        <section className="tarjeta">
          <h3>Integrantes y autorización</h3>
          <div className="tabla-desbordable">
            <table>
              <thead><tr><th>Integrante</th><th>Carné</th><th>Motivo / estado</th><th>Autorización</th><th></th></tr></thead>
              <tbody>
                {integrantes.map((i) => (
                  <tr key={i.id_estudiante}>
                    <td>{i.nombre_completo}</td>
                    <td>{i.numero_carne}</td>
                    <td>
                      <input aria-label={`Motivo de bloqueo ${i.numero_carne}`} placeholder="Motivo si no está autorizado"
                        value={i.motivo_bloqueo || ''}
                        disabled={i.estado_autorizacion === 'AUTORIZADO'}
                        onChange={(e) => actualizarBorrador(i.numero_carne, 'motivo_bloqueo', e.target.value)} />
                    </td>
                    <td>
                      <select value={i.estado_autorizacion}
                        onChange={(e) => actualizarBorrador(i.numero_carne, 'estado_autorizacion', e.target.value)}>
                        <option value="NO AUTORIZADO">NO AUTORIZADO</option>
                        <option value="AUTORIZADO">AUTORIZADO</option>
                      </select>
                    </td>
                    <td><button className="secundario" onClick={() => guardarAutorizacion(i)}>Guardar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

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
