# Registro de ejecución del Sprint 2

| Actividad | Estado | Fecha de inicio | Fecha de fin |
|---|---|---|---|
| Sprint 2 (general) | En curso | 3 de noviembre de 2026 | 17 de noviembre de 2026 (prevista) |
| T1 (HU-06) | Diseño elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T2 (HU-06) | Código elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T3 (HU-06) | Código elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T4 (HU-07) | Diseño elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T5 (HU-07) | Código elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T6 (HU-07) | Código elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T7 (HU-08) | Código elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T8 (HU-09) | Diseño elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T9 (HU-09) | Código elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T10 (HU-10) | Código elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T11 (HU-11) | Código elaborado | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T12 (HU-06 a HU-11) | Seis casos automatizados, uno por historia; suite completa 22/22 aprobada | 21 de noviembre de 2026 | 21 de noviembre de 2026 |
| T13 (HU-02) | Por iniciar | Por registrar | Por registrar |

La suite automatizada está en [`backend/tests/sprint2.test.js`](../backend/tests/sprint2.test.js).
El detalle de las reglas implementadas está en
[`reglas-negocio-sprint2.md`](./reglas-negocio-sprint2.md).
La retrospectiva y la propuesta de objetivo y alcance para el Sprint 3 están en
[`retrospectiva-y-planning-sprint3.md`](./retrospectiva-y-planning-sprint3.md).

## Evidencias visuales

Las capturas nuevas se tomaron con datos sintéticos de prueba y respuestas del backend activo.

## Casos automatizados por historia

| Caso | Historia | Cobertura |
|---|---|---|
| CP-13 | HU-06 | Registra un integrante y rechaza el carné duplicado. |
| CP-14 | HU-07 | Registra una motocicleta asociada y rechaza la placa duplicada. |
| CP-15 | HU-09 | Consulta por carné y muestra autorización y motocicleta asociada. |
| CP-16 | HU-11 | Autoriza al integrante y registra un ingreso activo. |
| CP-17 | HU-08 | Consulta el historial asociado al integrante y su motocicleta. |
| CP-18 | HU-10 | Rechaza ingresos no autorizados y al alcanzar la capacidad máxima. |

| Tarea / historia | Evidencia |
|---|---|
| T1 y T4 (HU-06, HU-07): formularios de integrante y motocicleta | [Registro de integrante y motocicleta](./evidencia-pruebas/sprint2-registro-integrante-motocicleta.png) |
| T2 y T3 (HU-06, CP-13): carné duplicado rechazado en la aplicación | [Rechazo de carné duplicado](./evidencia-pruebas/sprint2-hu06-rechazo-carne-duplicado.png) |
| T3 y T10 (HU-06, HU-10): integrante no autorizado y motivo | [Autorización pendiente](./evidencia-pruebas/sprint2-autorizacion.png), [consulta no autorizada](./evidencia-pruebas/sprint2-consulta-no-autorizado.png) |
| T3 y T10 (HU-06, HU-10): cambio a autorizado | [Autorización aprobada](./evidencia-pruebas/sprint2-autorizacion-aprobada.png), [consulta autorizada](./evidencia-pruebas/sprint2-consulta-autorizado.png) |
| T8 y T9 (HU-09): consulta por carné y motocicleta asociada | [Consulta no autorizada](./evidencia-pruebas/sprint2-consulta-no-autorizado.png), [consulta autorizada](./evidencia-pruebas/sprint2-consulta-autorizado.png) |
| T11 (HU-11, CP-16): ingreso registrado y activo | [Ingreso activo](./evidencia-pruebas/sprint2-ingreso-activo.png) |
| T4 a T6 (HU-07, CP-14): estado de motocicleta, asociación y placa repetida | [Formulario con estado y asociación](./evidencia-pruebas/sprint2-hu07-registro-motocicleta.png), [rechazo de placa duplicada (mensaje visible junto al formulario)](./evidencia-pruebas/sprint2-hu07-placa-duplicada-detalle.png) |
| T7 (HU-08, CP-17): historial por integrante y motocicletas asociadas | [Historial del integrante](./evidencia-pruebas/sprint2-hu08-historial-integrante.png) |
| T8 y T9 (HU-09): autorización, programa, motocicleta, estado actual y último ingreso | [Consulta por carné](./evidencia-pruebas/sprint2-hu09-consulta-carne.png) |
| T10 (HU-10, CP-18): rechazo al alcanzar la capacidad máxima | [Rechazo verificado con ocupación 400/400](./evidencia-pruebas/sprint2-hu10-rechazo-capacidad-verificado.png) |

La captura anterior [sprint2-hu10-rechazo-capacidad.png](./evidencia-pruebas/sprint2-hu10-rechazo-capacidad.png)
es ilustrativa; la nueva evidencia se obtuvo al registrar el ingreso en la aplicación contra el
backend y la base de datos locales.

## Sesión de aceptación

La sesión con el Guarda y el Administrador sigue pendiente de realizar. El guion y el acta para
registrar participantes, resultados y observaciones están en
[`acta-aceptacion-sprint2.md`](./acta-aceptacion-sprint2.md). Las pruebas automatizadas y capturas
no se presentan como sustituto de esa aceptación.

Las capturas verifican los mensajes de rechazo en la interfaz real. Para HU-10 se mantuvo la
capacidad máxima en 400 y se generaron temporalmente 400 ingresos sintéticos para probar el intento
401; la capacidad no se redujo. Los registros de prueba se eliminaron al finalizar.
