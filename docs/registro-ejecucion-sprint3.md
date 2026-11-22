# Registro de ejecución y evidencias del Sprint 3

**Fecha de ejecución:** 21 de noviembre de 2026

**Entorno:** Node.js 22.23.4, npm 10.9.9, MySQL 8.0.46  
**Base utilizada:** `parqueadero_uniajc`, configurada mediante `backend/.env`.

## Resultados

| Ejecución | Comando | Resultado | Evidencia |
|---|---|---|---|
| Suite backend | `cd backend; npm test` | 22 aprobadas, 0 fallidas, 0 omitidas. | [Salida TAP completa](./evidencia-pruebas/sprint3-pruebas-backend.txt) |
| Compilación frontend | `cd frontend; npm run build` | Compilación Vite exitosa. | [Salida completa del build](./evidencia-pruebas/sprint3-build-frontend.txt) |

La suite se ejecuta en serie (`--test-concurrency=1`) porque los casos de integración comparten la
misma base de datos de pruebas.

## Capturas de la interfaz

Se usaron registros sintéticos temporales. Las imágenes corresponden a pantallas funcionales del
incremento, no a prototipos.

| Evidencia | Pantalla |
|---|---|
| [Panel del Guarda y búsqueda activa por placa](./evidencia-pruebas/sprint3-panel-guarda.png) | Indicadores de ocupación y resultado de la búsqueda para registrar la salida. |
| [Salida registrada](./evidencia-pruebas/sprint3-salida-registrada-guarda.png) | Confirmación visible, ocupación actualizada y movimiento reciente. |
| [Historial y novedades](./evidencia-pruebas/sprint3-historial-integrante.png) | Panel del Guarda con novedad e historial de ingresos, salidas y permanencia por carné. |
| [Reporte del Administrador](./evidencia-pruebas/sprint3-reporte-administrador.png) | Totales y detalle de ingresos/salidas del reporte administrativo. |

### Capturas por historia

Las capturas funcionales adicionales quedaron en [`evidencia-pruebas/captura Sprint 3`](./evidencia-pruebas/captura%20Sprint%203):

| Historia | Archivos |
|---|---|
| HU-12 | `HU-12-busqueda-salida.png`, `HU-12-salida-registrada.png` |
| HU-13 | `HU-13-historial-carne.png` |
| HU-14 | `HU-14-indicadores-panel-guarda.png` |
| HU-15 | `HU-15-formulario-novedad.png`, `HU-15-novedad-registrada.png` |
| HU-16 | `HU-16-historial-placa.png` |
| HU-17 | `HU-17-reporte-administrador.png`, `HU-17-panel-administrador-completo.png` |

Además, las mejoras T13 y T14 quedaron incorporadas: el botón «Ingresar» muestra estado de carga
y el botón «Cerrar sesión» solicita confirmación antes de finalizar la sesión.
La evidencia organizada para Kevin está en
[`evidencia-pruebas/sprint 3 kevin`](./evidencia-pruebas/sprint%203%20kevin).

## Evidencia por criterio

| Caso | Tareas / historias | Verificación | Resultado |
|---|---|---|---|
| CP-01 a CP-18 | Regresión de Sprint 1 y 2 | Autenticación, roles, capacidad, integridad, autorizaciones, consulta, historial e ingreso; seis casos independientes para HU-06 a HU-11. | Aprobado |
| CP-19 | T1–T5, HU-12 y HU-13 | Busca un ingreso activo por carné y por placa; registra la salida, verifica permanencia e historial por carné/placa, actualiza ocupación, permite reingreso y rechaza el ingreso al completar capacidad. | Aprobado |
| CP-20 | T8, HU-15 | Rechaza descripción vacía y referencias inexistentes; registra novedad con carné, placa y usuario responsable. | Aprobado |
| CP-21 | T7–T8, HU-14 y HU-15 | Rechaza consultas de salidas y novedades sin autenticación. | Aprobado |
| CP-22 | T10, HU-17 | Permite al Administrador consultar totales y movimientos; valida rango de fechas y rechaza acceso al Guarda. | Aprobado |

## Preparación y limpieza

Las pruebas de integración crean registros sintéticos con identificadores aleatorios y los eliminan
en sus rutinas de limpieza. También restauran la capacidad del parqueadero y sincronizan el resumen
de espacios. Para las capturas se usó una cuenta y datos de muestra temporales, eliminados después
de guardar las imágenes. Ejecutar las pruebas únicamente contra una base de pruebas; no contra un
entorno con operaciones reales concurrentes.

La suite confirma los contratos de API y reglas de negocio. No sustituye una sesión de aceptación
visual con Guarda y Administrador.
