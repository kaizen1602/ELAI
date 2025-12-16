# 🚀 ELAI - Guía de Inicio Rápido

## 📋 Resumen

ELAI es un sistema completo de gestión de citas médicas con WhatsApp, IA y control de consumo. Este proyecto incluye:

- ✅ **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis
- ✅ **Frontend**: React + Vite + TypeScript + Tailwind CSS
- ✅ **Orquestación**: N8N para workflows de WhatsApp
- ✅ **Base de Datos**: PostgreSQL con Prisma ORM
- ✅ **Cache**: Redis para Pub/Sub y caché
- ✅ **Containerización**: Docker + Docker Compose

---

## 🏁 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

**Variables mínimas requeridas:**
```env
# Database
POSTGRES_DB=elai_db
POSTGRES_USER=elai_user
POSTGRES_PASSWORD=tu-password-seguro

# Redis
REDIS_PASSWORD=tu-redis-password

# JWT
JWT_SECRET=tu-jwt-secret-min-32-caracteres

# WhatsApp (opcional para pruebas sin WhatsApp)
WHATSAPP_API_URL=https://graph.facebook.com/v21.0
WHATSAPP_ACCESS_TOKEN=tu-token
WHATSAPP_PHONE_NUMBER_ID=tu-phone-id

# OpenAI (opcional para pruebas sin IA)
OPENAI_API_KEY=sk-tu-api-key
```

### 2. Iniciar Servicios con Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado de servicios
docker-compose ps
```

**Servicios disponibles:**
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **N8N**: http://localhost:5678
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 3. Configurar la Base de Datos

```bash
# Entrar al contenedor del backend
docker exec -it elai-backend sh

# Ejecutar migraciones de Prisma
npm run prisma:migrate

# Generar Prisma Client
npm run prisma:generate

# Cargar datos de prueba
npm run prisma:seed
```

### 4. Acceder al Sistema

**Frontend**: http://localhost:5173

---

## 🔑 CREDENCIALES DE ACCESO

### 1️⃣  SUPERADMIN
```
Username: superadmin
Password: admin123
Email: superadmin@elai.com
```
**Permisos**: Acceso completo al sistema

### 2️⃣  ADMIN ENTIDAD (Clínica ELAI)
```
Username: admin_clinica
Password: admin123
Email: admin@clinicaelai.com
```
**Permisos**: Gestión de entidad médica, pacientes, médicos, agendas

### 3️⃣  MÉDICO 1 (Medicina General)
```
Username: dr.garcia
Password: admin123
Email: garcia@clinicaelai.com
Licencia: MED-12345
```

### 4️⃣  MÉDICO 2 (Cardiología)
```
Username: dra.martinez
Password: admin123
Email: martinez@clinicaelai.com
Licencia: MED-67890
```

---

## 📊 Datos de Prueba Cargados

### Entidad Médica
- **Nombre**: Clínica ELAI
- **Tipo**: Clínica
- **NIT**: 900123456-7
- **Ciudad**: Bogotá, Cundinamarca

### Especialidades
1. Medicina General (30 min)
2. Cardiología (45 min)
3. Pediatría (30 min)
4. Dermatología (30 min)

### Pacientes
1. **Juan Carlos Pérez López**
   - CC: 1234567890
   - Teléfono: +57 310 123 4567
   - EPS: Sura EPS

2. **Ana María González Ramírez**
   - CC: 9876543210
   - Teléfono: +57 320 234 5678
   - EPS: Sanitas EPS

### Agendas y Slots
- **Consulta General - Lunes** (Dr. García)
  - Horario: 08:00 - 12:00
  - Slots de 30 minutos
  - 3 slots disponibles para mañana

- **Cardiología - Martes** (Dra. Martínez)
  - Horario: 14:00 - 18:00
  - Slots de 45 minutos

---

## 🧪 Probar los Endpoints

### Autenticación

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "admin123"
  }'

# Respuesta:
# {
#   "success": true,
#   "data": {
#     "user": { ... },
#     "token": "eyJhbGc..."
#   }
# }

# Usar el token en requests
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Endpoints Principales

```bash
# Entidades Médicas
GET    /api/v1/entities
GET    /api/v1/entities/:id
POST   /api/v1/entities
PUT    /api/v1/entities/:id

