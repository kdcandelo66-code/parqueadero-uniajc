# Reglas de negocio del Sprint 2

## Integrantes y motocicletas

1. El carné es obligatorio, se normaliza a mayúsculas y no puede repetirse.
2. Nombre, documento, programa y correo son obligatorios; el teléfono es opcional.
3. Un nuevo integrante queda `NO AUTORIZADO` hasta que el Administrador cambie su estado.
4. Todo integrante no autorizado tiene un motivo visible; si aún no se ha definido, se muestra
   `Pendiente de autorización`.
5. La placa es obligatoria, se normaliza a mayúsculas y debe ser única.
6. Una motocicleta activa solo puede estar asociada a un integrante a la vez. Al cerrar la
   asociación se conserva el historial y la motocicleta puede asociarse nuevamente.

## Consulta e ingresos

7. El Administrador registra integrantes, motocicletas y cambios de autorización. Administrador y
   Guarda pueden consultar por carné y ver las asociaciones e ingresos históricos.
8. Solo una motocicleta activa asociada a un integrante activo y autorizado puede registrar ingreso.
9. Cada motocicleta puede tener un único ingreso activo; la restricción de base de datos del
   Sprint 1 protege también los intentos concurrentes.
10. No se registra ingreso cuando el parqueadero alcanzó su capacidad máxima.
11. El ingreso conserva el integrante, motocicleta, guarda responsable, fecha y estado del
    movimiento.

## Aplicar cambios

En una instalación existente, ejecutar una vez
[`2026-11-sprint2.sql`](../database/migrations/2026-11-sprint2.sql). Una base nueva obtiene las
columnas e índices necesarios directamente de [`schema.sql`](../database/schema.sql).
