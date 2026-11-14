CREATE DATABASE IF NOT EXISTS transporte
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE transporte;

-- Usuarios de la aplicación (la contraseña se guarda encriptada con bcrypt)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Vehículos de la empresa de transporte
CREATE TABLE vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  patente VARCHAR(10) NOT NULL UNIQUE,
  anio SMALLINT NOT NULL,
  capacidad_carga DECIMAL(10, 2) NOT NULL
);

-- Conductores
CREATE TABLE conductores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  numero_licencia VARCHAR(20) NOT NULL UNIQUE,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL
);

-- Viajes: cada viaje se asocia a un vehículo y a un conductor
CREATE TABLE viajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id INT NOT NULL,
  conductor_id INT NOT NULL,
  fecha_salida DATETIME NOT NULL,
  fecha_llegada DATETIME NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  kilometros DECIMAL(10, 2) NOT NULL,
  observaciones VARCHAR(255) NULL,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos (id),
  FOREIGN KEY (conductor_id) REFERENCES conductores (id)
);