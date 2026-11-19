# Reglas de negocio del Sprint 3

## Salidas (HU-12)

1. Solo un ingreso existente y activo puede cerrarse.
2. El cierre del ingreso y la creación de su salida se confirman en una sola transacción.
3. La salida guarda el usuario autenticado que la registra, su fecha y el tiempo de permanencia
   en minutos.
4. No se puede registrar una segunda salida para un ingreso ya cerrado.
5. Al cerrar un ingreso, la motocicleta queda disponible para un nuevo ingreso si continúa
   cumpliendo las validaciones de autorización, asociación y capacidad.

## Novedades (HU-15)

6. La descripción es obligatoria y tiene un máximo de 300 caracteres.
7. El carné y la placa son opcionales; cuando se informan, deben existir y quedan vinculados a sus
   registros.
8. Cada novedad conserva el usuario autenticado y la fecha de creación.
9. La consulta de novedades devuelve como máximo los 100 registros más recientes.

## Búsqueda, ocupación e historial (HU-12, HU-13, HU-16)

10. El ingreso activo se puede buscar por coincidencia exacta de carné o placa, sin distinguir
    mayúsculas de minúsculas.
11. Los ingresos incrementan y las salidas decrementan la ocupación dentro de su transacción.
    Espacios ocupados, disponibles y porcentaje se recalculan a partir de ingresos activos.
12. No se registra un ingreso cuando la cantidad de movimientos activos alcanza la capacidad
    máxima. La capacidad tampoco puede reducirse por debajo de la ocupación.
13. El historial se puede consultar por carné de integrante o por placa; incluye responsable,
    fechas de ingreso y salida, estado y permanencia cuando ya se cerró el ingreso.

## Reportes (HU-17)

14. Solo el Administrador consulta reportes de movimientos.
15. El reporte acepta fechas opcionales `desde` y `hasta` (inclusive), muestra totales del periodo,
    ocupación actual y hasta 500 movimientos recientes.

## API

- `GET /api/ingresos/activos?consulta=<carné|placa>`: lista o busca ingresos activos.
- `GET /api/salidas`: consulta las salidas recientes.
- `POST /api/salidas` con `{ "id_ingreso": 1 }`: cierra un ingreso activo.
- `GET /api/novedades`: consulta las novedades recientes.
- `POST /api/novedades` con `{ "descripcion": "...", "numero_carne": "...", "placa": "..." }`:
  registra una novedad; carné y placa se pueden omitir.
- `GET /api/integrantes/:numero_carne/historial`: consulta los movimientos de un integrante.
- `GET /api/motocicletas/:placa/historial`: consulta los movimientos de una motocicleta.
- `GET /api/reportes?desde=AAAA-MM-DD&hasta=AAAA-MM-DD`: consulta el reporte (solo Administrador).

Las rutas de consulta y registro de movimientos requieren JWT y rol Administrador o Guarda, salvo
`/api/reportes`, que es exclusivo del Administrador. Las tablas requeridas ya existen en el esquema;
este incremento no requiere una migración.
