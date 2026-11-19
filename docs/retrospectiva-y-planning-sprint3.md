# Retrospectiva del Sprint 2, planificación y retrospectiva del Sprint 3

> **Nota:** estas retrospectivas son propuestas basadas en el código, las pruebas y las evidencias
> del repositorio. No representan comentarios recopilados del equipo; validar y ajustar sus
> resultados y acciones durante la reunión de retrospectiva.

## Retrospectiva del Sprint 2

| Qué funcionó | Qué no funcionó o quedó pendiente | Acción de mejora para Sprint 3 |
|---|---|---|
| Se conectaron los formularios de integrantes y motocicletas con la API y la base de datos. | El registro inicial deja al integrante no autorizado; el flujo de autorización depende de una acción posterior del Administrador. | Confirmar con Product Owner quién autoriza, qué evidencia se requiere y cómo se revoca una autorización. |
| Las validaciones de carné y placa duplicados, autorización y datos obligatorios se prueban automáticamente. | La suite confirma la integración del Sprint 2, pero no sustituye pruebas de aceptación con Guarda y Administrador. | Incluir una sesión de aceptación con ambos roles y registrar resultados y observaciones. |
| La API impide ingresos de integrantes no autorizados y evita ingresos activos duplicados; la base de datos protege la integridad. | No hay un flujo de salida implementado para cerrar un ingreso activo. Esto impide completar el ciclo de permanencia del vehículo. | Priorizar la salida como una historia del Sprint 3, con cierre transaccional del ingreso y registro de quién la atendió. |
| Se implementaron consulta por carné, motivo de bloqueo, asociaciones e historial; hay capturas como evidencia. | El registro de novedades sigue pendiente; los requerimientos de detalle deben confirmarse contra la historia y el Product Owner. | Acordar campos, permisos, consulta y evidencia de cada novedad antes de iniciar su implementación. |
| La suite completa reportó 16/16 pruebas aprobadas y el frontend compiló correctamente. | La base existente necesita una migración manual para recibir los cambios de Sprint 2. | Incorporar revisión de migración, respaldo y verificación de esquema a la lista de preparación y despliegue. |
| Se documentaron reglas de negocio y se guardaron capturas de los principales flujos. | Las fechas individuales de las tareas y la retroalimentación de cada integrante no están registradas. | Registrar inicio, fin, bloqueos y acuerdos en cada tarea; validar esta retrospectiva con el equipo y añadir sus comentarios. |

## Sprint Planning del Sprint 3

### Objetivo del Sprint

**Completar el ciclo de control del parqueadero desde el registro de ingreso y salida hasta el
seguimiento de ocupación, novedades, historial y reportes, con trazabilidad y pruebas funcionales
para los roles de Guarda y Administrador.**

Este objetivo es una propuesta y debe ser aprobado por el Product Owner y el equipo antes de iniciar
el Sprint.

### Backlog comprometido y resultados

| Tarea | Historia | Resultado implementado |
|---|---|---|
| T1. Pantalla de salida | HU-12 | Formulario para buscar un ingreso activo y registrar su salida desde el panel del Guarda. |
| T2. Búsqueda por carné o placa | HU-12 | Consulta exacta, sin distinguir mayúsculas, disponible en la pantalla de salida. |
| T3. Salida y permanencia | HU-12 | Cierre transaccional con fecha, responsable y permanencia en minutos; rechaza cierre duplicado. |
| T4. Ocupación | HU-13 | Ocupados, disponibles y porcentaje se recalculan con cada ingreso y salida. |
| T5. Capacidad máxima | HU-13 | Se rechazan ingresos al completar capacidad y reducciones de capacidad por debajo de ocupación. |
| T6. Panel del Guarda | HU-14 | Indicadores, ingresos activos, salidas recientes, formulario de novedades e historial. |
| T7. Consultas y alertas | HU-14 | Búsqueda de integrantes y de ingresos activos; novedades recientes y mensajes de validación visibles. |
| T8. Registro de novedades | HU-15 | Fecha, descripción, usuario responsable y vínculos opcionales por carné y placa. |
| T9. Historial | HU-16 | Consulta por carné o placa con ingresos, salidas, permanencia y responsables. |
| T10. Reportes | HU-17 | El Administrador consulta totales y movimientos por periodo, además de la ocupación actual. |
| T11. Integración y pruebas | HU-12 a HU-17 | Pruebas de API para salidas, búsquedas, ocupación, novedades, historial y permisos de reportes; evidencia en [`registro-ejecucion-sprint3.md`](./registro-ejecucion-sprint3.md). |
| T12. Correcciones y entrega | HU-12 a HU-17 | Guía de ejecución, reglas de negocio, alcance y resultados documentados; suite y compilación verificadas. |

