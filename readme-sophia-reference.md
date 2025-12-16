📋 Análisis y Diseño: SOPHIA → ELAI

  Voy a realizar un análisis exhaustivo de SOPHIA y diseñar la arquitectura completa de ELAI. Este es un proyecto
  considerable, así que comenzaré organizando las tareas:

⏺ Comenzaré explorando la estructura completa de SOPHIA:

⏺ Explore(Explorar estructura completa SOPHIA)
  ⎿  Done (41 tool uses · 74.7k tokens · 2m 26s)                                                                          

⏺ Read(docker-compose.yml)
  ⎿  Read 138 lines

⏺ Read(backend/config/settings.py)
  ⎿  Read 199 lines

⏺ Search(pattern: "**/*.json")
  ⎿  Found 70 files (ctrl+o to expand)

⏺ Ahora voy a revisar algunos archivos clave adicionales para completar el análisis:

⏺ Read(planes.md)
  ⎿  Read 1899 lines

⏺ Read(frontend/src/index.css)
  ⎿  Read 14 lines

⏺ Read(frontend/tailwind.config.js)
  ⎿  Read 21 lines

⏺ Search(pattern: "**/README.md")
  ⎿  Found 9 files (ctrl+o to expand)

⏺ Perfecto, ya tengo información muy valiosa. Voy a actualizar mi progreso y continuar con el análisis:

⏺ Read(documentacion/README.md)
  ⎿  Read 454 lines

⏺ Read(backend/accounts/models.py)
  ⎿  Read 100 lines

⏺ Search(pattern: "class.*ViewSet|class.*APIView", path: "backend/accounts/views.py", output_mode: "content", head_limit: 50)
  ⎿  Found 10 lines (ctrl+o to expand)

⏺ Perfecto, ahora tengo toda la información necesaria. Voy a compilar el análisis completo de SOPHIA y el diseño de ELAI:

