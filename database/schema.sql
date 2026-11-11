-- =====================================================================
-- Sistema de gestión y control de acceso del parqueadero de motocicletas
-- Institución Universitaria Antonio José Camacho (Sede Norte)
-- Sprint 1 · Tarea T3 (HU-01, HU-05) · Motor: MySQL 8.0 o superior
-- =====================================================================
-- Ejecutar:  mysql -u root -p < database/schema.sql
-- Los usuarios iniciales NO se crean aquí: se crean con
-- `npm run crear-admin` (backend) para que la contraseña quede con bcrypt.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS parqueadero_uniajc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parqueadero_uniajc;

DROP TABLE IF EXISTS novedades, salidas, ingresos, espacios, parqueadero,
  estudiante_motocicleta, motocicletas, estudiantes, usuarios, roles;

CREATE TABLE roles (
  id_rol       INT AUTO_INCREMENT PRIMARY KEY,
  nombre       ENUM('Administrador','Guarda') NOT NULL UNIQUE,
  descripcion  VARCHAR(150)
);

CREATE TABLE usuarios (
  id_usuario       INT AUTO_INCREMENT PRIMARY KEY,
  id_rol           INT NOT NULL,
  nombre_completo  VARCHAR(120) NOT NULL,
  usuario          VARCHAR(50)  NOT NULL UNIQUE,
  contrasena_hash  VARCHAR(100) NOT NULL,           -- hash bcrypt, nunca texto plano
  estado           ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE estudiantes (
  id_estudiante         INT AUTO_INCREMENT PRIMARY KEY,
  numero_carne          VARCHAR(30)  NOT NULL UNIQUE,
  nombre_completo       VARCHAR(120) NOT NULL,
  documento_identidad   VARCHAR(30)  NOT NULL,
  programa_academico    VARCHAR(100) NOT NULL,
  correo_institucional  VARCHAR(120) NOT NULL,
  telefono              VARCHAR(20)  NULL,
  estado_autorizacion   ENUM('AUTORIZADO','NO AUTORIZADO') NOT NULL DEFAULT 'NO AUTORIZADO',
  estado                ENUM('activo','inactivo') NOT NULL DEFAULT 'activo'
);

CREATE TABLE motocicletas (
  id_motocicleta  INT AUTO_INCREMENT PRIMARY KEY,
  placa           VARCHAR(10) NOT NULL UNIQUE,
  tipo            VARCHAR(30) NOT NULL,
  marca           VARCHAR(40) NOT NULL,
  modelo          VARCHAR(20) NOT NULL,
  color           VARCHAR(30) NOT NULL,
  estado          ENUM('activa','inactiva') NOT NULL DEFAULT 'activa'
);

CREATE TABLE estudiante_motocicleta (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante       INT NOT NULL,
  id_motocicleta      INT NOT NULL,
  nombre_propietario  VARCHAR(120) NULL,
  fecha_inicio        DATE NOT NULL,
  fecha_fin           DATE NULL,
  FOREIGN KEY (id_estudiante)  REFERENCES estudiantes(id_estudiante),
  FOREIGN KEY (id_motocicleta) REFERENCES motocicletas(id_motocicleta)
);

CREATE TABLE parqueadero (
  id_parqueadero    INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(80) NOT NULL,
  capacidad_maxima  INT NOT NULL CHECK (capacidad_maxima > 0)
);

CREATE TABLE espacios (
  id_espacio                INT AUTO_INCREMENT PRIMARY KEY,
  id_parqueadero            INT NOT NULL,
  espacios_ocupados         INT NOT NULL DEFAULT 0,
  espacios_disponibles      INT NOT NULL,
  porcentaje_ocupacion      DECIMAL(5,2) NOT NULL DEFAULT 0,
  fecha_hora_actualizacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_parqueadero) REFERENCES parqueadero(id_parqueadero)
);

CREATE TABLE ingresos (
  id_ingreso          INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante       INT NOT NULL,
  id_motocicleta      INT NOT NULL,
  id_usuario          INT NOT NULL,                 -- guarda responsable
  fecha_hora_ingreso  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado_movimiento   ENUM('activo','cerrado') NOT NULL DEFAULT 'activo',
  -- Regla: una motocicleta no puede tener dos ingresos activos
  moto_activa INT GENERATED ALWAYS AS (IF(estado_movimiento = 'activo', id_motocicleta, NULL)) STORED,
  UNIQUE KEY uq_una_entrada_activa (moto_activa),
  FOREIGN KEY (id_estudiante)  REFERENCES estudiantes(id_estudiante),
  FOREIGN KEY (id_motocicleta) REFERENCES motocicletas(id_motocicleta),
  FOREIGN KEY (id_usuario)     REFERENCES usuarios(id_usuario)
);

CREATE TABLE salidas (
  id_salida           INT AUTO_INCREMENT PRIMARY KEY,
  id_ingreso          INT NOT NULL UNIQUE,          -- uno a uno con su ingreso
  id_usuario          INT NOT NULL,                 -- guarda responsable
  fecha_hora_salida   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tiempo_permanencia  INT NULL COMMENT 'minutos',
  FOREIGN KEY (id_ingreso) REFERENCES ingresos(id_ingreso),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE novedades (
  id_novedad      INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  fecha_hora      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  numero_carne    VARCHAR(30) NULL,
  placa           VARCHAR(10) NULL,
  descripcion     VARCHAR(300) NOT NULL,
  id_estudiante   INT NULL,
  id_motocicleta  INT NULL,
  FOREIGN KEY (id_usuario)     REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_estudiante)  REFERENCES estudiantes(id_estudiante),
  FOREIGN KEY (id_motocicleta) REFERENCES motocicletas(id_motocicleta)
);

-- ------------------------- Datos iniciales ---------------------------
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Gestiona integrantes, motocicletas, usuarios, espacios y reportes'),
  ('Guarda',        'Valida, registra ingresos y salidas, y registra novedades');

-- Capacidad máxima del parqueadero (HU-05)
INSERT INTO parqueadero (nombre, capacidad_maxima)
VALUES ('Parqueadero de motocicletas Sede Norte', 400);

INSERT INTO espacios (id_parqueadero, espacios_ocupados, espacios_disponibles, porcentaje_ocupacion)
SELECT id_parqueadero, 0, capacidad_maxima, 0 FROM parqueadero;
