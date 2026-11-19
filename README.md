# Parqueadero UNIAJC

Sistema web para controlar el acceso de motocicletas al parqueadero de la Institución
Universitaria Antonio José Camacho. Incluye autenticación por roles, registro de integrantes,
ingresos y salidas, ocupación, novedades, historial y reportes administrativos.

## Requisitos

- Node.js 20 o superior
- MySQL 8 o superior

## Preparar el entorno

1. Cree y configure la base de datos. `database/schema.sql` sirve para una instalación nueva;
   contiene instrucciones `DROP TABLE`, por lo que **elimina las tablas existentes** al ejecutarse.
   No lo ejecute sobre una base con datos que quiera conservar.
2. Cree `backend/.env` con los datos de su entorno:

   ```dotenv
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=su_clave
   DB_NAME=parqueadero_uniajc
   JWT_SECRET=un_secreto_aleatorio_largo
   FRONTEND_URL=http://localhost:5173
   ```

3. Instale las dependencias desde cada carpeta:

   ```powershell
   cd backend
   npm install
   cd ..\frontend
   npm install
   ```

4. Desde `backend`, cree el primer administrador con el asistente:

   ```powershell
   cd ..\backend
   npm run crear-admin
   ```

## Ejecutar localmente

Abra dos terminales:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

Abra `http://localhost:5173`. Vite redirige las llamadas `/api` al backend en el puerto 4000.

## Pruebas y compilación

Las pruebas de integración requieren MySQL con el esquema aplicado y `backend/.env` configurado.
Ejecute:

```powershell
cd backend
npm test
```

Para validar la compilación del frontend:

```powershell
cd frontend
npm run build
```

Las reglas de negocio y el alcance del Sprint 3 están en
[`docs/reglas-negocio-sprint3.md`](docs/reglas-negocio-sprint3.md) y
[`docs/retrospectiva-y-planning-sprint3.md`](docs/retrospectiva-y-planning-sprint3.md).
