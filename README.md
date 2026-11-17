# TP3 - Gestión de vehículos, conductores y viajes

Aplicación para registrar los vehículos de una empresa de transporte, sus conductores y los viajes realizados.
Trabajo práctico N.º 3 de Programación IV (UTN FRLR).

## Tecnologías

- **Backend:** Express.js, MySQL (mysql2), express-validator, Passport (JWT), bcrypt.
- **Frontend:** Vite + React (JavaScript), React Router y CSS puro.

## Cómo ejecutarlo

### 1. Base de datos

Crear la base en MySQL y ejecutar `backend/database.sql` para generar las tablas.

### 2. Backend

cd backend
npm install
cp .env.example .env # completar los datos de la base y JWT_SECRET
npm run dev

La API queda en `http://localhost:3000`.

### 3. Frontend

cd frontend
npm install
npm run dev

Por defecto usa `http://localhost:3000` como URL de la API. Para cambiarla, crear un `.env` con `VITE_API_URL`.

## Funcionalidades

- Registro e inicio de sesión con JWT (vence a las 4 horas).
- ABM de vehículos y conductores, con filtros.
- Registro de viajes asociando un vehículo y un conductor.
- Historial de viajes por vehículo o por conductor, con el total de kilómetros recorridos.

## Prueba de la API

Los archivos `.http` de la carpeta `backend` permiten probar cada ruta.
