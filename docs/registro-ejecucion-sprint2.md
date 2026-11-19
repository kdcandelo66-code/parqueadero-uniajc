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
| T12 (HU-06 a HU-11) | Casos automatizados y ejecutados; 4/4 del Sprint 2 aprobados (16/16 en la suite completa) | 11 de noviembre de 2026 | 11 de noviembre de 2026 |
| T13 (HU-02) | Por iniciar | Por registrar | Por registrar |

La suite automatizada está en [`backend/tests/sprint2.test.js`](../backend/tests/sprint2.test.js).
El detalle de las reglas implementadas está en
[`reglas-negocio-sprint2.md`](./reglas-negocio-sprint2.md).
La retrospectiva y la propuesta de objetivo y alcance para el Sprint 3 están en
[`retrospectiva-y-planning-sprint3.md`](./retrospectiva-y-planning-sprint3.md).

## Evidencias visuales

Las capturas se tomaron con datos sintéticos de prueba.

| Tarea / historia | Evidencia |
|---|---|
| T1 y T4 (HU-06, HU-07): formularios de integrante y motocicleta | [Registro de integrante y motocicleta](./evidencia-pruebas/sprint2-registro-integrante-motocicleta.png) |
| T3 y T10 (HU-06, HU-10): integrante no autorizado y motivo | [Autorización pendiente](./evidencia-pruebas/sprint2-autorizacion.png), [consulta no autorizada](./evidencia-pruebas/sprint2-consulta-no-autorizado.png) |
| T3 y T10 (HU-06, HU-10): cambio a autorizado | [Autorización aprobada](./evidencia-pruebas/sprint2-autorizacion-aprobada.png), [consulta autorizada](./evidencia-pruebas/sprint2-consulta-autorizado.png) |
| T8 y T9 (HU-09): consulta por carné y motocicleta asociada | [Consulta no autorizada](./evidencia-pruebas/sprint2-consulta-no-autorizado.png), [consulta autorizada](./evidencia-pruebas/sprint2-consulta-autorizado.png) |
| T11 (HU-11): ingreso registrado y activo | [Ingreso activo](./evidencia-pruebas/sprint2-ingreso-activo.png) |
| T4 a T6 (HU-07, CP-14): estado de motocicleta, asociación y placa repetida | [Formulario con estado y asociación](./evidencia-pruebas/sprint2-hu07-registro-motocicleta.png), [rechazo de placa duplicada (mensaje visible junto al formulario)](./evidencia-pruebas/sprint2-hu07-placa-duplicada-detalle.png) |
| T7 (HU-08, CP-16): historial por integrante y motocicletas asociadas | [Historial del integrante](./evidencia-pruebas/sprint2-hu08-historial-integrante.png) |
| T8 y T9 (HU-09): autorización, programa, motocicleta, estado actual y último ingreso | [Consulta por carné](./evidencia-pruebas/sprint2-hu09-consulta-carne.png) |
| T10 (HU-10, CP-17): rechazo al alcanzar la capacidad máxima | [Rechazo con ocupación 400/400](./evidencia-pruebas/sprint2-hu10-rechazo-capacidad.png) |

Las capturas nuevas usan datos sintéticos y respuestas de API simuladas; la evidencia 400/400
ilustra el rechazo por capacidad sin modificar la capacidad ni los datos de la base configurada.
