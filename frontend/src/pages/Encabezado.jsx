export default function Encabezado({ usuario, onSalir }) {
  return (
    <header className="barra">
      <div className="marca">
        <span className="logo">P</span>
        <div>
          <strong>Parqueadero de motocicletas</strong>
          <small>UNIAJC · Sede Norte</small>
        </div>
      </div>
      <div className="sesion">
        <span>{usuario.nombre} · <b>{usuario.rol}</b></span>
        <button className="secundario" onClick={onSalir}>Cerrar sesión</button>
      </div>
    </header>
  );
}
