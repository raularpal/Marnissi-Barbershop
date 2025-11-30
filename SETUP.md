# Marnissi Barbershop - Guía de Configuración con Supabase

Esta guía te ayudará a configurar y desplegar la aplicación de reservas usando **Supabase** y **EmailJS**.

## 📋 Requisitos Previos

1. **Cuenta de Supabase** (gratuita - más fácil que Firebase)
2. **Cuenta de EmailJS** (gratuita)
3. **Hosting** (Vercel, Netlify, o GitHub Pages)

---

## 🚀 Paso 1: Configurar Supabase (5 minutos)

### 1.1 Crear Proyecto
1. Ve a [Supabase](https://supabase.com/)
2. Haz clic en "Start your project"
3. Crea una cuenta (puedes usar GitHub)
4. Haz clic en "New Project"
   - **Name:** `marnissi-barbershop`
   - **Database Password:** Crea una contraseña segura (guárdala)
   - **Region:** Europe West (London) - el más cercano
5. Espera 1-2 minutos mientras se crea el proyecto

### 1.2 Crear la Tabla de Citas
1. En el menú lateral, ve a **SQL Editor**
2. Haz clic en "New Query"
3. Copia y pega este código SQL:

```sql
-- Crear tabla de citas
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  date_string TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por fecha
CREATE INDEX idx_appointments_date ON appointments(date_string);

-- Habilitar Row Level Security (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Permitir lectura y escritura a todos (para desarrollo)
CREATE POLICY "Enable read access for all users" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON appointments
  FOR DELETE USING (true);
```

4. Haz clic en **Run** (o presiona Ctrl+Enter)
5. Deberías ver "Success. No rows returned"

### 1.3 Obtener las Credenciales
1. Ve a **Settings** (icono de engranaje) → **API**
2. Encontrarás:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** Una clave larga que empieza con `eyJ...`
3. Copia ambos valores

### 1.4 Actualizar config.js
Abre el archivo `config.js` y reemplaza:

```javascript
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

✅ **¡Supabase configurado!** Mucho más simple que Firebase, ¿verdad?

---

## 📧 Paso 2: Configurar EmailJS (5 minutos)

### 2.1 Crear Cuenta
1. Ve a [EmailJS](https://www.emailjs.com/)
2. Regístrate gratis (200 emails/mes)

### 2.2 Conectar Servicio de Email
1. Ve a **Email Services**
2. Haz clic en "Add New Service"
3. Selecciona **Gmail** (o tu proveedor)
4. Conecta tu cuenta de Gmail
5. Copia el **Service ID** (ej: `service_abc123`)

### 2.3 Crear Plantilla de Email
1. Ve a **Email Templates**
2. Haz clic en "Create New Template"
3. **Template Name:** `booking_confirmation`

**Subject:**
```
Confirmación de Cita - Marnissi Barbershop
```

**Content (HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #ffffff; padding: 40px; border-radius: 12px;">
    <h1 style="color: #d4af37; text-align: center;">Marnissi Barbershop</h1>
    
    <p>Hola <strong>{{to_name}}</strong>,</p>
    
    <p>Tu cita ha sido confirmada con éxito.</p>
    
    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📅 Fecha:</strong> {{appointment_date}}</p>
        <p><strong>🕐 Hora:</strong> {{appointment_time}}</p>
    </div>
    
    <p>Si necesitas cancelar tu cita, haz clic en el siguiente botón:</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{cancel_url}}" style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Cancelar Cita
        </a>
    </div>
    
    <p style="color: #a0a0a0; font-size: 14px; margin-top: 30px;">
        Gracias por confiar en Marnissi Barbershop
    </p>
</div>
```

4. Guarda la plantilla
5. Copia el **Template ID** (ej: `template_xyz789`)

### 2.4 Obtener Public Key
1. Ve a **Account** → **General**
2. Copia tu **Public Key**

### 2.5 Actualizar config.js
```javascript
const EMAILJS_PUBLIC_KEY = "tu_public_key_aqui";
const EMAILJS_SERVICE_ID = "service_abc123";
const EMAILJS_TEMPLATE_ID = "template_xyz789";
```

---

## 🌐 Paso 3: Desplegar en Vercel (2 minutos)

### 3.1 Subir a GitHub
1. Crea un nuevo repositorio en GitHub
2. Sube estos archivos:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
   - `translations.js`

### 3.2 Desplegar en Vercel
1. Ve a [Vercel](https://vercel.com/)
2. Haz clic en "Import Project"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
5. Haz clic en "Deploy"
6. Espera 30 segundos... ✅ ¡Desplegado!

### 3.3 Actualizar APP_URL
Una vez desplegado, copia la URL (ej: `https://marnissi-barbershop.vercel.app`)

Actualiza en `config.js`:
```javascript
const APP_URL = "https://marnissi-barbershop.vercel.app";
```

Haz commit y push. Vercel se actualizará automáticamente.

---

## ✅ Paso 4: Probar la Aplicación

1. Abre tu URL de Vercel
2. Haz clic en "Reservar Cita"
3. Selecciona fecha y hora
4. Completa el formulario con tu email real
5. Verifica que:
   - ✅ La cita aparece en Supabase (ve a Table Editor → appointments)
   - ✅ Recibes el email de confirmación
   - ✅ El botón "Cancelar Cita" del email funciona
   - ✅ Al cancelar, la cita se elimina de Supabase

---

## 🎯 Ventajas de Supabase vs Firebase

✅ **Más simple** - Solo 2 pasos vs 8 de Firebase  
✅ **SQL directo** - Puedes ver y editar datos fácilmente  
✅ **Open source** - No dependes de Google  
✅ **Mejor plan gratuito** - 500MB de BD vs 1GB de Firebase  
✅ **Más rápido** - Consultas PostgreSQL optimizadas  

---

## 🔧 Solución de Problemas

### No se guardan las citas
1. Ve a Supabase → **Table Editor** → appointments
2. Verifica que la tabla existe
3. Revisa la consola del navegador (F12) para errores
4. Asegúrate de que las políticas RLS estén activas

### No se envían emails
- Verifica que el Service ID y Template ID sean correctos
- Revisa la consola del navegador para errores
- Asegúrate de que EmailJS esté conectado a tu Gmail

### Ver las citas guardadas
1. Ve a Supabase → **Table Editor**
2. Haz clic en la tabla `appointments`
3. Verás todas las reservas en tiempo real

---

## 📱 Características Implementadas

✅ Reserva de citas con selección de fecha y hora  
✅ Sistema inteligente que bloquea horarios ocupados (máx 2 por franja)  
✅ Envío automático de emails con EmailJS  
✅ Botón de cancelación en el email  
✅ Sincronización automática con Supabase  
✅ Soporte bilingüe (Español/Català)  
✅ Diseño premium y responsive  
✅ Horarios: Lun-Sáb 9-14h y 16-21h  

---

## 🎉 ¡Listo!

Tu aplicación está completamente funcional y lista para recibir reservas.

**Tiempo total de configuración:** ~12 minutos  
**Costo:** $0 (100% gratuito)

¿Necesitas ayuda? Revisa:
1. La consola del navegador (F12)
2. Supabase → Table Editor (para ver las citas)
3. EmailJS Dashboard (para ver emails enviados)