⏺ Perfecto. He completado el análisis exhaustivo de SOPHIA. Ahora voy a generar el documento completo con:

  1. Análisis de SOPHIA (completo)
  2. Diseño de ELAI (arquitectura, endpoints, flujos)

  ---
  📊 ANÁLISIS COMPLETO: SOPHIA → ELAI

  PARTE 1: ANÁLISIS EXHAUSTIVO DE SOPHIA

  1.1 ARQUITECTURA GENERAL DE SOPHIA

  ┌──────────────────────────────────────────────────────────────────┐
  │                    CAPA DE PRESENTACIÓN                           │
  ├──────────────────────────────────────────────────────────────────┤
  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
  │  │  React App  │  │  WhatsApp   │  │   Panel Admin Django    │  │
  │  │  (Frontend) │  │    Users    │  │   (Admin Interface)     │  │
  │  │  Port 3000  │  │             │  │                         │  │
  │  └──────┬──────┘  └──────┬──────┘  └───────────────────────────┘  │
  └─────────┼────────────────┼──────────────────────────────────────┘
            │                │
            ▼                ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │                    CAPA DE ORQUESTACIÓN                           │
  ├──────────────────────────────────────────────────────────────────┤
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                        N8N WORKFLOWS                       │  │
  │  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
  │  │  │ 00-ROUTER    │  │  BASIC FLOW  │  │  INTERMEDIATE   │  │  │
  │  │  │ (Decisor)    │  │  (Sin IA)    │  │  FLOW (IA  limit)│  │  │
  │  │  └──────────────┘  └──────────────┘  └─────────────────┘  │  │
  │  │  ┌──────────────┐  ┌──────────────────────────────────────┐  │
  │  │  │ PREMIUM FLOW │  │  SUB-WORKFLOWS COMPARTIDOS          │  │
  │  │  │ (IA completa)│  │  (Validar, Agendar, Consultar, etc) │  │
  │  │  └──────────────┘  └──────────────────────────────────────┘  │
  │  └───────────────────────────────────────────────────────────┘  │
  └─────────────┬────────────────────────────────────────────────────┘
                │
                ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │                    CAPA DE SERVICIOS                              │
  ├──────────────────────────────────────────────────────────────────┤
  │  ┌──────────────────────────────────────────────────────────┐   │
  │  │             DJANGO BACKEND (Port 8000)                    │   │
  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
  │  │  │   Auth   │  │ Entities │  │  Citas   │  │ WhatsApp │  │   │
  │  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │   │
  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
  │  │  │  Plans   │  │ AI Track │  │ Patients │  │  Medicos │  │   │
  │  │  │ Manager  │  │  Service │  │ Service  │  │ Service  │  │   │
  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
  │  └──────────────────────────────────────────────────────────┘   │
  │                                                                   │
  │  ┌──────────────────────────────────────────────────────────┐   │
  │  │      TYPING SUBSCRIBER SERVICE (Python)                   │   │
  │  │  • Escucha Redis Pub/Sub (sophia:typing-channel)          │   │
  │  │  • Envía typing indicators a WhatsApp API                 │   │
  │  └──────────────────────────────────────────────────────────┘   │
  └─────────────┬────────────────────────────────────────────────────┘
                │
                ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │                      CAPA DE DATOS                                │
  ├──────────────────────────────────────────────────────────────────┤
  │  ┌─────────────┐  ┌────────────┐  ┌─────────────────────────┐   │
  │  │ PostgreSQL  │  │   Redis    │  │      WhatsApp Cloud     │   │
  │  │    (BD)     │  │  (Cache/   │  │         API             │   │
  │  │  Port 5432  │  │   Pub/Sub) │  │                         │   │
  │  └─────────────┘  └────────────┘  └─────────────────────────┘   │
  │                                                                   │
  │  ┌─────────────────────────────────────────────────────────┐    │
  │  │              OpenAI API (GPT-4, GPT-4o-mini)             │    │
  │  └─────────────────────────────────────────────────────────┘    │
  └──────────────────────────────────────────────────────────────────┘

  1.2 STACK TECNOLÓGICO DE SOPHIA

  | Componente        | Tecnología              | Versión  | Descripción                       |
  |-------------------|-------------------------|----------|-----------------------------------|
  | Backend           | Django                  | 5.x      | Framework web principal           |
  | API               | Django REST Framework   | 3.14+    | API RESTful                       |
  | Base de Datos     | PostgreSQL              | 14       | BD relacional principal           |
  | Cache/Queue       | Redis                   | 7-alpine | Cache + Pub/Sub                   |
  | Frontend          | React                   | 19.1.1   | Framework UI                      |
  | Lenguaje Frontend | TypeScript              | 5.8.3    | Tipado estático                   |
  | Build Tool        | Vite                    | 7.1.7    | Bundler                           |
  | CSS               | Tailwind CSS            | 3.4.17   | Framework CSS utility-first       |
  | Autenticación     | JWT (Simple JWT)        | -        | Tokens de acceso                  |
  | Orquestación      | N8N                     | latest   | Workflow automation               |
  | WhatsApp          | WhatsApp Business API   | v21.0    | Mensajería                        |
  | IA                | OpenAI API              | -        | GPT-4, GPT-4o-mini, GPT-3.5-turbo |
  | Containerización  | Docker + Docker Compose | -        | Orquestación servicios            |
  | HTTP Client       | Axios                   | 1.12.2   | Cliente HTTP                      |
  | Formularios       | React Hook Form         | 7.63.0   | Manejo de formularios             |
  | Validación        | Yup                     | 1.7.1    | Schemas de validación             |
  | Iconos            | Lucide React            | 0.544.0  | Librería de iconos                |
  | ORM               | Django ORM              | -        | Abstracción BD                    |
  | WSGI Server       | Gunicorn                | -        | Servidor producción               |
  | Routing           | React Router DOM        | 7.9.2    | Routing frontend                  |

  1.3 MODELOS DE DATOS DE SOPHIA (18 modelos)

  A. Autenticación y Usuarios

  1. User (extends AbstractUser)
  - username, email, password (heredados)
  - rol: superadmin | admin_entidad | medico | paciente
  - telefono
  - created_at, updated_at

  B. Entidades Médicas

  2. EntidadMedica
  - nombre, tipo_entidad, nit_rut (unique)
  - direccion, ciudad, departamento_estado, codigo_postal
  - telefono_principal, telefono_secundario
  - email, email_contacto, sitio_web
  - permite_citas_online, requiere_autorizacion_citas
  - activa, created_at, updated_at

  3. AdminEntidad (OneToOne con User)
  - user (OneToOne)
  - entidad_medica (ForeignKey)
  - permisos (JSONField)

  C. Sistema Médico

  4. Especialidad
  - nombre (unique)
  - duracion_cita (minutos)
  - descripcion

  5. Medico (OneToOne con User)
  - user (OneToOne)
  - entidad_medica (ForeignKey)
  - especialidad (ForeignKey)
  - numero_licencia (unique)
  - activo

  6. Paciente
  - entidad_medica (ForeignKey)
  - tipo_documento: CC, TI, CE, PA, RC, MS
  - numero_documento, nombres, apellidos
  - fecha_nacimiento, genero, estado_civil
  - eps_aseguradora, tipo_sangre, alergias
  - telefono, telefono_secundario, email
  - direccion, ciudad, departamento, codigo_postal
  - contacto_emergencia_nombre, contacto_emergencia_telefono
  - activo, created_at, updated_at, created_by
  - Propiedades: nombre_completo, edad, direccion_completa, telefonos

  D. Agendamiento

  7. Agenda
  - medico (ForeignKey)
  - fecha (DateField)
  - unique_together: [medico, fecha]

  8. Slot
  - agenda (ForeignKey)
  - hora_inicio, hora_fin
  - disponible (BooleanField)
  - unique_together: [agenda, hora_inicio]
  - Propiedades: duracion_minutos, fecha_formateada
  - Índices: [agenda+disponible], [hora_inicio], [disponible]

  9. Cita
  - paciente (ForeignKey)
  - slot (OneToOneField)
  - estado: disponible, reservada, confirmada, cancelada
  - motivo_consulta, telefono, observaciones, observaciones_paciente
  - created_at, updated_at, created_by
  - fecha_confirmacion, fecha_cancelacion, motivo_cancelacion
  - Índices: [paciente+estado], [slot+estado], [estado+created_at], [telefono]

  E. WhatsApp

  10. ConversacionWhatsApp
  - session_id
  - paciente (ForeignKey, nullable)
  - entidad_medica (ForeignKey)
  - estado: ACTIVO, FINALIZADO
  - contexto (JSONField)
  - created_at, updated_at
  - Índices: [session_id], [paciente], [entidad]

  F. Control de Slots

  11. SlotLock
  - slot (ForeignKey)
  - paciente (ForeignKey)
  - entidad (ForeignKey)
  - locked_at
  - expires_at (TTL: 30 segundos)
  - Índices: [slot+expires_at]

  G. Planes y Facturación

  12. Plan
  - entidad_medica (OneToOneField)
  - tipo_plan: BASIC, INTERMEDIATE, PREMIUM
  - estado: ACTIVE, SUSPENDED, CANCELLED
  - max_conversaciones_ia, max_citas_mes, max_pacientes
  - precio_base, precio_adicional_paciente
  - created_at, updated_at, fecha_inicio, fecha_fin

  13. EntidadMedicaConfig (OneToOne con EntidadMedica)
  - entidad (OneToOne)
  - webhook_url, api_key
  - configuraciones_n8n (JSONField)
  - created_at, updated_at

  14. PlanChangeLog
  - plan (ForeignKey)
  - plan_anterior, plan_nuevo
  - motivo_cambio
  - changed_at, changed_by

  H. Tracking de IA

  15. AIUsageLog
  - plan (ForeignKey)
  - entidad_medica (ForeignKey)
  - modelo: gpt-4, gpt-4o-mini, gpt-3.5-turbo
  - tokens_input, tokens_output
  - costo_usd
  - tipo_request, status: SUCCESS/ERROR, error_message
  - metadata (JSONField)
  - created_at

  16. AIUsageDaily
  - plan (ForeignKey)
  - fecha
  - total_llamadas, tokens_input, tokens_output
  - costo_total_usd
  - calculated_at, updated_at

  17. AIUsageMonthly
  - plan (ForeignKey)
  - año, mes
  - total_llamadas, total_tokens, costo_total_usd
  - max_tokens_permitido, max_costo_permitido
  - es_sobre_limite

  18. UsageAlert
  - plan (ForeignKey)
  - tipo_alerta: TOKENS, COST, CALLS
  - nivel: WARNING, CRITICAL
  - created_at, resuelta_at

  1.4 ENDPOINTS DE SOPHIA (REST API)

  A. Autenticación

  | Método | Endpoint               | Descripción     | Autenticación |
  |--------|------------------------|-----------------|---------------|
  | POST   | /api/v1/auth/login/    | Login con JWT   | No            |
  | POST   | /api/v1/token/         | Obtener tokens  | No            |
  | POST   | /api/v1/token/refresh/ | Refrescar token | No            |
  | POST   | /api/v1/auth/logout/   | Logout          | Sí            |

  B. Usuarios

  | Método | Endpoint            | Descripción        | Permisos        |
  |--------|---------------------|--------------------|-----------------|
  | GET    | /api/v1/users/      | Listar usuarios    | IsAuthenticated |
  | POST   | /api/v1/users/      | Crear usuario      | IsAdminEntidad  |
  | GET    | /api/v1/users/{id}/ | Detalle usuario    | IsAuthenticated |
  | PUT    | /api/v1/users/{id}/ | Actualizar usuario | IsOwnerOrAdmin  |
  | DELETE | /api/v1/users/{id}/ | Eliminar usuario   | IsSuperAdmin    |

  C. Entidades Médicas

  | Método | Endpoint                     | Descripción        | Permisos        |
  |--------|------------------------------|--------------------|-----------------|
  | GET    | /api/v1/entities/            | Listar entidades   | IsAuthenticated |
  | POST   | /api/v1/entities/            | Crear entidad      | IsSuperAdmin    |
  | GET    | /api/v1/entities/{id}/       | Detalle entidad    | IsAdminEntidad  |
  | PUT    | /api/v1/entities/{id}/       | Actualizar entidad | IsAdminEntidad  |
  | PATCH  | /api/v1/entities/{id}/       | Actualizar parcial | IsAdminEntidad  |
  | DELETE | /api/v1/entities/{id}/       | Eliminar entidad   | IsSuperAdmin    |
  | GET    | /api/v1/entities/{id}/stats/ | Estadísticas       | IsAdminEntidad  |

  D. Pacientes

  | Método | Endpoint                  | Descripción         | Permisos       |
  |--------|---------------------------|---------------------|----------------|
  | GET    | /api/v1/pacientes/        | Listar pacientes    | IsAdminEntidad |
  | POST   | /api/v1/pacientes/        | Crear paciente      | IsAdminEntidad |
  | GET    | /api/v1/pacientes/{id}/   | Detalle paciente    | IsAdminEntidad |
  | PUT    | /api/v1/pacientes/{id}/   | Actualizar paciente | IsAdminEntidad |
  | DELETE | /api/v1/pacientes/{id}/   | Soft delete         | IsAdminEntidad |
  | POST   | /api/v1/pacientes/import/ | Importar CSV/Excel  | IsAdminEntidad |
  | GET    | /api/v1/pacientes/stats/  | Estadísticas        | IsAdminEntidad |

  E. Médicos

  | Método | Endpoint                       | Descripción        | Permisos       |
  |--------|--------------------------------|--------------------|----------------|
  | GET    | /api/v1/medicos/               | Listar médicos     | IsAdminEntidad |
  | POST   | /api/v1/medicos/               | Crear médico       | IsAdminEntidad |
  | GET    | /api/v1/medicos/{id}/          | Detalle médico     | IsAdminEntidad |
  | PUT    | /api/v1/medicos/{id}/          | Actualizar médico  | IsAdminEntidad |
  | PATCH  | /api/v1/medicos/{id}/activate/ | Activar/Desactivar | IsAdminEntidad |

  F. Especialidades

  | Método | Endpoint                     | Descripción           | Permisos        |
  |--------|------------------------------|-----------------------|-----------------|
  | GET    | /api/v1/especialidades/      | Listar especialidades | IsAuthenticated |
  | POST   | /api/v1/especialidades/      | Crear especialidad    | IsAdminEntidad  |
  | GET    | /api/v1/especialidades/{id}/ | Detalle               | IsAuthenticated |

  G. Agendas

  | Método | Endpoint              | Descripción    | Permisos       |
  |--------|-----------------------|----------------|----------------|
  | GET    | /api/v1/agendas/      | Listar agendas | IsAdminEntidad |
  | POST   | /api/v1/agendas/      | Crear agenda   | IsAdminEntidad |
  | GET    | /api/v1/agendas/{id}/ | Detalle agenda | IsAdminEntidad |

  H. Slots

  | Método | Endpoint                 | Descripción              | Permisos        |
  |--------|--------------------------|--------------------------|-----------------|
  | GET    | /api/v1/slots/           | Listar slots disponibles | IsAuthenticated |
  | POST   | /api/v1/slots/           | Crear slots              | IsAdminEntidad  |
  | GET    | /api/v1/slots/available/ | Filtrar disponibles      | IsAuthenticated |

  I. Citas

  | Método | Endpoint                    | Descripción         | Permisos        |
  |--------|-----------------------------|---------------------|-----------------|
  | GET    | /api/v1/citas/              | Listar citas        | IsAdminEntidad  |
  | POST   | /api/v1/citas/              | Crear/Reservar cita | IsAuthenticated |
  | GET    | /api/v1/citas/{id}/         | Detalle cita        | IsAuthenticated |
  | PATCH  | /api/v1/citas/{id}/confirm/ | Confirmar cita      | IsAdminEntidad  |
  | PATCH  | /api/v1/citas/{id}/cancel/  | Cancelar cita       | IsAuthenticated |

  J. Conversaciones WhatsApp

  | Método | Endpoint                     | Descripción           | Permisos       |
  |--------|------------------------------|-----------------------|----------------|
  | GET    | /api/v1/conversaciones/      | Listar conversaciones | IsAdminEntidad |
  | POST   | /api/v1/conversaciones/      | Crear conversación    | AllowAny (N8N) |
  | GET    | /api/v1/conversaciones/{id}/ | Detalle               | IsAdminEntidad |
  | PATCH  | /api/v1/conversaciones/{id}/ | Actualizar contexto   | AllowAny (N8N) |

  K. Integración N8N

  | Método | Endpoint                  | Descripción      | Permisos              |
  |--------|---------------------------|------------------|-----------------------|
  | POST   | /api/v1/plan/router/      | Router de planes | AllowAny (N8N secret) |
  | POST   | /api/v1/ai/log-usage/     | Log uso IA       | AllowAny (N8N secret) |
  | GET    | /api/v1/ai/usage/summary/ | Resumen uso IA   | IsAuthenticated       |

  L. Admin Master

  | Método | Endpoint                   | Descripción       | Permisos       |
  |--------|----------------------------|-------------------|----------------|
  | GET    | /api/v1/master/dashboard/  | Dashboard global  | IsSuperAdmin   |
  | GET    | /api/v1/config/n8n/        | Configuración N8N | IsAdminEntidad |
  | POST   | /api/v1/config/n8n/update/ | Actualizar config | IsAdminEntidad |

  M. Health Checks

  | Método | Endpoint                 | Descripción            | Permisos |
  |--------|--------------------------|------------------------|----------|
  | GET    | /api/v1/health/detailed/ | Health check detallado | No       |

  1.5 FRONTEND DE SOPHIA

  A. Estructura de Carpetas

  frontend/
  ├── src/
  │   ├── App.tsx                 # Router principal
  │   ├── main.tsx                # Entry point
  │   ├── index.css               # Estilos globales + Tailwind
  │   ├── context/
  │   │   └── AuthContext.tsx     # Context de autenticación global
  │   ├── types/
  │   │   └── index.ts            # 100+ interfaces TypeScript
  │   ├── services/               # API clients (12 archivos)
  │   │   ├── api.ts              # Axios instance con interceptores JWT
  │   │   ├── authService.ts
  │   │   ├── entityService.ts
  │   │   ├── pacienteService.ts
  │   │   ├── medicoService.ts
  │   │   ├── especialidadService.ts
  │   │   ├── agendaService.ts
  │   │   ├── slotService.ts
  │   │   ├── citaService.ts
  │   │   └── conversacionService.ts
  │   ├── pages/                  # 9 páginas principales
  │   │   ├── LoginPage.tsx
  │   │   ├── DashboardPage.tsx
  │   │   ├── EntitiesPage.tsx
  │   │   ├── PatientsPage.tsx
  │   │   ├── MedicosPage.tsx
  │   │   ├── AgendasPage.tsx
  │   │   ├── CitasPage.tsx
  │   │   ├── ConversacionesPage.tsx
  │   │   └── ProfilePage.tsx
  │   ├── components/
  │   │   ├── layout/
  │   │   │   ├── Header.tsx
  │   │   │   ├── Sidebar.tsx
  │   │   │   ├── Layout.tsx
  │   │   │   ├── SidebarItem.tsx
  │   │   │   └── PageLoader.tsx
  │   │   ├── entities/           # Componentes de entidades
  │   │   ├── patients/           # Componentes de pacientes
  │   │   ├── medicos/            # Componentes de médicos
  │   │   ├── agendas/            # Componentes de agendas
  │   │   ├── slots/              # Componentes de slots
  │   │   ├── citas/              # Componentes de citas
  │   │   └── conversaciones/     # Componentes de conversaciones
  │   └── hooks/                  # Custom React hooks
  ├── public/
  ├── index.html
  ├── package.json
  ├── vite.config.ts
  ├── tsconfig.json
  ├── tailwind.config.js
  └── Dockerfile

  B. Diseño Visual

  Tipografía:
  - Fuente principal: Inter (Google Fonts)
  - Pesos: 300, 400, 500, 600, 700, 800, 900
  - Sistema de fallback: 'Inter', system-ui, -apple-system, sans-serif

  Framework CSS:
  - Tailwind CSS 3.4.17 (Utility-first)
  - Configuración personalizada en tailwind.config.js

  Colores principales:
  - Background: #ffffff (blanco)
  - Sistema de colores: Tailwind default palette
  - Estilo: Minimalista y limpio

  Componentes UI:
  - Cards con sombras sutiles
  - Botones con estados hover/active
  - Forms con validación visual
  - Loaders y estados de carga
  - Modals y overlays

  C. Páginas Principales

  1. LoginPage
  - Formulario username/password
  - Integración AuthContext
  - Redirección por rol

  2. DashboardPage
  - KPIs principales
  - Accesos rápidos
  - Resumen de citas del día
  - Estadísticas generales

  3. EntitiesPage
  - CRUD completo entidades
  - Formulario creación/edición
  - Estadísticas por entidad
  - Validaciones completas

  4. PatientsPage
  - CRUD pacientes
  - Importación CSV/Excel (BulkUploadModal)
  - Búsqueda y filtros
  - Estadísticas demográficas

  5. MedicosPage
  - CRUD médicos
  - Asignación especialidad
  - Activar/desactivar

  6. AgendasPage
  - Creación agendas por médico
  - Vista calendario
  - Generación de slots

  7. CitasPage
  - Gestión de citas
  - Reserva, confirmación, cancelación
  - Historial

  8. ConversacionesPage
  - Listado conversaciones WhatsApp
  - Contexto de cada conversación
  - Estado interacciones

  9. ProfilePage
  - Perfil usuario logueado
  - Edición datos
  - Cambio contraseña

  1.6 FLUJOS N8N DE SOPHIA

  A. Arquitectura de Flujos

  n8n_workflows/
  ├── router/
  │   └── 00-ROUTER.json           # Decisor de plan
  ├── basic/                        # Plan Básico (sin IA)
  │   ├── 01-MAIN-BASIC.json
  │   └── sub/
  │       ├── validar-paciente.json
  │       └── agendar-cita.json
  ├── intermediate/                 # Plan Intermedio (IA limitada)
  │   ├── 01-MAIN-INTERMEDIATE.json
  │   └── sub/
  │       ├── clasificar-sintomas.json
  │       └── respuestas-calidas.json
  ├── premium/                      # Plan Premium (IA completa)
  │   ├── 01-MAIN-PREMIUM.json
  │   └── sub/
  │       ├── ai-agent-full.json
  │       └── memoria-contexto.json
  └── shared/                       # Subflujos compartidos
      ├── validar-paciente.json
      ├── consultar-slots.json
      ├── crear-cita.json
      ├── cancelar-cita.json
      ├── actualizar-contexto.json
      └── track-usage.json

  B. Flujo Router (00-ROUTER)

  Propósito: Decisor inteligente que determina qué flujo ejecutar según el plan de la entidad

  Proceso:
  1. Recibe mensaje WhatsApp
  2. Extrae session_id (número de teléfono)
  3. Llama POST /api/v1/plan/router/ con session_id
  4. Backend consulta plan de la entidad (desde BD o cache Redis)
  5. Router redirige a:
    - basic → 01-MAIN-BASIC (menú estructurado)
    - intermediate → 01-MAIN-INTERMEDIATE (IA clasificación)
    - premium → 01-MAIN-PREMIUM (IA conversacional)
    - suspended → Mensaje "Servicio suspendido"
    - onboarding → Registro inicial

  Cache: 1 hora en Redis para evitar consultas repetidas

  C. Flujo Básico (Sin IA)

  Características:
  - Menú tipo IVR (árbol de decisiones)
  - Mensajes 100% predefinidos en JavaScript
  - Sin llamadas a OpenAI
  - Respuestas instantáneas
  - Bajo costo operativo

  Estructura:
  [Mensaje WA] → [Validar Paciente]
                        ↓
                ┌───────────────┐
                │ MENÚ PRINCIPAL│
                │ 1️⃣ Agendar    │
                │ 2️⃣ Mis Citas  │
                │ 3️⃣ Cancelar   │
                │ 4️⃣ Info       │
                │ 0️⃣ Salir      │
                └───────┬───────┘
                        ↓
              [Switch Node según opción]

  D. Flujo Intermedio (IA Limitada)

  Características:
  - IA para clasificación de intención (GPT-3.5-turbo)
  - IA para clasificación de síntomas (GPT-3.5-turbo)
  - Respuestas desde templates (sin IA)
  - Tracking de tokens
  - Máximo 2-3 llamadas IA por interacción

  Proceso:
  [Mensaje] → [Clasificar Intención con IA]
                        ↓
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      [agendar]    [sintomas]     [consultar]
          │             │             │
          │             ▼             │
          │    [Clasificar Síntomas   │
          │     con IA]               │
          │             ↓             │
          └─────→ [Templates      ←───┘
                   Cálidos]
                        ↓
                [Track Usage]

  Prompts:
  - Clasificación intención: ~100 tokens
  - Clasificación síntomas: ~200 tokens
  - Total: ~300 tokens por interacción

  E. Flujo Premium (IA Conversacional Completa)

  Características:
  - GPT-4 como núcleo
  - Conversación 100% natural
  - Memoria persistente (Redis + BD)
  - System prompt personalizado por entidad
  - Tools disponibles (agendar, consultar, cancelar)
  - Tono adaptativo
  - Seguimiento proactivo

  Proceso:
  [Mensaje] → [Get Full Context]
                   (Historial + Preferencias + Citas)
                        ↓
              ┌─────────────────┐
              │   GPT-4 AGENT   │
              │  + System Prompt│
              │  + Tools        │
              │  + Memoria      │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      [Tool:      [Tool:       [Tool:
      Agendar]    Consultar]   Cancelar]
          │            │            │
          └────────────┼────────────┘
                       ↓
                [Respuesta Natural]
                       ↓
           [Track Usage + Save Context]

  Consumo de tokens:
  - System prompt: ~500 tokens
  - Historial: ~200-1000 tokens
  - Respuesta: ~300-800 tokens
  - Total: ~1000-2300 tokens por interacción

  1.7 INTEGRACIÓN WHATSAPP

  A. WhatsApp Business API

  Configuración:
  - Phone Number ID: WHATSAPP_PHONE_NUMBER_ID
  - Access Token: WHATSAPP_ACCESS_TOKEN
  - Business Account ID: WHATSAPP_BUSINESS_ACCOUNT_ID
  - Verify Token: WHATSAPP_VERIFY_TOKEN
  - API Version: v21.0

  Endpoints usados:
  - POST /{phone_id}/messages - Enviar mensajes
  - POST /{phone_id}/messages (typing) - Indicadores de escritura

  B. Typing Indicator Subscriber

  Servicio: typing-subscriber (Python standalone)

  Funcionalidad:
  - Escucha canal Redis: sophia:typing-channel
  - Recibe eventos: {action: "typing", session_id: "573001234567"}
  - Envía typing indicator a WhatsApp API
  - Rate limiting: 1 indicador cada 3s por usuario
  - Reconexión automática a Redis

  Proceso:
  N8N → Redis PUBLISH sophia:typing-channel {"action":"typing",...}
           ↓
      Subscriber escucha
           ↓
      POST a WhatsApp API
           ↓
      Usuario ve "Sophia está escribiendo..."

  1.8 DOCKER COMPOSE DE SOPHIA

  Servicios (7 contenedores):

  1. backend (Django)
    - Puerto: 8000
    - Comando: runserver 0.0.0.0:8000
    - Depende de: postgres, redis
  2. frontend (React + Vite)
    - Puerto: 3000 (mapeado a 5173 interno)
    - Env: VITE_API_URL=http://localhost:8000
  3. postgres (PostgreSQL 14)
    - Puerto: 5433 (host) → 5432 (container)
    - BD: citas_medicas
    - Usuario: admin / admin
  4. redis (Redis 7-alpine)
    - Puerto: 6379
    - Comandos: redis-server --appendonly yes --maxmemory 256mb
    - Health check cada 10s
  5. n8n (N8N Workflow)
    - Puerto: 5679 (mapeado a 5678)
    - Autenticación básica
    - Variables: WhatsApp, OpenAI, Backend URL
  6. pgadmin (PgAdmin 4)
    - Puerto: 8081
    - Gestión visual de PostgreSQL
  7. typing-subscriber (Python service)
    - Depende de: redis
    - Env: Redis, WhatsApp tokens
    - Logging: JSON driver

  Volúmenes:
  - postgres_data
  - redis_data
  - n8n_data
  - pgadmin_data

  Red:
  - app-network (bridge)

  ---
  PARTE 2: DISEÑO DE ELAI

  2.1 CAMBIOS PRINCIPALES RESPECTO A SOPHIA

  | Característica     | SOPHIA                                  | ELAI                                        |
  |--------------------|-----------------------------------------|---------------------------------------------|
  | Planes             | 3 planes (Basic, Intermediate, Premium) | 1 único plan (Intermediate + IA + WhatsApp) |
  | Backend            | Django 5.x                              | Node.js + Express + TypeScript              |
  | ORM                | Django ORM                              | Prisma ORM                                  |
  | Autenticación      | JWT (Simple JWT)                        | JWT (jsonwebtoken + Passport)               |
  | Validación         | Django Serializers                      | Zod schemas                                 |
  | Estructura         | Monolítico Django                       | Arquitectura modular MVC                    |
  | API Docs           | Manual                                  | Swagger/OpenAPI automático                  |
  | Control de consumo | Por mes                                 | Diario + Semanal + Mensual                  |
  | N8N Flows          | 3 flujos diferenciados                  | 1 único flujo optimizado                    |
  | Panel Admin        | Django Admin                            | Dashboard React personalizado               |

  2.2 ARQUITECTURA DE ELAI

  ┌─────────────────────────────────────────────────────────────────┐
  │                    CAPA DE PRESENTACIÓN                          │
  ├─────────────────────────────────────────────────────────────────┤
  │  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
  │  │  React Dashboard│  │  WhatsApp Users │  │  Admin Panel   │  │
  │  │  (Vite + TS)    │  │                 │  │  (React)       │  │
  │  │  Port 5173      │  │                 │  │                │  │
  │  └────────┬────────┘  └────────┬────────┘  └────────┬───────┘  │
  └───────────┼────────────────────┼────────────────────┼──────────┘
              │                    │                    │
              ▼                    ▼                    ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                    CAPA DE ORQUESTACIÓN                          │
  ├─────────────────────────────────────────────────────────────────┤
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                   N8N WORKFLOW                             │  │
  │  │  ┌──────────────────────────────────────────────────────┐  │  │
  │  │  │  01-MAIN-ELAI (Único flujo con IA + WhatsApp)        │  │  │
  │  │  │  • Clasificación de intención (GPT-4o-mini)          │  │  │
  │  │  │  • Clasificación de síntomas (GPT-4o-mini)           │  │  │
  │  │  │  • Respuestas cálidas con templates                  │  │  │
  │  │  └──────────────────────────────────────────────────────┘  │  │
  │  │  ┌──────────────────────────────────────────────────────┐  │  │
  │  │  │  SUB-WORKFLOWS                                       │  │  │
  │  │  │  • validar-paciente.json                             │  │  │
  │  │  │  • consultar-slots.json                              │  │  │
  │  │  │  • agendar-cita.json (con locks)                     │  │  │
  │  │  │  • cancelar-cita.json                                │  │  │
  │  │  │  • actualizar-contexto.json                          │  │  │
  │  │  │  • track-usage.json (NUEVO - tracking granular)      │  │  │
  │  │  └──────────────────────────────────────────────────────┘  │  │
  │  └───────────────────────────────────────────────────────────┘  │
  └──────────────┬──────────────────────────────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                    CAPA DE SERVICIOS (BACKEND)                   │
  ├─────────────────────────────────────────────────────────────────┤
  │  ┌─────────────────────────────────────────────────────────┐   │
  │  │      NODE.JS + EXPRESS + TYPESCRIPT (Port 3000)         │   │
  │  │  ┌───────────┐  ┌───────────┐  ┌────────────────────┐  │   │
  │  │  │   Auth    │  │ Entities  │  │     Patients       │  │   │
  │  │  │  Module   │  │  Module   │  │      Module        │  │   │
  │  │  └───────────┘  └───────────┘  └────────────────────┘  │   │
  │  │  ┌───────────┐  ┌───────────┐  ┌────────────────────┐  │   │
  │  │  │   Citas   │  │   Medicos │  │    Agendas         │  │   │
  │  │  │  Module   │  │   Module  │  │     Module         │  │   │
  │  │  └───────────┘  └───────────┘  └────────────────────┘  │   │
  │  │  ┌───────────┐  ┌───────────┐  ┌────────────────────┐  │   │
  │  │  │ WhatsApp  │  │ AI Usage  │  │    Consumption     │  │   │
  │  │  │  Module   │  │  Tracker  │  │     Control        │  │   │
  │  │  └───────────┘  └───────────┘  └────────────────────┘  │   │
  │  │                                                          │   │
  │  │  [Middleware: Auth, CORS, Rate Limit, Logger]           │   │
  │  │  [Prisma ORM + Zod Validation]                           │   │
  │  └─────────────────────────────────────────────────────────┘   │
  │                                                                  │
  │  ┌─────────────────────────────────────────────────────────┐   │
  │  │      TYPING SUBSCRIBER SERVICE (Node.js)                 │   │
  │  │  • Redis Pub/Sub listener                                │   │
  │  │  • WhatsApp typing indicators                            │   │
  │  └─────────────────────────────────────────────────────────┘   │
  └──────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                      CAPA DE DATOS                               │
  ├─────────────────────────────────────────────────────────────────┤
  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
  │  │ PostgreSQL   │  │    Redis     │  │  WhatsApp Cloud API   │ │
  │  │   (Prisma)   │  │ (Cache/Queue)│  │                       │ │
  │  │   Port 5432  │  │  Port 6379   │  │                       │ │
  │  └──────────────┘  └──────────────┘  └───────────────────────┘ │
  │                                                                  │
  │  ┌──────────────────────────────────────────────────────────┐  │
  │  │         OpenAI API (GPT-4o-mini - Intermediate)          │  │
  │  └──────────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────────┘

  2.3 ESTRUCTURA DE CARPETAS DE ELAI

  elai/
  ├── docker-compose.yml
  ├── docker-compose.prod.yml
  ├── .env.example
  ├── README.md
  │
  ├── backend/                    # Node.js + Express + TypeScript
  │   ├── src/
  │   │   ├── config/
  │   │   │   ├── database.ts    # Prisma client
  │   │   │   ├── redis.ts       # Redis client
  │   │   │   ├── jwt.ts         # JWT config
  │   │   │   └── swagger.ts     # OpenAPI config
  │   │   │
  │   │   ├── modules/
  │   │   │   ├── auth/
  │   │   │   │   ├── auth.controller.ts
  │   │   │   │   ├── auth.service.ts
  │   │   │   │   ├── auth.routes.ts
  │   │   │   │   ├── auth.dto.ts         # Zod schemas
  │   │   │   │   └── auth.middleware.ts
  │   │   │   │
  │   │   │   ├── entities/
  │   │   │   │   ├── entities.controller.ts
  │   │   │   │   ├── entities.service.ts
  │   │   │   │   ├── entities.routes.ts
  │   │   │   │   └── entities.dto.ts
  │   │   │   │
  │   │   │   ├── patients/
  │   │   │   │   ├── patients.controller.ts
  │   │   │   │   ├── patients.service.ts
  │   │   │   │   ├── patients.routes.ts
  │   │   │   │   ├── patients.dto.ts
  │   │   │   │   └── patients.import.ts  # CSV/Excel import
  │   │   │   │
  │   │   │   ├── medicos/
  │   │   │   │   ├── medicos.controller.ts
  │   │   │   │   ├── medicos.service.ts
  │   │   │   │   ├── medicos.routes.ts
  │   │   │   │   └── medicos.dto.ts
  │   │   │   │
  │   │   │   ├── especialidades/
  │   │   │   │   └── ...
  │   │   │   │
  │   │   │   ├── agendas/
  │   │   │   │   └── ...
  │   │   │   │
  │   │   │   ├── slots/
  │   │   │   │   ├── slots.controller.ts
  │   │   │   │   ├── slots.service.ts
  │   │   │   │   ├── slots.routes.ts
  │   │   │   │   └── slots.lock.service.ts  # SlotLock logic
  │   │   │   │
  │   │   │   ├── citas/
  │   │   │   │   └── ...
  │   │   │   │
  │   │   │   ├── whatsapp/
  │   │   │   │   ├── whatsapp.controller.ts
  │   │   │   │   ├── whatsapp.service.ts
  │   │   │   │   ├── whatsapp.routes.ts
  │   │   │   │   └── typing.service.ts
  │   │   │   │
  │   │   │   ├── ai-usage/              # NUEVO - Control de consumo
  │   │   │   │   ├── ai-usage.controller.ts
  │   │   │   │   ├── ai-usage.service.ts
  │   │   │   │   ├── ai-usage.routes.ts
  │   │   │   │   ├── ai-usage.dto.ts
  │   │   │   │   ├── tracker.service.ts      # Log de cada llamada IA
  │   │   │   │   ├── aggregator.service.ts   # Agregación diaria/semanal/mensual
  │   │   │   │   └── alert.service.ts        # Sistema de alertas
  │   │   │   │
  │   │   │   └── consumption/           # NUEVO - Control de límites
  │   │   │       ├── consumption.controller.ts
  │   │   │       ├── consumption.service.ts
  │   │   │       ├── consumption.routes.ts
  │   │   │       └── consumption.dto.ts
  │   │   │
  │   │   ├── middleware/
  │   │   │   ├── auth.middleware.ts     # JWT validation
  │   │   │   ├── rbac.middleware.ts     # Role-based access control
  │   │   │   ├── rate-limit.middleware.ts
  │   │   │   ├── logger.middleware.ts
  │   │   │   └── error.middleware.ts
  │   │   │
  │   │   ├── utils/
  │   │   │   ├── prisma.ts
  │   │   │   ├── redis.ts
  │   │   │   ├── jwt.ts
  │   │   │   └── logger.ts
  │   │   │
  │   │   ├── types/
  │   │   │   └── index.ts               # TypeScript types
  │   │   │
  │   │   ├── app.ts                     # Express app setup
  │   │   └── server.ts                  # Entry point
  │   │
  │   ├── prisma/
  │   │   ├── schema.prisma              # Prisma schema
  │   │   ├── migrations/                # Migraciones automáticas
  │   │   └── seed.ts                    # Datos iniciales
  │   │
  │   ├── package.json
  │   ├── tsconfig.json
  │   ├── Dockerfile
  │   └── .env
  │
  ├── frontend/                   # React + Vite + TypeScript (IGUAL que SOPHIA)
  │   ├── src/
  │   │   ├── App.tsx
  │   │   ├── main.tsx
  │   │   ├── index.css           # Inter + Tailwind (MISMO DISEÑO)
  │   │   ├── context/
  │   │   │   └── AuthContext.tsx
  │   │   ├── types/
  │   │   │   └── index.ts
  │   │   ├── services/
  │   │   │   ├── api.ts
  │   │   │   ├── authService.ts
  │   │   │   ├── entityService.ts
  │   │   │   ├── pacienteService.ts
  │   │   │   ├── medicoService.ts
  │   │   │   ├── especialidadService.ts
  │   │   │   ├── agendaService.ts
  │   │   │   ├── slotService.ts
  │   │   │   ├── citaService.ts
  │   │   │   ├── conversacionService.ts
  │   │   │   ├── aiUsageService.ts      # NUEVO
  │   │   │   └── consumptionService.ts  # NUEVO
  │   │   ├── pages/
  │   │   │   ├── LoginPage.tsx
  │   │   │   ├── DashboardPage.tsx
  │   │   │   ├── EntitiesPage.tsx
  │   │   │   ├── PatientsPage.tsx
  │   │   │   ├── MedicosPage.tsx
  │   │   │   ├── AgendasPage.tsx
  │   │   │   ├── CitasPage.tsx
  │   │   │   ├── ConversacionesPage.tsx
  │   │   │   ├── ProfilePage.tsx
  │   │   │   ├── ConsumptionPage.tsx    # NUEVO - Consumo diario/semanal/mensual
  │   │   │   └── AIUsagePage.tsx        # NUEVO - Detalle uso IA
  │   │   ├── components/
  │   │   │   ├── layout/
  │   │   │   ├── entities/
  │   │   │   ├── patients/
  │   │   │   ├── medicos/
  │   │   │   ├── agendas/
  │   │   │   ├── slots/
  │   │   │   ├── citas/
  │   │   │   ├── conversaciones/
  │   │   │   ├── consumption/           # NUEVO - Gráficos de consumo
  │   │   │   │   ├── DailyChart.tsx
  │   │   │   │   ├── WeeklyChart.tsx
  │   │   │   │   ├── MonthlyChart.tsx
  │   │   │   │   └── UsageAlerts.tsx
  │   │   │   └── ai-usage/              # NUEVO - Detalle IA
  │   │   │       ├── TokensChart.tsx
  │   │   │       ├── CostBreakdown.tsx
  │   │   │       └── UsageSummary.tsx
  │   │   └── hooks/
  │   ├── package.json
  │   ├── vite.config.ts
  │   ├── tsconfig.json
  │   ├── tailwind.config.js      # MISMA CONFIG que SOPHIA
  │   └── Dockerfile
  │
  ├── n8n/
  │   ├── workflows/
  │   │   ├── 01-MAIN-ELAI.json          # ÚNICO flujo principal
  │   │   └── sub/
  │   │       ├── 02-validar-paciente.json
  │   │       ├── 03-crear-conversacion.json
  │   │       ├── 04-clasificar-sintomas.json     # Con IA (GPT-4o-mini)
  │   │       ├── 05-consultar-citas.json
  │   │       ├── 06-agendar-cita.json
  │   │       ├── 07-listar-citas-activas.json
  │   │       ├── 08-confirmar-cancelacion.json
  │   │       ├── 09-actualizar-contexto.json
  │   │       ├── 10-finalizar-conversacion.json
  │   │       └── 11-track-usage.json             # NUEVO - Tracking granular
  │   └── credentials/
  │       ├── elai-backend.json
  │       ├── redis-elai.json
  │       ├── whatsapp-api.json
  │       └── openai-api.json
  │
  ├── typing-subscriber/          # Node.js service
  │   ├── src/
  │   │   ├── index.ts
  │   │   ├── redis.ts
  │   │   └── whatsapp.ts
  │   ├── package.json
  │   ├── tsconfig.json
  │   └── Dockerfile
  │
  ├── docs/                       # Documentación
  │   ├── API.md                  # API Reference (Swagger/OpenAPI)
  │   ├── ARCHITECTURE.md         # Arquitectura de ELAI
  │   ├── DEPLOYMENT.md           # Guía de despliegue
  │   ├── DATABASE.md             # Esquema de BD
  │   └── N8N.md                  # Configuración de flujos
  │
  └── scripts/
      ├── setup.sh                # Setup inicial
      ├── seed-data.sh            # Cargar datos de prueba
      └── migrate.sh              # Ejecutar migraciones

  2.4 MODELOS DE DATOS DE ELAI (Prisma Schema)

  // prisma/schema.prisma

  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  // ===========================
  // AUTENTICACIÓN Y USUARIOS
  // ===========================

  model User {
    id        String   @id @default(uuid())
    username  String   @unique
    email     String   @unique
    password  String
    rol       UserRole @default(ADMIN_ENTIDAD)
    telefono  String?
    firstName String?
    lastName  String?
    isActive  Boolean  @default(true)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    // Relaciones
    adminEntidad AdminEntidad?
    medico       Medico?
    pacientes    Paciente[]        @relation("CreatedBy")

    @@map("users")
  }

  enum UserRole {
    SUPERADMIN
    ADMIN_ENTIDAD
    MEDICO
    PACIENTE
  }

  // ===========================
  // ENTIDADES MÉDICAS
  // ===========================

  model EntidadMedica {
    id                    String             @id @default(uuid())
    nombre                String
    tipoEntidad           TipoEntidad
    nitRut                String             @unique
    direccion             String
    ciudad                String
    departamentoEstado    String
    codigoPostal          String?
    telefonoPrincipal     String
    telefonoSecundario    String?
    email                 String
    emailContacto         String?
    sitioWeb              String?
    permiteCitasOnline    Boolean            @default(true)
    requiereAutorizacion  Boolean            @default(false)
    activa                Boolean            @default(true)
    createdAt             DateTime           @default(now())
    updatedAt             DateTime           @updatedAt

    // Relaciones
    adminEntidad          AdminEntidad?
    medicos               Medico[]
    pacientes             Paciente[]
    conversaciones        ConversacionWhatsApp[]
    aiUsageLogs           AIUsageLog[]
    consumptionControl    ConsumptionControl?

    @@map("entidades_medicas")
  }

  enum TipoEntidad {
    HOSPITAL
    CLINICA
    CENTRO_SALUD
    CONSULTORIO
    LABORATORIO
    CENTRO_DIAGNOSTICO
  }

  model AdminEntidad {
    id                String         @id @default(uuid())
    userId            String         @unique
    entidadMedicaId   String         @unique
    permisos          Json?
    createdAt         DateTime       @default(now())
    updatedAt         DateTime       @updatedAt

    // Relaciones
    user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
    entidadMedica     EntidadMedica  @relation(fields: [entidadMedicaId], references: [id], onDelete: Cascade)

    @@map("admin_entidad")
  }

  // ===========================
  // SISTEMA MÉDICO
  // ===========================

  model Especialidad {
    id              String    @id @default(uuid())
    nombre          String    @unique
    duracionCita    Int       @default(30) // minutos
    descripcion     String?
    createdAt       DateTime  @default(now())
    updatedAt       DateTime  @updatedAt

    // Relaciones
    medicos         Medico[]

    @@map("especialidades")
  }

  model Medico {
    id                String         @id @default(uuid())
    userId            String         @unique
    entidadMedicaId   String
    especialidadId    String
    numeroLicencia    String         @unique
    activo            Boolean        @default(true)
    createdAt         DateTime       @default(now())
    updatedAt         DateTime       @updatedAt

    // Relaciones
    user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
    entidadMedica     EntidadMedica  @relation(fields: [entidadMedicaId], references: [id], onDelete: Cascade)
    especialidad      Especialidad   @relation(fields: [especialidadId], references: [id], onDelete: Restrict)
    agendas           Agenda[]

    @@map("medicos")
  }

  model Paciente {
    id                          String         @id @default(uuid())
    entidadMedicaId             String
    tipoDocumento               TipoDocumento
    numeroDocumento             String
    nombres                     String
    apellidos                   String
    fechaNacimiento             DateTime
    genero                      Genero
    estadoCivil                 EstadoCivil?
    epsAseguradora              String?
    tipoSangre                  String?
    alergias                    String?
    telefono                    String
    telefonoSecundario          String?
    email                       String?
    direccion                   String
    ciudad                      String
    departamento                String
    codigoPostal                String?
    contactoEmergenciaNombre    String?
    contactoEmergenciaTelefono  String?
    activo                      Boolean        @default(true)
    createdAt                   DateTime       @default(now())
    updatedAt                   DateTime       @updatedAt
    createdById                 String?

    // Relaciones
    entidadMedica               EntidadMedica  @relation(fields: [entidadMedicaId], references: [id], onDelete: Cascade)
    createdBy                   User?          @relation("CreatedBy", fields: [createdById], references: [id])
    citas                       Cita[]
    conversaciones              ConversacionWhatsApp[]
    slotLocks                   SlotLock[]

    @@unique([entidadMedicaId, numeroDocumento])
    @@index([numeroDocumento])
    @@index([apellidos, nombres])
    @@map("pacientes")
  }

  enum TipoDocumento {
    CC  // Cédula de Ciudadanía
    TI  // Tarjeta de Identidad
    CE  // Cédula de Extranjería
    PA  // Pasaporte
    RC  // Registro Civil
    MS  // Menor sin ID
  }

  enum Genero {
    MASCULINO
    FEMENINO
    OTRO
    PREFIERO_NO_DECIR
  }

  enum EstadoCivil {
    SOLTERO
    CASADO
    UNION_LIBRE
    DIVORCIADO
    VIUDO
  }

  // ===========================
  // AGENDAMIENTO
  // ===========================

  model Agenda {
    id         String    @id @default(uuid())
    medicoId   String
    fecha      DateTime  @db.Date
    createdAt  DateTime  @default(now())
    updatedAt  DateTime  @updatedAt

    // Relaciones
    medico     Medico    @relation(fields: [medicoId], references: [id], onDelete: Cascade)
    slots      Slot[]

    @@unique([medicoId, fecha])
    @@map("agendas")
  }

  model Slot {
    id           String    @id @default(uuid())
    agendaId     String
    horaInicio   DateTime  @db.Time
    horaFin      DateTime  @db.Time
    disponible   Boolean   @default(true)
    createdAt    DateTime  @default(now())
    updatedAt    DateTime  @updatedAt

    // Relaciones
    agenda       Agenda    @relation(fields: [agendaId], references: [id], onDelete: Cascade)
    cita         Cita?
    slotLocks    SlotLock[]

    @@unique([agendaId, horaInicio])
    @@index([agendaId, disponible])
    @@index([horaInicio])
    @@index([disponible])
    @@map("slots")
  }

  model Cita {
    id                    String       @id @default(uuid())
    pacienteId            String
    slotId                String       @unique
    estado                EstadoCita   @default(RESERVADA)
    motivoConsulta        String?
    telefono              String
    observaciones         String?
    observacionesPaciente String?
    createdAt             DateTime     @default(now())
    updatedAt             DateTime     @updatedAt
    createdById           String?
    fechaConfirmacion     DateTime?
    fechaCancelacion      DateTime?
    motivoCancelacion     String?

    // Relaciones
    paciente              Paciente     @relation(fields: [pacienteId], references: [id], onDelete: Cascade)
    slot                  Slot         @relation(fields: [slotId], references: [id], onDelete: Cascade)

    @@index([pacienteId, estado])
    @@index([slotId, estado])
    @@index([estado, createdAt])
    @@index([telefono])
    @@map("citas")
  }

  enum EstadoCita {
    DISPONIBLE
    RESERVADA
    CONFIRMADA
    CANCELADA
  }

  model SlotLock {
    id           String       @id @default(uuid())
    slotId       String
    pacienteId   String?
    entidadId    String
    lockedAt     DateTime     @default(now())
    expiresAt    DateTime     // TTL: 30 segundos desde lockedAt

    // Relaciones
    slot         Slot         @relation(fields: [slotId], references: [id], onDelete: Cascade)
    paciente     Paciente?    @relation(fields: [pacienteId], references: [id], onDelete: Cascade)

    @@index([slotId, expiresAt])
    @@map("slot_locks")
  }

  // ===========================
  // WHATSAPP
  // ===========================

  model ConversacionWhatsApp {
    id                String       @id @default(uuid())
    sessionId         String       @unique
    pacienteId        String?
    entidadMedicaId   String
    estado            EstadoConversacion @default(ACTIVO)
    contexto          Json?
    createdAt         DateTime     @default(now())
    updatedAt         DateTime     @updatedAt

    // Relaciones
    paciente          Paciente?    @relation(fields: [pacienteId], references: [id], onDelete: SetNull)
    entidadMedica     EntidadMedica @relation(fields: [entidadMedicaId], references: [id], onDelete: Cascade)
    aiUsageLogs       AIUsageLog[]

    @@index([sessionId])
    @@index([pacienteId])
    @@index([entidadMedicaId])
    @@map("conversaciones_whatsapp")
  }

  enum EstadoConversacion {
    ACTIVO
    FINALIZADO
  }

  // ===========================
  // IA USAGE TRACKING (NUEVO)
  // ===========================

  model AIUsageLog {
    id                 String       @id @default(uuid())
    entidadMedicaId    String
    conversacionId     String?
    sessionId          String

    // Tokens
    tokensEntrada      Int          @default(0)
    tokensSalida       Int          @default(0)
    tokensTotal        Int          @default(0)

    // Metadata
    modeloIA           String       // gpt-4o-mini
    tipoOperacion      TipoOperacionIA

    // N8N Info
    n8nWorkflowId      String?
    n8nExecutionId     String?
    n8nNodeName        String?

    // Costo
    costoEstimadoUsd   Decimal      @default(0) @db.Decimal(10, 6)

    // Performance
    latenciaMs         Int          @default(0)

    // Raw data (preview)
    requestPreview     String?
    responsePreview    String?

    timestamp          DateTime     @default(now())

    // Relaciones
    entidadMedica      EntidadMedica @relation(fields: [entidadMedicaId], references: [id], onDelete: Cascade)
    conversacion       ConversacionWhatsApp? @relation(fields: [conversacionId], references: [id], onDelete: SetNull)

    @@index([entidadMedicaId, timestamp])
    @@index([entidadMedicaId, tipoOperacion])
    @@index([sessionId, timestamp])
    @@map("ai_usage_log")
  }

  enum TipoOperacionIA {
    CLASIFICACION_INTENCION
    CLASIFICACION_SINTOMAS
    RESPUESTA_GENERADA
    SEGUIMIENTO
    RESUMEN
    OTRO
  }

  model AIUsageDaily {
    id                    String       @id @default(uuid())
    entidadMedicaId       String
    fecha                 DateTime     @db.Date
    
    // Totales del día
    totalLlamadas         Int          @default(0)
    totalTokensEntrada    Int          @default(0)
    totalTokensSalida     Int          @default(0)
    totalTokens           Int          @default(0)
    
    // Desglose por tipo
    tokensClasificacion   Int          @default(0)
    tokensRespuesta       Int          @default(0)
    tokensSeguimiento     Int          @default(0)
    tokensOtros           Int          @default(0)
    
    // Costos
    costoTotalUsd         Decimal      @default(0) @db.Decimal(10, 4)
    
    // Métricas adicionales
    totalConversaciones   Int          @default(0)
    totalCitasAgendadas   Int          @default(0)
    totalMensajesWhatsapp Int          @default(0)
    
    // Alertas
    excedioLimite         Boolean      @default(false)
    porcentajeLimiteUsado Decimal      @default(0) @db.Decimal(5, 2)
    
    createdAt             DateTime     @default(now())
    updatedAt             DateTime     @updatedAt

    @@unique([entidadMedicaId, fecha])
    @@index([fecha, entidadMedicaId])
    @@map("ai_usage_daily")
  }

  model AIUsageWeekly {
    id                    String       @id @default(uuid())
    entidadMedicaId       String
    año                   Int
    semana                Int          // Número de semana (1-52)
    fechaInicio           DateTime     @db.Date
    fechaFin              DateTime     @db.Date
    
    // Totales de la semana
    totalTokensEntrada    Int          @default(0)
    totalTokensSalida     Int          @default(0)
    totalTokens           Int          @default(0)
    totalLlamadas         Int          @default(0)
    
    // Costos
    costoTotalUsd         Decimal      @default(0) @db.Decimal(10, 2)
    
    // Métricas
    totalConversaciones   Int          @default(0)
    totalCitas            Int          @default(0)
    totalMensajes         Int          @default(0)
    
    createdAt             DateTime     @default(now())
    updatedAt             DateTime     @updatedAt

    @@unique([entidadMedicaId, año, semana])
    @@map("ai_usage_weekly")
  }

  model AIUsageMonthly {
    id                    String       @id @default(uuid())
    entidadMedicaId       String
    año                   Int
    mes                   Int
    
    // Totales del mes
    totalTokensEntrada    Int          @default(0)
    totalTokensSalida     Int          @default(0)
    totalTokens           Int          @default(0)
    totalLlamadas         Int          @default(0)
    
    // Límites
    tokensIncluidos       Int          @default(0)
    tokensExtra           Int          @default(0)
    
    // Costos
    costoBase             Decimal      @default(0) @db.Decimal(10, 2)
    costoExtra            Decimal      @default(0) @db.Decimal(10, 2)
    costoTotal            Decimal      @default(0) @db.Decimal(10, 2)
    
    // Métricas
    totalConversaciones   Int          @default(0)
    totalCitas            Int          @default(0)
    totalMensajes         Int          @default(0)
    
    // Estado
    facturado             Boolean      @default(false)
    facturaId             String?
    
    createdAt             DateTime     @default(now())
    updatedAt             DateTime     @updatedAt

    @@unique([entidadMedicaId, año, mes])
    @@map("ai_usage_monthly")
  }

  model UsageAlert {
    id             String       @id @default(uuid())
    entidadMedicaId String
    tipo           TipoAlerta
    mensaje        String
    valorActual    Int
    valorLimite    Int
    porcentaje     Decimal      @db.Decimal(5, 2)
    vista          Boolean      @default(false)
    resuelta       Boolean      @default(false)
    timestamp      DateTime     @default(now())

    @@index([entidadMedicaId, vista])
    @@index([tipo, timestamp])
    @@map("usage_alerts")
  }

  enum TipoAlerta {
    WARNING_80
    WARNING_90
    LIMIT_REACHED
    SUSPENDED
    ANOMALY
  }

  // ===========================
  // CONSUMPTION CONTROL (NUEVO)
  // ===========================

  model ConsumptionControl {
    id                      String       @id @default(uuid())
    entidadMedicaId         String       @unique
    
    // Límites configurados (Plan único intermedio)
    limiteTokensDiario      Int          @default(50000)   // 50K tokens/día
    limiteTokensSemanal     Int          @default(300000)  // 300K tokens/semana
    limiteTokensMensual     Int          @default(1000000) // 1M tokens/mes
    limiteMensajesDiario    Int          @default(500)
    limiteMensajesSemanal   Int          @default(3000)
    limiteMensajesMensual   Int          @default(10000)
    
    // Estado actual
    suspendidaPorConsumo    Boolean      @default(false)
    motivoSuspension        String?
    fechaSuspension         DateTime?
    
    // Alertas configuradas
    alertasActivas          Boolean      @default(true)
    umbralAlerta80          Boolean      @default(true)
    umbralAlerta90          Boolean      @default(true)
    
    createdAt               DateTime     @default(now())
    updatedAt               DateTime     @updatedAt

    // Relaciones
    entidadMedica           EntidadMedica @relation(fields: [entidadMedicaId], references: [id], onDelete: Cascade)

    @@map("consumption_control")
  }

  2.5 ENDPOINTS DE ELAI (API REST)

  Base URL: http://localhost:3000/api/v1

  A. Autenticación

  | Método | Endpoint      | Request Body         | Response                          | Descripción     |
  |--------|---------------|----------------------|-----------------------------------|-----------------|
  | POST   | /auth/login   | {username, password} | {accessToken, refreshToken, user} | Login con JWT   |
  | POST   | /auth/refresh | {refreshToken}       | {accessToken}                     | Refrescar token |
  | POST   | /auth/logout  | {refreshToken}       | {message}                         | Logout          |
  | GET    | /auth/me      | -                    | {user}                            | Usuario actual  |

  B. Usuarios

  | Método | Endpoint   | Permisos        | Descripción        |
  |--------|------------|-----------------|--------------------|
  | GET    | /users     | IsAuthenticated | Listar usuarios    |
  | POST   | /users     | IsAdminEntidad  | Crear usuario      |
  | GET    | /users/:id | IsAuthenticated | Detalle usuario    |
  | PUT    | /users/:id | IsOwnerOrAdmin  | Actualizar usuario |
  | DELETE | /users/:id | IsSuperAdmin    | Eliminar usuario   |

  C. Entidades Médicas

  | Método | Endpoint            | Permisos        | Descripción        |
  |--------|---------------------|-----------------|--------------------|
  | GET    | /entities           | IsAuthenticated | Listar entidades   |
  | POST   | /entities           | IsSuperAdmin    | Crear entidad      |
  | GET    | /entities/:id       | IsAdminEntidad  | Detalle entidad    |
  | PUT    | /entities/:id       | IsAdminEntidad  | Actualizar entidad |
  | PATCH  | /entities/:id       | IsAdminEntidad  | Actualizar parcial |
  | DELETE | /entities/:id       | IsSuperAdmin    | Eliminar entidad   |
  | GET    | /entities/:id/stats | IsAdminEntidad  | Estadísticas       |

  D. Pacientes

  | Método | Endpoint         | Permisos       | Descripción         |
  |--------|------------------|----------------|---------------------|
  | GET    | /patients        | IsAdminEntidad | Listar pacientes    |
  | POST   | /patients        | IsAdminEntidad | Crear paciente      |
  | GET    | /patients/:id    | IsAdminEntidad | Detalle paciente    |
  | PUT    | /patients/:id    | IsAdminEntidad | Actualizar paciente |
  | DELETE | /patients/:id    | IsAdminEntidad | Soft delete         |
  | POST   | /patients/import | IsAdminEntidad | Importar CSV/Excel  |
  | GET    | /patients/stats  | IsAdminEntidad | Estadísticas        |

  E. Médicos

  | Método | Endpoint              | Permisos       | Descripción        |
  |--------|-----------------------|----------------|--------------------|
  | GET    | /medicos              | IsAdminEntidad | Listar médicos     |
  | POST   | /medicos              | IsAdminEntidad | Crear médico       |
  | GET    | /medicos/:id          | IsAdminEntidad | Detalle médico     |
  | PUT    | /medicos/:id          | IsAdminEntidad | Actualizar médico  |
  | PATCH  | /medicos/:id/activate | IsAdminEntidad | Activar/Desactivar |

  F. Especialidades

  | Método | Endpoint            | Permisos        | Descripción           |
  |--------|---------------------|-----------------|-----------------------|
  | GET    | /especialidades     | IsAuthenticated | Listar especialidades |
  | POST   | /especialidades     | IsAdminEntidad  | Crear especialidad    |
  | GET    | /especialidades/:id | IsAuthenticated | Detalle               |

  G. Agendas

  | Método | Endpoint     | Permisos       | Descripción    |
  |--------|--------------|----------------|----------------|
  | GET    | /agendas     | IsAdminEntidad | Listar agendas |
  | POST   | /agendas     | IsAdminEntidad | Crear agenda   |
  | GET    | /agendas/:id | IsAdminEntidad | Detalle agenda |

  H. Slots

  | Método | Endpoint          | Permisos        | Descripción               |
  |--------|-------------------|-----------------|---------------------------|
  | GET    | /slots            | IsAuthenticated | Listar slots disponibles  |
  | POST   | /slots            | IsAdminEntidad  | Crear slots               |
  | GET    | /slots/available  | IsAuthenticated | Filtrar disponibles       |
  | POST   | /slots/:id/lock   | AllowAny (N8N)  | Crear lock temporal (30s) |
  | DELETE | /slots/:id/unlock | AllowAny (N8N)  | Liberar lock              |

  I. Citas

  | Método | Endpoint           | Permisos        | Descripción         |
  |--------|--------------------|-----------------|---------------------|
  | GET    | /citas             | IsAdminEntidad  | Listar citas        |
  | POST   | /citas             | IsAuthenticated | Crear/Reservar cita |
  | GET    | /citas/:id         | IsAuthenticated | Detalle cita        |
  | PATCH  | /citas/:id/confirm | IsAdminEntidad  | Confirmar cita      |
  | PATCH  | /citas/:id/cancel  | IsAuthenticated | Cancelar cita       |

  J. Conversaciones WhatsApp

  | Método | Endpoint            | Permisos       | Descripción           |
  |--------|---------------------|----------------|-----------------------|
  | GET    | /conversaciones     | IsAdminEntidad | Listar conversaciones |
  | POST   | /conversaciones     | AllowAny (N8N) | Crear conversación    |
  | GET    | /conversaciones/:id | IsAdminEntidad | Detalle               |
  | PATCH  | /conversaciones/:id | AllowAny (N8N) | Actualizar contexto   |

  K. AI Usage (NUEVO)

  | Método | Endpoint                      | Permisos              | Descripción        |
  |--------|-------------------------------|-----------------------|--------------------|
  | POST   | /ai-usage/log                 | AllowAny (N8N Secret) | Log de uso IA      |
  | GET    | /ai-usage/summary             | IsAdminEntidad        | Resumen de uso     |
  | GET    | /ai-usage/daily/:fecha        | IsAdminEntidad        | Consumo diario     |
  | GET    | /ai-usage/weekly/:año/:semana | IsAdminEntidad        | Consumo semanal    |
  | GET    | /ai-usage/monthly/:año/:mes   | IsAdminEntidad        | Consumo mensual    |
  | GET    | /ai-usage/alerts              | IsAdminEntidad        | Alertas de consumo |

  L. Consumption Control (NUEVO)

  | Método | Endpoint                        | Permisos       | Descripción                     |
  |--------|---------------------------------|----------------|---------------------------------|
  | GET    | /consumption/limits             | IsAdminEntidad | Límites configurados            |
  | PUT    | /consumption/limits             | IsSuperAdmin   | Actualizar límites              |
  | GET    | /consumption/current            | IsAdminEntidad | Consumo actual (día/semana/mes) |
  | GET    | /consumption/history            | IsAdminEntidad | Historial de consumo            |
  | POST   | /consumption/alerts/dismiss/:id | IsAdminEntidad | Marcar alerta como vista        |

  M. Health Checks

  | Método | Endpoint         | Permisos | Descripción               |
  |--------|------------------|----------|---------------------------|
  | GET    | /health          | No       | Health check simple       |
  | GET    | /health/detailed | No       | Health check con métricas |

  2.6 FLUJOS N8N DE ELAI

  A. Único Flujo Principal: 01-MAIN-ELAI

  Características del plan único:
  - IA de clasificación (GPT-4o-mini)
  - Respuestas cálidas con templates
  - Tracking granular de tokens
  - Control de consumo diario/semanal/mensual

  Estructura:

  [Webhook WhatsApp] → [Extract Data]
                            ↓
                    [Validar Paciente]
                      (Sub-workflow 02)
                            ↓
                    [Get/Create Conversación]
                      (Sub-workflow 03)
                            ↓
                    ┌──────────────────┐
                    │ Clasificar       │
                    │ Intención con IA │ ← GPT-4o-mini
                    │ (Sub-workflow 04)│
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
      [agendar]         [sintomas]         [consultar]
          │                  │                  │
          │                  ▼                  │
          │         [Clasificar Síntomas       │
          │          con IA]                   │
          │          (Sub-workflow 04)         │
          │                  ↓                  │
          │         [Sugerir Especialidad]     │
          │                  │                  │
          ▼                  ▼                  ▼
      [Consultar         [Template          [Listar
       Slots]            Respuesta          Citas]
    (Sub-workflow 05)    Cálida]          (Sub-workflow 07)
          │                  │                  │
          ▼                  │                  │
      [Agendar Cita]         │                  ▼
    (Sub-workflow 06)        │            [Cancelar Cita?]
          │                  │             (Sub-workflow 08)
          └──────────────────┴──────────────────┘
                             ↓
                    [Track Usage AI]
                    (Sub-workflow 11) ← NUEVO
                             ↓
                    [Actualizar Contexto]
                    (Sub-workflow 09)
                             ↓
                    [Send Response WA]

  B. Sub-Workflow 11: Track-Usage (NUEVO)

  Propósito: Tracking granular de cada llamada a IA

  Proceso:
  [Input: AI Response]
           ↓
      [Extract Usage]
      - prompt_tokens
      - completion_tokens
      - modelo usado
      - latencia
           ↓
      [Calculate Cost]
      - GPT-4o-mini pricing
      - $0.00015/1K tokens input
      - $0.0006/1K tokens output
           ↓
      [POST /api/v1/ai-usage/log]
      Body: {
        entidadMedicaId,
        conversacionId,
        sessionId,
        tokensEntrada,
        tokensSalida,
        tokensTotal,
        modeloIA: "gpt-4o-mini",
        tipoOperacion: "CLASIFICACION_INTENCION",
        n8nWorkflowId,
        n8nExecutionId,
        n8nNodeName,
        costoEstimadoUsd,
        latenciaMs,
        requestPreview,
        responsePreview
      }
           ↓
      [Backend procesa]
      - Guarda en AIUsageLog
      - Actualiza AIUsageDaily
      - Verifica límites
      - Genera alertas si aplica
           ↓
      [Response]
      {logged: true, id, costo}

  2.7 STACK TECNOLÓGICO DE ELAI

  | Componente        | Tecnología               | Versión  | Cambio respecto a SOPHIA        |
  |-------------------|--------------------------|----------|---------------------------------|
  | Backend           | Node.js + Express        | 20.x LTS | ✅ Cambiado (era Django)         |
  | Lenguaje Backend  | TypeScript               | 5.x      | ✅ Cambiado (era Python)         |
  | ORM               | Prisma                   | 5.x      | ✅ Cambiado (era Django ORM)     |
  | Base de Datos     | PostgreSQL               | 14       | ✔️ Igual                        |
  | Cache/Queue       | Redis                    | 7-alpine | ✔️ Igual                        |
  | Frontend          | React                    | 19.1.1   | ✔️ Igual                        |
  | Lenguaje Frontend | TypeScript               | 5.8.3    | ✔️ Igual                        |
  | Build Tool        | Vite                     | 7.1.7    | ✔️ Igual                        |
  | CSS               | Tailwind CSS             | 3.4.17   | ✔️ Igual                        |
  | Tipografía        | Inter (Google Fonts)     | -        | ✔️ Igual                        |
  | Autenticación     | JWT (jsonwebtoken)       | -        | ✅ Cambiado (librería diferente) |
  | Validación        | Zod                      | 3.x      | ✅ Cambiado (era Yup)            |
  | HTTP Client       | Axios                    | 1.12.2   | ✔️ Igual                        |
  | Orquestación      | N8N                      | latest   | ✔️ Igual                        |
  | WhatsApp          | WhatsApp Business API    | v21.0    | ✔️ Igual                        |
  | IA                | OpenAI API (GPT-4o-mini) | -        | ✅ Cambiado (solo 1 modelo)      |
  | Containerización  | Docker + Docker Compose  | -        | ✔️ Igual                        |
  | API Docs          | Swagger/OpenAPI          | -        | ✅ Nuevo                         |
  | Logger            | Winston                  | 3.x      | ✅ Nuevo                         |
  | Rate Limiting     | express-rate-limit       | 7.x      | ✅ Nuevo                         |
  | Process Manager   | PM2 (producción)         | 5.x      | ✅ Nuevo                         |

  2.8 DOCKER COMPOSE DE ELAI

  # docker-compose.yml

  version: '3.8'

  services:
    backend:
      build:
        context: ./backend
        dockerfile: Dockerfile
      container_name: elai-backend
      ports:
        - "3000:3000"
      env_file:
        - ./backend/.env
      environment:
        - NODE_ENV=development
        - DATABASE_URL=postgresql://admin:admin@postgres:5432/elai
        - REDIS_URL=redis://redis:6379
      depends_on:
        - postgres
        - redis
      volumes:
        - ./backend:/app
        - /app/node_modules
      networks:
        - elai-network
      command: npm run dev

    frontend:
      build:
        context: ./frontend
        dockerfile: Dockerfile
      container_name: elai-frontend
      ports:
        - "5173:5173"
      environment:
        - VITE_API_URL=http://localhost:3000/api/v1
      volumes:
        - ./frontend:/app
        - /app/node_modules
      networks:
        - elai-network
      command: npm run dev

    postgres:
      image: postgres:14-alpine
      container_name: elai-postgres
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: admin
        POSTGRES_PASSWORD: admin
        POSTGRES_DB: elai
      volumes:
        - postgres_data:/var/lib/postgresql/data
      networks:
        - elai-network
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U admin"]
        interval: 10s
        timeout: 5s
        retries: 5

    redis:
      image: redis:7-alpine
      container_name: elai-redis
      ports:
        - "6379:6379"
      command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
      volumes:
        - redis_data:/data
      networks:
        - elai-network
      healthcheck:
        test: ["CMD", "redis-cli", "ping"]
        interval: 10s
        timeout: 3s
        retries: 5

    n8n:
      image: n8nio/n8n
      container_name: elai-n8n
      ports:
        - "5678:5678"
      environment:
        - N8N_BASIC_AUTH_ACTIVE=true
        - N8N_BASIC_AUTH_USER=${N8N_USER:-admin}
        - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-admin123}
        - WEBHOOK_URL=${WEBHOOK_URL}
        - N8N_HOST=${N8N_HOST}
        - N8N_PROTOCOL=${N8N_PROTOCOL}
        - N8N_PORT=${N8N_PORT}
        - WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN}
        - WHATSAPP_BUSINESS_ACCOUNT_ID=${WHATSAPP_BUSINESS_ACCOUNT_ID}
        - WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID}
        - WHATSAPP_VERIFY_TOKEN=${WHATSAPP_VERIFY_TOKEN}
        - OPENAI_API_KEY=${OPENAI_API_KEY}
        - DB_TYPE=postgresdb
        - DB_POSTGRESDB_HOST=postgres
        - DB_POSTGRESDB_PORT=5432
        - DB_POSTGRESDB_DATABASE=elai
        - DB_POSTGRESDB_USER=admin
        - DB_POSTGRESDB_PASSWORD=admin
      volumes:
        - n8n_data:/home/node/.n8n
      depends_on:
        - postgres
        - redis
        - backend
      networks:
        - elai-network
      restart: unless-stopped

    typing-subscriber:
      build:
        context: ./typing-subscriber
        dockerfile: Dockerfile
      container_name: elai-typing-subscriber
      environment:
        - REDIS_HOST=redis
        - REDIS_PORT=6379
        - REDIS_DB=0
        - WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN}
        - WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID}
        - WHATSAPP_API_VERSION=v21.0
      depends_on:
        - redis
      networks:
        - elai-network
      restart: unless-stopped
      logging:
        driver: "json-file"
        options:
          max-size: "10m"
          max-file: "3"

    pgadmin:
      image: dpage/pgadmin4
      container_name: elai-pgadmin
      environment:
        PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL:-admin@elai.com}
        PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD:-admin}
      ports:
        - "8080:80"
      depends_on:
        - postgres
      volumes:
        - pgadmin_data:/var/lib/pgadmin
      networks:
        - elai-network

  networks:
    elai-network:
      driver: bridge

  volumes:
    postgres_data:
    redis_data:
    n8n_data:
    pgadmin_data:

  2.9 RECOMENDACIONES TÉCNICAS PARA ELAI

  A. Backend (Node.js + TypeScript + Prisma)

  Ventajas sobre Django:
  1. Performance: Node.js con async/await para operaciones concurrentes
  2. TypeScript: Tipado fuerte en todo el stack (frontend + backend)
  3. Prisma: ORM moderno con migraciones automáticas y type-safe
  4. Swagger: Documentación automática de API
  5. Ecosistema: NPM packages modernos

  Estructura recomendada:
  - Modular: Cada módulo con su controller, service, routes, dto
  - Middleware chain: Auth → RBAC → Rate Limit → Logger → Error Handler
  - Validation: Zod schemas para validación de entrada
  - Error handling: Clases de error personalizadas
  - Logging: Winston con niveles (debug, info, warn, error)

  Librerías clave:
  {
    "express": "^4.18.2",
    "@prisma/client": "^5.8.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "express-rate-limit": "^7.1.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "redis": "^4.6.12",
    "axios": "^1.6.5"
  }

  B. Base de Datos

  Optimizaciones:
  1. Índices estratégicos: Ya definidos en schema.prisma
  2. Connection pooling: Prisma maneja automáticamente
  3. Queries optimizadas: Usar include y select de Prisma
  4. Agregaciones: Usar aggregate de Prisma para estadísticas

  Migraciones:
  # Desarrollo
  npx prisma migrate dev --name nombre_migracion

  # Producción
  npx prisma migrate deploy

  C. Control de Consumo

  Sistema de tres niveles:

  1. Daily (Diario)
  - Límite: 50,000 tokens/día
  - Límite mensajes: 500/día
  - Agregación: Job cada hora
  - Alertas: 80%, 90%, 100%

  2. Weekly (Semanal)
  - Límite: 300,000 tokens/semana
  - Límite mensajes: 3,000/semana
  - Agregación: Job cada día
  - Alertas: 80%, 90%, 100%

  3. Monthly (Mensual)
  - Límite: 1,000,000 tokens/mes
  - Límite mensajes: 10,000/mes
  - Agregación: Job cada día
  - Facturación: Al final del mes

  Algoritmo de verificación:
  // ai-usage/tracker.service.ts

  async checkLimits(entidadId: string): Promise<void> {
    const control = await prisma.consumptionControl.findUnique({
      where: { entidadMedicaId: entidadId }
    });

    // Verificar límite diario
    const today = startOfDay(new Date());
    const dailyUsage = await prisma.aIUsageDaily.findUnique({
      where: {
        entidadMedicaId_fecha: {
          entidadMedicaId: entidadId,
          fecha: today
        }
      }
    });

    const dailyTokens = dailyUsage?.totalTokens || 0;
    const dailyLimit = control.limiteTokensDiario;
    const dailyPercentage = (dailyTokens / dailyLimit) * 100;

    // Generar alertas si aplica
    if (dailyPercentage >= 100 && !control.suspendidaPorConsumo) {
      // Suspender entidad
      await prisma.consumptionControl.update({
        where: { id: control.id },
        data: {
          suspendidaPorConsumo: true,
          motivoSuspension: 'Límite diario alcanzado',
          fechaSuspension: new Date()
        }
      });

      // Crear alerta
      await prisma.usageAlert.create({
        data: {
          entidadMedicaId: entidadId,
          tipo: 'LIMIT_REACHED',
          mensaje: `Límite diario alcanzado (${dailyTokens}/${dailyLimit} tokens)`,
          valorActual: dailyTokens,
          valorLimite: dailyLimit,
          porcentaje: dailyPercentage
        }
      });
    } else if (dailyPercentage >= 90) {
      // Alerta 90%
      // ...
    } else if (dailyPercentage >= 80) {
      // Alerta 80%
      // ...
    }

    // Repetir para semanal y mensual
    // ...
  }

  D. N8N Optimization

  Cache estratégico:
  - Paciente: 30 minutos
  - Slot mapping: 10 minutos
  - Especialidades: 24 horas
  - Plan config: 1 hora

  Rate limiting en N8N:
  - Máximo 10 requests/segundo por entidad
  - Queue si se excede
  - Retry exponencial: 1s, 2s, 4s, 8s

  E. Frontend

  Componentes nuevos para ELAI:

  1. ConsumptionPage.tsx
  - Dashboard de consumo (diario/semanal/mensual)
  - Gráficos de línea (tokens, mensajes, costos)
  - Alertas destacadas
  - Historial de consumo

  2. AIUsagePage.tsx
  - Detalle granular de llamadas IA
  - Filtros por fecha, tipo de operación
  - Tabla de logs con paginación
  - Exportar a CSV

  Gráficos recomendados:
  - Librería: Recharts (compatible con React 19)
  - Tipos:
    - LineChart (consumo en el tiempo)
    - BarChart (comparación por tipo)
    - PieChart (distribución de uso)
    - AreaChart (acumulado)

  npm install recharts

  F. Testing

  Backend:
  - Unit tests: Jest
  - Integration tests: Supertest
  - E2E tests: Jest + Prisma test client

  npm install --save-dev jest @types/jest ts-jest supertest @types/supertest

  Frontend:
  - Unit tests: Vitest
  - Component tests: React Testing Library
  - E2E tests: Playwright

  npm install --save-dev vitest @testing-library/react @testing-library/jest-dom playwright

  G. Deployment

  Producción con Docker:

  # docker-compose.prod.yml

  version: '3.8'

  services:
    backend:
      build:
        context: ./backend
        dockerfile: Dockerfile.prod
      command: npm run start:prod
      environment:
        - NODE_ENV=production
      restart: always

    frontend:
      build:
        context: ./frontend
        dockerfile: Dockerfile.prod
      # Servir estáticos con nginx
      restart: always

    # ... resto de servicios

  Backend Dockerfile.prod:
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  RUN npx prisma generate
  RUN npm run build

  FROM node:20-alpine
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/package.json ./
  CMD ["node", "dist/server.js"]

  Frontend Dockerfile.prod:
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  FROM nginx:alpine
  COPY --from=builder /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/nginx.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]

  ---
  PARTE 3: RESUMEN COMPARATIVO SOPHIA vs ELAI

  | Aspecto           | SOPHIA                                  | ELAI                              |
  |-------------------|-----------------------------------------|-----------------------------------|
  | Backend           | Django 5.x (Python)                     | Node.js 20 + Express + TypeScript |
  | ORM               | Django ORM                              | Prisma 5.x                        |
  | Planes            | 3 planes (Basic, Intermediate, Premium) | 1 plan único (Intermediate)       |
  | N8N Flows         | 3 flujos diferenciados por plan         | 1 flujo único optimizado          |
  | Modelo IA         | GPT-4, GPT-4o-mini, GPT-3.5-turbo       | GPT-4o-mini (único)               |
  | Control consumo   | Mensual                                 | Diario + Semanal + Mensual        |
  | API Docs          | Manual                                  | Swagger/OpenAPI automático        |
  | Validación        | Django Serializers                      | Zod schemas                       |
  | Frontend          | React 19 + TS + Tailwind                | React 19 + TS + Tailwind (IGUAL)  |
  | Diseño            | Inter font + Tailwind                   | Inter font + Tailwind (IGUAL)     |
  | Base de Datos     | PostgreSQL 14                           | PostgreSQL 14 (IGUAL)             |
  | Cache             | Redis 7                                 | Redis 7 (IGUAL)                   |
  | WhatsApp          | WhatsApp Business API v21               | WhatsApp Business API v21 (IGUAL) |
  | Docker            | 7 servicios                             | 7 servicios (IGUAL)               |
  | Typing Subscriber | Python service                          | Node.js service                   |
  | Logger            | Django logging                          | Winston                           |
  | Testing           | Django test suite                       | Jest + Vitest + Playwright        |
  | Process Manager   | -                                       | PM2 (producción)                  |

  ---
  PARTE 4: PRÓXIMOS PASOS (IMPLEMENTACIÓN)

  Una vez analizada toda la arquitectura de SOPHIA y diseñado ELAI, los próximos pasos serían:

  Opción 1: Implementar ELAI desde cero

  Fase 1: Setup inicial (Semana 1)
  1. Crear estructura de carpetas
  2. Setup Docker Compose
  3. Configurar Prisma + PostgreSQL
  4. Configurar TypeScript + ESLint
  5. Crear schema.prisma completo
  6. Ejecutar migraciones iniciales

  Fase 2: Backend módulos core (Semana 2-3)
  1. Auth module (login, JWT, refresh)
  2. Users module (CRUD + RBAC)
  3. Entities module (CRUD + stats)
  4. Patients module (CRUD + import)
  5. Medicos module (CRUD)
  6. Especialidades module (CRUD)

  Fase 3: Backend agendamiento (Semana 4)
  1. Agendas module
  2. Slots module (con locks)
  3. Citas module (CRUD + confirm/cancel)
  4. SlotLock service

  Fase 4: Backend IA + WhatsApp (Semana 5)
  1. WhatsApp module
  2. AI Usage Tracker service
  3. Consumption Control service
  4. Alert service
  5. Agregación diaria/semanal/mensual

  Fase 5: Frontend (Semana 6-7)
  1. Setup Vite + React + TS + Tailwind (MISMO diseño SOPHIA)
  2. AuthContext + routing
  3. Páginas principales (Dashboard, Entities, Patients, etc.)
  4. Páginas nuevas (Consumption, AI Usage)
  5. Componentes de gráficos (Recharts)

  Fase 6: N8N (Semana 8)
  1. Flujo principal 01-MAIN-ELAI
  2. Sub-workflows (10 flujos)
  3. Credenciales
  4. Testing end-to-end

  Fase 7: Testing + Deploy (Semana 9-10)
  1. Unit tests backend
  2. Integration tests
  3. E2E tests
  4. Docker producción
  5. CI/CD (opcional)

  Opción 2: Migrar SOPHIA → ELAI (Incremental)

  1. Crear backend Node.js en paralelo
  2. Migrar modelos Django → Prisma schema
  3. Migrar endpoints uno por uno
  4. Frontend apunta a nuevo backend
  5. N8N migra a nuevo backend
  6. Retirar Django
