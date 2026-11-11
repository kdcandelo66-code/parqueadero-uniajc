// Llamadas a la API REST. El token JWT se conserva en sessionStorage
// (se borra al cerrar el navegador).
const CLAVE = 'parqueadero_sesion';

export const sesion = {
  obtener: () => JSON.parse(sessionStorage.getItem(CLAVE) || 'null'),
  guardar: (s) => sessionStorage.setItem(CLAVE, JSON.stringify(s)),
  cerrar: () => sessionStorage.removeItem(CLAVE),
};

async function pedir(metodo, ruta, body) {
  const s = sesion.obtener();
  const res = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(s?.token ? { Authorization: `Bearer ${s.token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && ruta !== '/auth/login') {
    sesion.cerrar();
    window.location.reload();
  }
  if (!res.ok) throw new Error(data.mensaje || 'Ocurrió un error');
  return data;
}

export const api = {
  login: (usuario, contrasena) => pedir('POST', '/auth/login', { usuario, contrasena }),
  parqueadero: () => pedir('GET', '/parqueadero'),
  cambiarCapacidad: (capacidad_maxima) => pedir('PUT', '/parqueadero/capacidad', { capacidad_maxima }),
  usuarios: () => pedir('GET', '/usuarios'),
  crearUsuario: (datos) => pedir('POST', '/usuarios', datos),
  actualizarUsuario: (id, datos) => pedir('PUT', `/usuarios/${id}`, datos),
  integrantes: () => pedir('GET', '/integrantes'),
  crearIntegrante: (datos) => pedir('POST', '/integrantes', datos),
  actualizarAutorizacion: (carne, datos) => pedir('PUT', `/integrantes/${encodeURIComponent(carne)}/autorizacion`, datos),
  consultarIntegrante: (carne) => pedir('GET', `/integrantes/${encodeURIComponent(carne)}`),
  historialIntegrante: (carne) => pedir('GET', `/integrantes/${encodeURIComponent(carne)}/historial`),
  crearMotocicleta: (datos) => pedir('POST', '/motocicletas', datos),
  ingresosActivos: () => pedir('GET', '/ingresos/activos'),
  registrarIngreso: (numero_carne, id_motocicleta) => pedir('POST', '/ingresos', { numero_carne, id_motocicleta }),
};
