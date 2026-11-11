// T10: después del inicio de sesión se dirige a cada usuario al panel de su rol
import { useState } from 'react';
import Login from './pages/Login.jsx';
import PanelGuarda from './pages/PanelGuarda.jsx';
import PanelAdministrador from './pages/PanelAdministrador.jsx';
import { sesion } from './services/api.js';

export default function App() {
  const [usuario, setUsuario] = useState(sesion.obtener());

  const entrar = (datos) => { sesion.guardar(datos); setUsuario(datos); };
  const salir = () => { sesion.cerrar(); setUsuario(null); };

  if (!usuario) return <Login onIngreso={entrar} />;
  return usuario.rol === 'Administrador'
    ? <PanelAdministrador usuario={usuario} onSalir={salir} />
    : <PanelGuarda usuario={usuario} onSalir={salir} />;
}
