# Parqueadero de motocicletas · UNIAJC Sede Norte — Incremento del Sprint 1

Sistema de información web para la gestión y control de acceso del parqueadero de motocicletas
de la Institución Universitaria Antonio José Camacho. Este repositorio contiene el incremento
del **Sprint 1 (20 oct – 3 nov 2026)**: historias **HU-01 a HU-05** (24 puntos).

| Capa | Tecnología (decisión del equipo) |
|---|---|
| Cliente | React 19 + Vite |
| Servidor | Node.js 20+ con Express 5 (API REST) |
| Base de datos | MySQL 8 |
| Seguridad | JWT (sesión) + bcrypt (contraseñas) |

```
parqueadero-uniajc/
├─ database/schema.sql            T3  modelo relacional + datos iniciales (HU-01, HU-05)
├─ backend/
│  ├─ src/app.js, server.js       T5  servidor Express
│  ├─ src/config/db.js                conexión MySQL (pool)
│  ├─ src/routes/auth.js          T6  POST /api/auth/login, GET /api/auth/sesion
│  ├─ src/middlewares/auth.js     T7  verificarToken, requerirRol
│  ├─ src/middlewares/registrarAcceso.js  T12 registro de accesos (logs/accesos.log)
│  ├─ src/routes|services/usuarios.js     T8  gestión de usuarios (solo Administrador)
│  ├─ src/routes|services/parqueadero.js  T9  capacidad máxima
│  ├─ scripts/crear-usuario.js        crea el primer Administrador / Guarda con bcrypt
│  └─ tests/sprint1.test.js       T13 casos de prueba CP-01 a CP-12
└─ frontend/
   └─ src/pages/                  T10/T11 Login, PanelGuarda, PanelAdministrador
```

## Puesta en marcha

1. **Base de datos** (MySQL 8 en ejecución):
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   **Advertencia:** este script elimina y vuelve a crear las tablas. No lo ejecutes sobre una base
   que contenga datos que necesites conservar.
2. **Backend**:
   ```bash
   cd backend
   # Crear backend/.env con PORT, FRONTEND_URL, JWT_SECRET, JWT_EXPIRA,
   # DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME.
   # No compartir ni subir este archivo: contiene credenciales locales.
   npm install
   npm run crear-admin         # pide nombre, usuario y contraseña del primer Administrador
   npm run dev                 # API en http://localhost:4000
   ```
3. **Frontend** (otra terminal):
   ```bash
   cd frontend
   npm install
   npm run dev                 # http://localhost:5173
   ```

## Pruebas del Sprint 1 (T13)

Con MySQL corriendo y `backend/.env` configurado:

```bash
cd backend
npm test
```

Ejecuta CP-01 a CP-12 con el ejecutor de pruebas nativo de Node. Cada ejecución usa identificadores
aleatorios y elimina solo sus registros temporales. Al finalizar restaura la capacidad del
parqueadero y recalcula sus espacios según los ingresos activos que queden. Evita ejecutar las
pruebas mientras se registran operaciones reales en la misma base.

## API del Sprint 1

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | /api/auth/login | público | Inicia sesión; responde `{ token, rol, nombre }` o 401 con mensaje genérico |
| GET | /api/auth/sesion | cualquiera autenticado | Datos de la sesión |
| GET | /api/usuarios | Administrador | Lista usuarios (sin hash) |
| POST | /api/usuarios | Administrador | Crea usuario (bcrypt costo 10). 409 si el usuario existe |
| PUT | /api/usuarios/:id | Administrador | Edita nombre, rol, estado o contraseña. No se borra: se inactiva |
| GET | /api/parqueadero | Administrador, Guarda | Capacidad, ocupados, disponibles y % de ocupación |
| PUT | /api/parqueadero/capacidad | Administrador | Entero > 0 y ≥ ocupados; si no, 400 |

## Pendiente para los siguientes Sprints
- Revisión del prototipo con el Product Owner (T11) → Sprint 2.
- Búsqueda por carné/placa, ingreso (HU-06 a HU-11) → Sprint 2.
- Salida, ocupación en tiempo real, novedades, historial y reportes (HU-12 a HU-17) → Sprint 3.
