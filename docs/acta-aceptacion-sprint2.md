# Acta de aceptación del Sprint 2

**Estado:** Pendiente de realizar con un Guarda y un Administrador.  
**Fecha y hora:** Por programar.  
**Modalidad / lugar:** Por registrar.  
**Versión evaluada:** Por registrar.

Esta acta es un guion de sesión, no evidencia de una aceptación ya realizada. La sesión debe
ejecutarse con las personas participantes en la aplicación y sus observaciones deben quedar aquí.

## Participantes

| Rol | Nombre | Firma / confirmación |
|---|---|---|
| Guarda | Por registrar | Por registrar |
| Administrador | Por registrar | Por registrar |
| Facilitador / observador | Por registrar | Por registrar |

## Preparación

- Usar una base de pruebas, nunca una base con operaciones reales.
- Crear datos sintéticos para carné, motocicletas, autorizaciones e ingresos.
- Registrar la capacidad original y restaurarla al terminar HU-10.
- No guardar contraseñas ni datos personales reales en capturas o en esta acta.

## Casos de aceptación

| Caso | Historia | Participante principal | Criterio observable | Resultado / observaciones |
|---|---|---|---|---|
| CP-13 | HU-06 | Administrador | Registrar un integrante y volver a enviar el mismo carné. La aplicación rechaza el duplicado y conserva el registro original. | Pendiente |
| CP-14 | HU-07 | Administrador | Registrar una motocicleta asociada y volver a enviar la misma placa. La aplicación rechaza el duplicado. | Pendiente |
| CP-15 | HU-09 | Guarda y Administrador | Consultar por carné y verificar los datos, el estado de autorización y la motocicleta asociada. | Pendiente |
| CP-16 | HU-11 | Guarda | Registrar el ingreso de una motocicleta activa, asociada y autorizada; comprobar que aparece como ingreso activo. | Pendiente |
| CP-17 | HU-08 | Guarda y Administrador | Consultar el historial por carné y comprobar la asociación y sus movimientos. | Pendiente |
| CP-18 | HU-10 | Administrador y Guarda | Mantener la capacidad máxima en 400; con 400 ingresos activos, el Guarda intenta un nuevo ingreso y la aplicación lo rechaza sin aumentar la ocupación. Eliminar después los datos sintéticos. | Pendiente |

## Cierre de la sesión

**Resultado general:** Pendiente.  
**Observaciones y acuerdos:** Por registrar durante la sesión.  
**Historias aceptadas:** Por registrar.  
**Historias con ajustes requeridos:** Por registrar.  
**Responsables y fechas de seguimiento:** Por registrar.

La ejecución automatizada y las capturas locales están documentadas en
[`registro-ejecucion-sprint2.md`](./registro-ejecucion-sprint2.md); no reemplazan las decisiones ni
la confirmación de los participantes.
