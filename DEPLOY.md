# Guía de Despliegue y Configuración

Esta guía te ayudará a poner en marcha la aplicación en un entorno de producción.

## 1. Configuración de Google Cloud (Calendar API)

Para que la aplicación pueda crear eventos en tu calendario:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto (ej. "Marnissi Barbershop").
3. En el menú lateral, ve a **APIs y servicios > Biblioteca**.
4. Busca "Google Calendar API" y habilítala.
5. Ve a **APIs y servicios > Credenciales**.
6. Haz clic en **Crear credenciales > Cuenta de servicio**.
   - Nombre: `booking-service`
   - Rol: `Propietario` (o Editor).
7. Una vez creada, entra en la cuenta de servicio, ve a la pestaña **Claves** y crea una nueva clave **JSON**.
   - Se descargará un archivo `.json`. Ábrelo.
   - Copia el valor de `private_key` (todo el texto entre comillas, incluyendo `\n`) y `client_email`.
8. **IMPORTANTE**: Comparte tu calendario con la cuenta de servicio.
   - Ve a [Google Calendar](https://calendar.google.com/).
   - Ve a Configuración de tu calendario principal > "Compartir con personas específicas".
   - Añade el `client_email` de la cuenta de servicio (ej. `booking-service@...iam.gserviceaccount.com`) y dale permisos de **"Hacer cambios en eventos"**.
   - Copia el "ID del calendario" (suele ser tu email o un string largo en la sección "Integrar el calendario").

## 2. Configuración de Base de Datos (MongoDB Atlas)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Crea un cluster gratuito (M0).
3. En "Database Access", crea un usuario con contraseña.
4. En "Network Access", permite acceso desde cualquier IP (`0.0.0.0/0`).
5. Obtén la cadena de conexión (Connect > Drivers > Node.js).
   - Reemplaza `<password>` con tu contraseña.

## 3. Despliegue del Backend (Render / Railway)

Recomendamos **Render** por su facilidad de uso.

1. Sube tu código a GitHub.
2. En Render, crea un nuevo **Web Service**.
3. Conecta tu repositorio.
4. Configura:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. En la sección **Environment Variables**, añade:
   - `MONGO_URI`: Tu conexión de MongoDB.
   - `GOOGLE_CLIENT_EMAIL`: El email de la cuenta de servicio.
   - `GOOGLE_PRIVATE_KEY`: La clave privada (asegúrate de copiarla tal cual).
   - `GOOGLE_CALENDAR_ID`: El ID de tu calendario.
   - `EMAIL_USER`: Tu correo Gmail.
   - `EMAIL_PASS`: Tu "Contraseña de aplicación" de Google (Gestionar cuenta > Seguridad > Verificación en 2 pasos > Contraseñas de aplicaciones).
   - `CLIENT_URL`: La URL donde desplegarás el frontend (ej. `https://marnissi-frontend.vercel.app`).

## 4. Despliegue del Frontend (Vercel / Netlify)

Recomendamos **Vercel**.

1. En Vercel, importa tu repositorio.
2. Configura:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
3. En **Environment Variables**, añade:
   - `VITE_API_URL`: La URL de tu backend desplegado en Render (ej. `https://marnissi-backend.onrender.com/api`).
4. Despliega.

## 5. Verificación

1. Abre la URL de tu frontend.
2. Intenta hacer una reserva.
3. Verifica que:
   - Recibes el correo de confirmación.
   - El evento aparece en tu Google Calendar.
   - La franja horaria queda bloqueada si se alcanzan 2 reservas.