# Pacientes
GET    /api/v1/patients
GET    /api/v1/patients/:id
POST   /api/v1/patients
PUT    /api/v1/patients/:id

# Médicos
GET    /api/v1/medicos
GET    /api/v1/medicos/:id
POST   /api/v1/medicos

# Especialidades
GET    /api/v1/especialidades

# Agendas
GET    /api/v1/agendas
GET    /api/v1/agendas/:id
POST   /api/v1/agendas

# Slots
GET    /api/v1/slots/available?agendaId=ID&fecha=2024-12-10
POST   /api/v1/slots/lock (para N8N)

# Citas
GET    /api/v1/citas
GET    /api/v1/citas/:id
POST   /api/v1/citas/create (para N8N)
POST   /api/v1/citas/:id/cancel

# WhatsApp (para N8N)
POST   /api/v1/whatsapp/send
POST   /api/v1/whatsapp/typing
GET    /api/v1/whatsapp/webhook (verificación)
POST   /api/v1/whatsapp/webhook (mensajes entrantes)

# AI Usage (para N8N)
POST   /api/v1/ai-usage/log
GET    /api/v1/ai-usage/summary?entidadMedicaId=ID&period=daily
GET    /api/v1/ai-usage/limits?entidadMedicaId=ID
```

---

## 🛠️ Comandos Útiles

### Docker

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra la BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Ver logs de un servicio
docker-compose logs -f backend

# Ejecutar comando en contenedor
docker exec -it elai-backend npm run prisma:studio
```

### Base de Datos

```bash
# Ver datos con Prisma Studio (interfaz visual)
cd backend
npm run prisma:studio
# Abre en http://localhost:5555

# Crear nueva migración
npm run prisma:migrate

# Resetear BD y cargar seed
npx prisma migrate reset
```

### Desarrollo Local (sin Docker)

```bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📝 Estructura de Endpoints para N8N

Los siguientes endpoints están listos para ser utilizados en workflows de N8N:

### 1. Lock de Slot (Reserva Temporal)
```
POST /api/v1/slots/lock
Body: {
  "slotId": "slot-id",
  "sessionId": "whatsapp-phone",
  "secret": "N8N_WEBHOOK_SECRET"
}
```

### 2. Crear Cita
```
POST /api/v1/citas/create
Body: {
  "slotId": "slot-id",
  "pacienteId": "patient-id",
  "motivoConsulta": "texto",
  "sintomas": "texto",
  "secret": "N8N_WEBHOOK_SECRET"
}
```

### 3. Enviar Mensaje WhatsApp
```
POST /api/v1/whatsapp/send
Body: {
  "to": "57310123456",
  "message": "Hola...",
  "secret": "N8N_WEBHOOK_SECRET"
}
```

### 4. Log de Uso IA
```
POST /api/v1/ai-usage/log
Body: {
  "entidadMedicaId": "entity-id",
  "sessionId": "whatsapp-phone",
  "modelo": "GPT_4O_MINI",
  "tipoOperacion": "CLASIFICACION_INTENCION",
  "tokensPrompt": 100,
  "tokensCompletion": 50,
  "secret": "N8N_WEBHOOK_SECRET"
}
```

---

## 🎯 Próximos Pasos

1. ✅ Backend completamente funcional
2. ✅ Frontend con autenticación
3. ⏳ Implementar workflows de N8N
4. ⏳ Conectar WhatsApp Business API
5. ⏳ Configurar OpenAI API
6. ⏳ Desarrollar páginas completas del frontend

---

## 🆘 Soporte

Si encuentras algún problema:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica que todos los servicios estén corriendo: `docker-compose ps`
3. Asegúrate de que las migraciones se ejecutaron: `docker exec -it elai-backend npm run prisma:migrate`

---

**¡Listo para empezar a desarrollar! 🚀**
