# Informe de pruebas del Sprint 1

**Cierre del Sprint:** 3 de noviembre de 2026  
**Verificación posterior registrada:** 8 de noviembre de 2026  
**Entorno de verificación:** Node.js 22.23.4, backend configurado y base MySQL `parqueadero_uniajc`.  
**Comando:** `cd backend` y `npm test`.

Los casos estaban diseñados y automatizados al cierre. La ejecución que sigue se realizó y quedó
registrada el 8 de noviembre; no se atribuye retroactivamente al cierre del Sprint.

## Resultados de ejecución

| Caso | Historia | Qué verifica | Resultado |
|---|---|---|---|
| CP-01 | HU-02 | Administrador inicia sesión con credenciales válidas y recibe token con rol Administrador. | Aprobado |
| CP-02 | HU-02 | Contraseña incorrecta y usuario inexistente devuelven 401 con el mismo mensaje genérico. | Aprobado |
| CP-03 | HU-03 | Usuario inactivo no inicia sesión. | Aprobado |
| CP-04 | HU-02 | Rutas protegidas sin token responden 401. | Aprobado |
| CP-05 | HU-02 | Guarda en `GET /api/usuarios` recibe 403. | Aprobado |
| CP-06 | HU-03 | Crear usuario repetido responde 409. | Aprobado |
| CP-07 | HU-04 | `contrasena_hash` se almacena como hash bcrypt y no como contraseña en texto plano. | Aprobado |
| CP-08 | HU-05 | Capacidad cero, negativa, no numérica o fraccionaria responde 400. | Aprobado |
| CP-09 | HU-05 | Capacidad menor que los espacios ocupados responde 400. | Aprobado |
| CP-10 | HU-01 | La base rechaza carné o placa duplicados. | Aprobado |
| CP-11 | HU-01 | La base rechaza dos ingresos activos de la misma moto y permite un nuevo ingreso tras cerrar el anterior. | Aprobado |
| CP-12 | HU-01 | La base rechaza salidas sin ingreso existente o repetidas para un mismo ingreso. | Aprobado |

**Resumen:** 12 aprobados, 0 fallidos, 0 omitidos. La suite elimina sus registros de prueba,
restaura la capacidad original y recalcula los espacios de acuerdo con los ingresos activos
restantes. No debe ejecutarse mientras se registran operaciones reales en la misma base.

## Evidencia visual

- [Resumen visual de la ejecución CP-01 a CP-12](./evidencia-pruebas/resultado-cp-01-12.png).
- [Prototipo del panel del Administrador](./evidencia-pruebas/panel-administrador-prototipo.jpg).
- [Prototipo del panel del Guarda](./evidencia-pruebas/panel-guarda-prototipo.jpg).
- [Prototipo del inicio de sesión con error](./evidencia-pruebas/login-error-prototipo.jpg).

Los paneles y la pantalla de error son prototipos visuales; no son capturas de una sesión real.
La pantalla de inicio de sesión en ejecución se adjuntó en la conversación.
Los prototipos del Administrador y del Guarda muestran capacidad total y espacios disponibles de
400, en concordancia con el esquema y la capacidad consultada en la base local.

## Registro de ejecución del Sprint 1 (Tabla 8.2)

El estado de cierre conserva la distinción entre el trabajo terminado al 3 de noviembre y la
ejecución posterior de las pruebas.

| Tarea | Historia | Estado | Evidencia |
|---|---|---|---|
| T1 | HU-02 | Terminada | Decisión de Node.js con Express documentada en `README.md`. |
| T2 | HU-01 | Terminada según el registro y la evidencia suministrados | Tablas 4 y 5 y ajustes de la revisión. Esos documentos fuente no están anexos en este repositorio, por lo que su contenido no se pudo contrastar localmente. |
| T3 | HU-01, HU-05 | Terminada | `database/schema.sql`; modelo relacional y capacidad inicial de 400. |
| T4 | HU-01 | Terminada | Reglas de negocio en `docs/reglas-negocio-sprint1.md`; CP-10 a CP-12 ejercitan restricciones de integridad. |
| T5 | HU-02 | Terminada | Estructura `backend/` y `frontend/`, documentada en `README.md`. |
| T6 | HU-02, HU-04 | Código terminado al cierre; pruebas ejecutadas posteriormente | `backend/src/routes/auth.js`; CP-01 a CP-03 y CP-07 aprobados el 8 de noviembre. |
| T7 | HU-02 | Código terminado al cierre; pruebas ejecutadas posteriormente | `backend/src/middlewares/auth.js`; CP-04 y CP-05 aprobados el 8 de noviembre. |
| T8 | HU-03 | Código terminado al cierre; pruebas ejecutadas posteriormente | `backend/src/routes/usuarios.js` y `backend/src/services/usuarios.js`; CP-06 aprobado el 8 de noviembre. |
| T9 | HU-05 | Código terminado al cierre; pruebas ejecutadas posteriormente | `backend/src/routes/parqueadero.js` y `backend/src/services/parqueadero.js`; CP-08 y CP-09 aprobados el 8 de noviembre. |
| T10 | HU-02 | Terminada | `frontend/src/pages/Login.jsx`; prototipo de error de ingreso en `docs/prototipo/login_error.jpg`. |
| T11 | HU-02 | Prototipo construido; falta validación del Product Owner | Paneles en `docs/prototipo/guarda.jpg` y `docs/prototipo/admin.jpg`. La validación sigue pendiente. |
| T12 | HU-04 | Código terminado; nota de tratamiento registrada en este informe | `backend/src/middlewares/registrarAcceso.js` escribe en `backend/logs/accesos.log`; ver la nota de tratamiento siguiente. |
| T13 | HU-01 a HU-05 | Casos diseñados y automatizados al cierre; ejecución posterior registrada | `backend/tests/sprint1.test.js`; CP-01 a CP-12 aprobados con `npm test` el 8 de noviembre. |

## Nota de tratamiento del registro de accesos (T12)

El registro se utiliza para dejar trazabilidad de los intentos de inicio de sesión. Cada línea de
`backend/logs/accesos.log` contiene fecha y hora, identificador de usuario, dirección IP y resultado
(exitoso o fallido). La implementación no registra contraseñas. El código no define un plazo de
retención ni una rutina de depuración; ese plazo debe establecerse conforme a la política
institucional aplicable antes de fijar una eliminación automática.

## Alcance y pendientes

- CP-10 a CP-12 verifican restricciones de integridad directamente en MySQL. En este incremento no
  existe una ruta de API para registrar salidas.
- Las tablas 4 y 5 y los ajustes de T2 se registran como evidencia suministrada, pero no están
  disponibles en la carpeta del proyecto para una comprobación independiente.
- La validación del prototipo por el Product Owner (T11) permanece pendiente.
- No está definido en el código el plazo de retención del log de accesos (T12); debe confirmarse
  con la política institucional.
- Las pruebas requieren MySQL con el esquema aplicado y `backend/.env` válido.
