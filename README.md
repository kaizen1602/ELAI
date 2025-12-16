# ELAI - Sistema de Gestión de Citas Médicas con WhatsApp

ELAI es un sistema integral de gestión de citas médicas que utiliza WhatsApp como canal de comunicación principal, con inteligencia artificial para mejorar la experiencia del usuario.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                          │
├─────────────────────────────────────────────────────────────────┤
│  React Dashboard  │  WhatsApp Users  │  Admin Panel             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE ORQUESTACIÓN                          │
├─────────────────────────────────────────────────────────────────┤
│  N8N Workflow (IA + WhatsApp)                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE SERVICIOS                             │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express + TypeScript + Prisma                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE DATOS                               │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  WhatsApp Cloud API  │  OpenAI API     │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Node.js + Express + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 14
- **Cache**: Redis 7
- **Auth**: JWT (jsonwebtoken + Passport)
- **Validation**: Zod schemas
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5
- **CSS**: Tailwind CSS 3
- **Forms**: React Hook Form
- **Validation**: Yup
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Infraestructura
- **Orquestación**: N8N
- **WhatsApp**: WhatsApp Business API v21.0
- **IA**: OpenAI GPT-4o-mini
- **Containerización**: Docker + Docker Compose

## 📋 Características Principales

✅ **Plan Único Optimizado**
- IA intermedia (GPT-4o-mini)
- Clasificación de intenciones y síntomas
- Respuestas cálidas con templates

✅ **Control de Consumo Granular**
- Tracking diario, semanal y mensual
- Alertas de uso por umbrales
- Dashboard de métricas

✅ **Sistema de Agendamiento**
- Gestión de agendas por médico
- Slots con bloqueo temporal
- Confirmación y cancelación de citas

✅ **WhatsApp Integration**
- Mensajería bidireccional
- Typing indicators
- Contexto de conversación

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker >= 24.0
- Docker Compose >= 2.20
- Node.js >= 20.0 (solo para desarrollo local)
- npm >= 10.0

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd ELAI
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Iniciar con Docker Compose**
```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

4. **Ejecutar migraciones de base de datos**
```bash
# Entrar al contenedor del backend
docker exec -it elai-backend sh

# Ejecutar migraciones
npm run prisma:migrate

# Generar Prisma Client
npm run prisma:generate

# (Opcional) Ejecutar seed
npm run prisma:seed
```

5. **Acceder a los servicios**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **N8N**: http://localhost:5678
- **Prisma Studio**: `npm run prisma:studio` (desde backend)

## 📦 Estructura del Proyecto

```
elai/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/         # Configuración (DB, Redis, JWT, etc.)
│   │   ├── modules/        # Módulos de la aplicación
│   │   ├── middleware/     # Middlewares (auth, RBAC, etc.)
│   │   ├── utils/          # Utilidades
│   │   ├── types/          # TypeScript types
│   │   ├── app.ts          # Express app
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Prisma schema
│   │   ├── migrations/     # Migraciones
│   │   └── seed.ts         # Datos iniciales
│   └── Dockerfile
│
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/         # Páginas
│   │   ├── components/    # Componentes
│   │   ├── services/      # API services
│   │   ├── context/       # React Context
│   │   ├── hooks/         # Custom hooks
│   │   └── types/         # TypeScript types
│   └── Dockerfile
│
├── n8n/                   # N8N workflows
│   ├── workflows/
│   │   ├── 01-MAIN-ELAI.json
│   │   └── sub/           # Sub-workflows
│   └── credentials/
│
├── typing-subscriber/     # Typing indicator service
│   ├── src/
│   └── Dockerfile
│
├── docs/                  # Documentación
│
├── docker-compose.yml     # Docker Compose (dev)
├── docker-compose.prod.yml # Docker Compose (prod)
└── .env.example           # Variables de entorno ejemplo
```

## 🔧 Desarrollo Local

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar en modo desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar tests
npm test
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview
```

## 📝 Variables de Entorno

Ver `.env.example` para todas las variables disponibles. Las principales son:

```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/elai_db

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=your-password

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# WhatsApp
WHATSAPP_API_URL=https://graph.facebook.com/v21.0
WHATSAPP_ACCESS_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id

# OpenAI
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 Documentación Adicional

- [Arquitectura](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [N8N Workflows](docs/N8N.md)
- [Deployment](docs/DEPLOYMENT.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **ELAI Team**

## 📞 Soporte

Para soporte, por favor abre un issue en el repositorio o contacta al equipo de desarrollo.

---

**Versión**: 1.0.0
**Última actualización**: Diciembre 2024