### Dependencias y acuerdos antes de comprometer el Sprint

- Confirmar con el Product Owner la aceptación del alcance, campos y criterios de las historias.
- Refinar las historias, estimarlas y revisar la capacidad real del equipo; no hay estimaciones ni
  asignaciones individuales disponibles en este registro.
- Verificar que la base de datos de cada entorno tenga el esquema actualizado antes de ejecutar
  pruebas de integración.
- Acordar responsables y fechas de inicio/fin durante la reunión de planificación.
- Mantener fuera del Sprint cualquier historia no refinada o que no contribuya al objetivo, salvo
  que el Product Owner y el equipo ajusten explícitamente el alcance.

### Definición de terminado propuesta

- Criterios de aceptación aprobados por Product Owner.
- Validaciones y permisos implementados en backend y reflejados en la interfaz.
- Pruebas automatizadas relevantes aprobadas y suite existente sin regresiones.
- Build de frontend exitoso.
- Migraciones y reglas documentadas; datos de prueba limpiados.
- Evidencia visual y estado de las tareas actualizados.

### Verificación del incremento implementado

- Backend: `npm test` — 20 pruebas aprobadas, 0 fallidas (17 de noviembre de 2026).
- Frontend: `npm run build` — compilación exitosa (17 de noviembre de 2026).
- Salidas completas de ambas ejecuciones en [`docs/evidencia-pruebas`](./evidencia-pruebas/).
- No se añadió migración: las tablas y columnas usadas por HU-12 a HU-17 ya existen en el
  esquema actual.
- Las pruebas crean y eliminan sus propios registros sintéticos.

## Retrospectiva del Sprint 3

> Propuesta basada en la implementación y la ejecución del 17 de noviembre de 2026. No se cuenta
> con comentarios individuales ni aprobación formal del Product Owner en este registro.

| Qué funcionó | Qué quedó pendiente o presentó dificultades | Acción para el siguiente sprint |
|---|---|---|
| Se completó el ciclo de ingreso y salida: el cierre registra responsable, hora y permanencia, y recalcula la ocupación. | La compilación de Vite no detectó un error de renderizado del panel administrativo (`Indicador` sin definir); se encontró al abrir el panel en el navegador y se corrigió. | Añadir una comprobación de ejecución del frontend con sesión de prueba para ambos roles, además del build. |
| El panel del Guarda reúne búsqueda, movimientos recientes, novedades e historial; el Administrador dispone de reportes. | Las verificaciones automatizadas cubren principalmente contratos de API; las capturas manuales no sustituyen una aceptación formal de Guarda y Administrador. | Acordar un guion de aceptación por historia, ejecutarlo con ambos roles y guardar observaciones y evidencias. |
| La suite completa terminó con 20 pruebas aprobadas y se conservaron salidas de prueba, build y capturas de la interfaz. | No hay responsables, estimaciones ni fechas individuales registradas para las tareas del backlog. | Asignar responsables y estimaciones en la planificación, y registrar fechas, avances y bloqueos durante el sprint. |
| Las pruebas y capturas utilizaron datos sintéticos, que se limpiaron al terminar. | No consta aprobación del Product Owner para los criterios de aceptación ni retroalimentación del equipo. | Obtener y registrar la aprobación del Product Owner y los acuerdos del equipo antes de dar por aceptadas las historias. |

### Evidencias del cierre

- [Registro de ejecución y capturas del Sprint 3](./registro-ejecucion-sprint3.md).
- [Captura del panel del Guarda](./evidencia-pruebas/sprint3-panel-guarda.png).
- [Captura de salida registrada](./evidencia-pruebas/sprint3-salida-registrada-guarda.png).
- [Captura del historial y novedades](./evidencia-pruebas/sprint3-historial-integrante.png).
- [Captura del reporte del Administrador](./evidencia-pruebas/sprint3-reporte-administrador.png).
