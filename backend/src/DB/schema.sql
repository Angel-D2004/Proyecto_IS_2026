-- =============================================================
-- Esquema de la base de datos del Sistema de Gestión Inmobiliaria
-- Motor: MySQL 8+
-- Uso:   mysql -u root -p < backend/src/DB/schema.sql
-- =============================================================

CREATE DATABASE IF NOT EXISTS `inmobiliaria`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `inmobiliaria`;

-- -------------------------------------------------------------
-- Clientes
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clientes` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`     VARCHAR(120) NOT NULL,
  `email`      VARCHAR(160) NOT NULL,
  `telefono`   VARCHAR(30)  NULL,
  `tipo`       ENUM('comprador', 'vendedor', 'inquilino', 'propietario')
               NOT NULL DEFAULT 'comprador',
  `direccion`  VARCHAR(255) NULL,
  `notas`      TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clientes_email` (`email`)
) ENGINE = InnoDB;

-- -------------------------------------------------------------
-- Propiedades
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `propiedades` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `titulo`      VARCHAR(180) NOT NULL,
  `direccion`   VARCHAR(255) NOT NULL,
  `tipo`        ENUM('casa', 'departamento', 'terreno', 'local', 'oficina')
                NOT NULL DEFAULT 'casa',
  `operacion`   ENUM('venta', 'alquiler') NOT NULL DEFAULT 'venta',
  `precio`      DECIMAL(14, 2) NOT NULL,
  `estado`      ENUM('disponible', 'reservada', 'vendida', 'alquilada')
                NOT NULL DEFAULT 'disponible',
  `descripcion` TEXT NULL,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_propiedades_estado` (`estado`),
  KEY `idx_propiedades_operacion` (`operacion`)
) ENGINE = InnoDB;

-- -------------------------------------------------------------
-- Citas
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `citas` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id`   INT UNSIGNED NOT NULL,
  `propiedad_id` INT UNSIGNED NOT NULL,
  `fecha`        DATE NOT NULL,
  `hora`         TIME NOT NULL,
  `estado`       ENUM('pendiente', 'confirmada', 'cancelada', 'realizada')
                 NOT NULL DEFAULT 'pendiente',
  `notas`        TEXT NULL,
  `created_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_citas_cliente` (`cliente_id`),
  KEY `idx_citas_propiedad` (`propiedad_id`),
  KEY `idx_citas_fecha` (`fecha`),
  CONSTRAINT `fk_citas_cliente`
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_propiedad`
    FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB;

-- -------------------------------------------------------------
-- Ventas
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ventas` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id`   INT UNSIGNED NOT NULL,
  `propiedad_id` INT UNSIGNED NOT NULL,
  `fecha`        DATE NOT NULL,
  `monto`        DECIMAL(14, 2) NOT NULL,
  `comision`     DECIMAL(14, 2) NOT NULL DEFAULT 0,
  `estado`       ENUM('en_proceso', 'cerrada', 'cancelada') NOT NULL DEFAULT 'en_proceso',
  `notas`        TEXT NULL,
  `created_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ventas_cliente` (`cliente_id`),
  KEY `idx_ventas_propiedad` (`propiedad_id`),
  KEY `idx_ventas_estado` (`estado`),
  CONSTRAINT `fk_ventas_cliente`
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ventas_propiedad`
    FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB;
