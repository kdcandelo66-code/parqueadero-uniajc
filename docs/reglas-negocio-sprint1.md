# Reglas de negocio del Sprint 1

Reglas verificadas por el esquema y la implementación actuales. Las restricciones de integridad de datos se aplican en MySQL; las reglas de acceso y capacidad se aplican además en la API.

## Usuarios y acceso

1. Los roles permitidos son Administrador y Guarda.
2. Solo los usuarios activos pueden iniciar sesión.
3. Las contraseñas se guardan mediante bcrypt y nunca se devuelven en las respuestas de la API.
4. Las rutas protegidas requieren un token JWT válido.
5. Solo un Administrador puede consultar o gestionar usuarios. Un Guarda no puede listar usuarios.
6. El nombre de usuario es único.

## Estudiantes y motocicletas

7. El número de carné de un estudiante es único.
8. La placa de una motocicleta es única.
9. Los ingresos relacionan un estudiante, una motocicleta y el usuario responsable, todos existentes.
10. Una motocicleta no puede tener más de un ingreso activo. Al cerrar el ingreso puede registrarse otro.
11. Una salida debe referenciar un ingreso existente y cada ingreso admite como máximo una salida.

## Capacidad del parqueadero

12. La capacidad máxima debe ser un entero positivo.
13. La capacidad no puede reducirse por debajo de la cantidad de ingresos activos.
14. Al cambiar la capacidad, la API actualiza en una transacción la capacidad y los valores de ocupación, disponibilidad y porcentaje.

## Casos que las pruebas no cubren

- La base de datos rechaza salidas repetidas o sin ingreso, pero todavía no existe una ruta de salida en este incremento.
- Las reglas de autorización, asociación de motocicletas y registro de ingresos implementadas en el Sprint 2 están descritas en `docs/reglas-negocio-sprint2.md`. El tratamiento de novedades sigue pendiente.
