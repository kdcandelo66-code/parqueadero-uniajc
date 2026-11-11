-- Cambios para instalaciones que ya tienen aplicado database/schema.sql.
-- Ejecutar una sola vez. Una base nueva ya incluye estos cambios en schema.sql.
USE parqueadero_uniajc;

ALTER TABLE estudiantes
  ADD COLUMN motivo_bloqueo VARCHAR(300) NULL AFTER estado_autorizacion;

ALTER TABLE estudiante_motocicleta
  ADD COLUMN motocicleta_activa INT
    GENERATED ALWAYS AS (IF(fecha_fin IS NULL, id_motocicleta, NULL)) STORED,
  ADD UNIQUE KEY uq_motocicleta_asociada_activa (motocicleta_activa);
