// T10: pantalla de inicio de sesión (HU-02)
import { useState } from 'react';
import { api } from '../services/api.js';

export default function Login({ onIngreso, errorInicial = '' }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(errorInicial);
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      onIngreso(await api.login(usuario.trim(), contrasena));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-fondo">
      <form className="login-tarjeta" onSubmit={enviar}>
        <span className="logo grande">P</span>
        <h1>Control de acceso</h1>
        <p className="sub">Parqueadero de motocicletas · UNIAJC Sede Norte</p>
        <label>Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required autoFocus />
        </label>
        <label>Contraseña
          <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="alerta" role="alert">{error}</p>}
        <button disabled={cargando}>{cargando ? 'Verificando…' : 'Ingresar'}</button>
        <p className="nota">Acceso solo para personal autorizado (Administrador y Guarda).</p>
      </form>
    </main>
  );
}
