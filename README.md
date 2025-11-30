# Marnissi Barbershop Booking System

Sistema profesional de reservas para Marnissi Barbershop.

## Características
- Reserva de citas online.
- Gestión de horarios (Lunes-Sábado, 9-14h y 16-21h).
- Integración con Google Calendar (Service Account).
- Notificaciones por email.
- Cancelación automática.
- Diseño Premium y Responsive.

## Requisitos Previos
- Node.js (v16 o superior)
- MongoDB (Local o Atlas)
- Cuenta de Google Cloud (para Calendar API)
- Cuenta de Gmail (para envío de correos)

## Instalación Local

### 1. Clonar y Configurar Backend
```bash
cd server
npm install
cp .env.example .env
```
Edita el archivo `.env` con tus credenciales (ver `DEPLOY.md` para detalles).

Para iniciar el servidor:
```bash
npm run dev
```

### 2. Configurar Frontend
En una nueva terminal:
```bash
cd client
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Estructura del Proyecto
- `client/`: Frontend en React + Vite.
- `server/`: Backend en Node.js + Express.
