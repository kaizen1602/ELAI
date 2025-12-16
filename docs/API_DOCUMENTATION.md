# 📚 Documentación API ELAI v1.0

## Índice
- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Dashboard](#dashboard)
- [Entidades Médicas](#entidades-médicas)
- [Pacientes](#pacientes)
- [Médicos](#médicos)
- [Especialidades](#especialidades)
- [Agendas](#agendas)
- [Slots](#slots)
- [Citas](#citas)
- [WhatsApp](#whatsapp)
- [AI Usage (Uso de IA)](#ai-usage-uso-de-ia)
- [Códigos de Estado](#códigos-de-estado)
- [Manejo de Errores](#manejo-de-errores)

---

## Información General

**Base URL:** `http://localhost:3001/api/v1`

**Formato de respuesta:** JSON

**Rate Limiting:**
- General: 100 requests / 15 minutos
- Auth: 5 requests / 15 minutos
- Webhooks: 50 requests / 15 minutos

### Estructura de Respuestas

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Respuesta con paginación:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## Autenticación

Todos los endpoints autenticados requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

### POST /auth/login
Iniciar sesión en el sistema

**Request:**
```json
{
  "username": "superadmin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "username": "superadmin",
      "email": "superadmin@elai.com",
      "rol": "SUPERADMIN",
      "telefono": null,
      "activo": true
    }
  }
}
```

**Errores:**
- `401` - Credenciales inválidas
- `429` - Demasiados intentos de inicio de sesión

---

### POST /auth/register
Registrar un nuevo usuario

**Request:**
```json
{
  "username": "nuevo_usuario",
  "email": "usuario@example.com",
  "password": "securePassword123",
  "rol": "PACIENTE",
  "telefono": "+573001234567"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx2a2b3c4d5e6f7g8h9i0j1k",
    "username": "nuevo_usuario",
    "email": "usuario@example.com",
    "rol": "PACIENTE",
    "telefono": "+573001234567",
    "activo": true
  }
}
```

**Errores:**
- `400` - Datos de validación incorrectos
- `409` - Usuario o email ya existe

---

### GET /auth/me
Obtener usuario actual autenticado

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "username": "superadmin",
    "email": "superadmin@elai.com",
    "rol": "SUPERADMIN",
    "telefono": null,
    "activo": true
  }
}
```

---

### GET /auth/profile
Obtener perfil completo del usuario

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "username": "superadmin",
    "email": "superadmin@elai.com",
    "rol": "SUPERADMIN",
    "telefono": "+573001234567",
    "activo": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:20:00.000Z"
  }
}
```

---

### PUT /auth/profile
Actualizar perfil del usuario

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "email": "nuevo_email@example.com",
  "telefono": "+573009876543"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "username": "superadmin",
    "email": "nuevo_email@example.com",
    "rol": "SUPERADMIN",
    "telefono": "+573009876543",
    "activo": true
  },
  "message": "Profile updated successfully"
}
```

---

### POST /auth/change-password
Cambiar contraseña del usuario

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "currentPassword": "admin123",
  "newPassword": "newSecurePass456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errores:**
- `401` - Contraseña actual incorrecta
- `400` - Nueva contraseña no cumple requisitos

---

## Dashboard

### GET /dashboard/stats
Obtener estadísticas del dashboard

**Headers:** `Authorization: Bearer <token>`

**Permisos:** Todos los roles (datos filtrados por rol)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalPacientes": 245,
    "totalEntidades": 12,
    "totalCitas": 1567,
    "totalAgendas": 28,
    "totalMedicos": 45,
    "citasHoy": 15,
    "citasPendientes": 32,
    "citasConfirmadas": 18,
    "citasCompletadas": 1420,
    "citasCanceladas": 97,
    "slotsDisponiblesHoy": 42
  }
}
```

**Notas:**
- SUPERADMIN ve estadísticas globales
- ADMIN_ENTIDAD ve solo su entidad
- MEDICO ve solo sus propios datos

---

### GET /dashboard/recent-appointments
Obtener citas recientes

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (opcional): Número de citas a retornar (default: 10, max: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx3a2b3c4d5e6f7g8h9i0j1k",
      "fecha": "2024-12-10T00:00:00.000Z",
      "horaInicio": "09:00",
      "horaFin": "09:30",
      "estado": "CONFIRMADA",
      "paciente": {
        "nombres": "Juan Carlos",
        "apellidos": "Pérez López",
        "numeroDocumento": "1234567890"
      },
      "medico": {
        "user": {
          "username": "dr.garcia"
        },
        "especialidad": {
          "nombre": "Medicina General"
        }
      }
    }
  ],
  "count": 10
}
```

---

### GET /dashboard/appointments-by-date
Obtener citas agrupadas por fecha (para gráficos)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (opcional): Fecha de inicio (ISO 8601, default: hace 30 días)
- `endDate` (opcional): Fecha de fin (ISO 8601, default: hoy)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "fecha": "2024-12-01",
      "count": 15
    },
    {
      "fecha": "2024-12-02",
      "count": 18
    },
    {
      "fecha": "2024-12-03",
      "count": 12
    }
  ]
}
```

---

## Entidades Médicas

### GET /entities
Listar todas las entidades médicas

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 10, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx4a2b3c4d5e6f7g8h9i0j1k",
      "nombre": "Clínica ELAI",
      "tipoEntidad": "CLINICA",
      "nitRut": "900123456-7",
      "direccion": "Calle 100 # 15-20",
      "ciudad": "Bogotá",
      "departamentoEstado": "Cundinamarca",
      "telefonoPrincipal": "+573001234567",
      "email": "info@clinicaelai.com",
      "sitioWeb": "https://clinicaelai.com",
      "permiteCitasOnline": true,
      "requiereAutorizacionCitas": false,
      "activa": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

---

### GET /entities/:id
Obtener entidad médica por ID

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx4a2b3c4d5e6f7g8h9i0j1k",
    "nombre": "Clínica ELAI",
    "tipoEntidad": "CLINICA",
    "nitRut": "900123456-7",
    "direccion": "Calle 100 # 15-20",
    "ciudad": "Bogotá",
    "departamentoEstado": "Cundinamarca",
    "telefonoPrincipal": "+573001234567",
    "email": "info@clinicaelai.com",
    "sitioWeb": "https://clinicaelai.com",
    "permiteCitasOnline": true,
    "requiereAutorizacionCitas": false,
    "activa": true,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-10T08:00:00.000Z"
  }
}
```

**Errores:**
- `404` - Entidad no encontrada

---

### GET /entities/:id/statistics
Obtener estadísticas de una entidad

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "entidadId": "clx4a2b3c4d5e6f7g8h9i0j1k",
    "totalPacientes": 1245,
    "totalMedicos": 35,
    "totalAgendas": 42,
    "totalCitas": 8945,
    "citasUltimoMes": 320,
    "citasPendientes": 45,
    "tasaOcupacion": 78.5
  }
}
```

---

### POST /entities
Crear nueva entidad médica

**Headers:** `Authorization: Bearer <token>`

**Permisos:** Solo SUPERADMIN

**Request:**
```json
{
  "nombre": "Hospital San José",
  "tipoEntidad": "HOSPITAL",
  "nitRut": "900987654-3",
  "direccion": "Carrera 7 # 45-30",
  "ciudad": "Medellín",
  "departamentoEstado": "Antioquia",
  "telefonoPrincipal": "+5744001234",
  "email": "contacto@hospitalsanjose.com",
  "sitioWeb": "https://hospitalsanjose.com",
  "permiteCitasOnline": true,
  "requiereAutorizacionCitas": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx5a2b3c4d5e6f7g8h9i0j1k",
    "nombre": "Hospital San José",
    "tipoEntidad": "HOSPITAL",
    "nitRut": "900987654-3",
    "direccion": "Carrera 7 # 45-30",
    "ciudad": "Medellín",
    "departamentoEstado": "Antioquia",
    "telefonoPrincipal": "+5744001234",
    "email": "contacto@hospitalsanjose.com",
    "sitioWeb": "https://hospitalsanjose.com",
    "permiteCitasOnline": true,
    "requiereAutorizacionCitas": true,
    "activa": true,
    "createdAt": "2024-12-08T10:30:00.000Z",
    "updatedAt": "2024-12-08T10:30:00.000Z"
  },
  "message": "Entidad created successfully"
}
```

**Tipos de Entidad permitidos:**
- `HOSPITAL`
- `CLINICA`
- `IPS`
- `CONSULTORIO`
- `LABORATORIO`

---

### PUT /entities/:id
Actualizar entidad médica

**Headers:** `Authorization: Bearer <token>`

**Permisos:** SUPERADMIN o ADMIN_ENTIDAD (solo su entidad)

**Request:**
```json
{
  "nombre": "Hospital San José - Sede Principal",
  "telefonoPrincipal": "+5744009999",
  "permiteCitasOnline": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx5a2b3c4d5e6f7g8h9i0j1k",
    "nombre": "Hospital San José - Sede Principal",
    "tipoEntidad": "HOSPITAL",
    "telefonoPrincipal": "+5744009999",
    "permiteCitasOnline": true,
    "activa": true,
    "updatedAt": "2024-12-08T11:00:00.000Z"
  },
  "message": "Entidad updated successfully"
}
```

---

### DELETE /entities/:id
Desactivar entidad médica

**Headers:** `Authorization: Bearer <token>`

**Permisos:** Solo SUPERADMIN

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Entidad deactivated successfully"
}
```

**Nota:** La entidad no se elimina, solo se marca como `activa: false`

---

### POST /entities/:id/activate
Activar entidad médica

**Headers:** `Authorization: Bearer <token>`

**Permisos:** Solo SUPERADMIN

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx5a2b3c4d5e6f7g8h9i0j1k",
    "activa": true
  },
  "message": "Entidad activated successfully"
}
```

---

## Pacientes

### GET /patients
Listar pacientes

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 10, max: 100)
- `entidadMedicaId` (opcional): Filtrar por entidad médica
- `search` (opcional): Buscar por nombre o documento

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx6a2b3c4d5e6f7g8h9i0j1k",
      "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
      "tipoDocumento": "CC",
      "numeroDocumento": "1234567890",
      "nombres": "Juan Carlos",
      "apellidos": "Pérez López",
      "fechaNacimiento": "1985-05-15T00:00:00.000Z",
      "genero": "MASCULINO",
      "estadoCivil": "CASADO",
      "epsAseguradora": "Compensar",
      "tipoSangre": "O+",
      "alergias": "Penicilina",
      "telefono": "+573001234567",
      "email": "juan.perez@email.com",
      "direccion": "Calle 50 # 12-34",
      "ciudad": "Bogotá",
      "departamentoEstado": "Cundinamarca",
      "contactoEmergenciaNombre": "María Pérez",
      "contactoEmergenciaTelefono": "+573009876543",
      "activo": true,
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 245,
    "totalPages": 25
  }
}
```

**Tipos de Documento:**
- `CC` - Cédula de Ciudadanía
- `TI` - Tarjeta de Identidad
- `CE` - Cédula de Extranjería
- `PA` - Pasaporte
- `RC` - Registro Civil
- `MS` - Menor sin identificación

**Géneros:**
- `MASCULINO`
- `FEMENINO`
- `OTRO`

**Estados Civiles:**
- `SOLTERO`
- `CASADO`
- `UNION_LIBRE`
- `DIVORCIADO`
- `VIUDO`

---

### GET /patients/:id
Obtener paciente por ID

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx6a2b3c4d5e6f7g8h9i0j1k",
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López",
    "fechaNacimiento": "1985-05-15T00:00:00.000Z",
    "genero": "MASCULINO",
    "estadoCivil": "CASADO",
    "epsAseguradora": "Compensar",
    "tipoSangre": "O+",
    "alergias": "Penicilina",
    "telefono": "+573001234567",
    "email": "juan.perez@email.com",
    "direccion": "Calle 50 # 12-34",
    "ciudad": "Bogotá",
    "activo": true
  }
}
```

---

### POST /patients
Crear nuevo paciente

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
  "tipoDocumento": "CC",
  "numeroDocumento": "9876543210",
  "nombres": "Ana María",
  "apellidos": "González Ramírez",
  "fechaNacimiento": "1990-08-20",
  "genero": "FEMENINO",
  "estadoCivil": "SOLTERA",
  "epsAseguradora": "Sura",
  "tipoSangre": "A+",
  "alergias": "Ninguna",
  "telefono": "+573009876543",
  "email": "ana.gonzalez@email.com",
  "direccion": "Carrera 20 # 30-40",
  "ciudad": "Bogotá",
  "departamentoEstado": "Cundinamarca",
  "contactoEmergenciaNombre": "Pedro González",
  "contactoEmergenciaTelefono": "+573001234567"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx7a2b3c4d5e6f7g8h9i0j1k",
    "numeroDocumento": "9876543210",
    "nombres": "Ana María",
    "apellidos": "González Ramírez",
    "activo": true
  },
  "message": "Paciente created successfully"
}
```

**Errores:**
- `409` - Paciente con ese documento ya existe

---

### PUT /patients/:id
Actualizar paciente

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "telefono": "+573009999999",
  "email": "nuevo_email@example.com",
  "direccion": "Nueva dirección 123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx7a2b3c4d5e6f7g8h9i0j1k",
    "telefono": "+573009999999",
    "email": "nuevo_email@example.com",
    "updatedAt": "2024-12-08T12:00:00.000Z"
  },
  "message": "Paciente updated successfully"
}
```

---

### DELETE /patients/:id
Eliminar paciente (desactivar)

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Paciente deleted successfully"
}
```

---

## Médicos

### GET /medicos
Listar médicos

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `entidadMedicaId` (opcional): Filtrar por entidad médica
- `especialidadId` (opcional): Filtrar por especialidad

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx8a2b3c4d5e6f7g8h9i0j1k",
      "userId": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
      "especialidadId": "clx9a2b3c4d5e6f7g8h9i0j1k",
      "numeroLicencia": "MED-12345",
      "activo": true,
      "user": {
        "username": "dr.garcia",
        "email": "garcia@clinicaelai.com"
      },
      "especialidad": {
        "nombre": "Medicina General",
        "duracionCita": 30
      },
      "entidadMedica": {
        "nombre": "Clínica ELAI"
      }
    }
  ]
}
```

---

### GET /medicos/:id
Obtener médico por ID

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx8a2b3c4d5e6f7g8h9i0j1k",
    "numeroLicencia": "MED-12345",
    "activo": true,
    "user": {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
      "username": "dr.garcia",
      "email": "garcia@clinicaelai.com",
      "telefono": "+573001234567"
    },
    "especialidad": {
      "nombre": "Medicina General",
      "descripcion": "Atención médica general"
    },
    "entidadMedica": {
      "nombre": "Clínica ELAI",
      "ciudad": "Bogotá"
    }
  }
}
```

---

### POST /medicos
Crear nuevo médico

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "userId": "clx1a2b3c4d5e6f7g8h9i0j1k",
  "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
  "especialidadId": "clx9a2b3c4d5e6f7g8h9i0j1k",
  "numeroLicencia": "MED-67890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx10a2b3c4d5e6f7g8h9i0j1k",
    "numeroLicencia": "MED-67890",
    "activo": true
  },
  "message": "Medico created successfully"
}
```

---

### PUT /medicos/:id
Actualizar médico

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "especialidadId": "clx11a2b3c4d5e6f7g8h9i0j1k",
  "numeroLicencia": "MED-NEW-123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx10a2b3c4d5e6f7g8h9i0j1k",
    "especialidadId": "clx11a2b3c4d5e6f7g8h9i0j1k",
    "numeroLicencia": "MED-NEW-123"
  },
  "message": "Medico updated successfully"
}
```

---

### DELETE /medicos/:id
Desactivar médico

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Medico deactivated successfully"
}
```

---

### POST /medicos/:id/activate
Activar médico

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx10a2b3c4d5e6f7g8h9i0j1k",
    "activo": true
  },
  "message": "Medico activated successfully"
}
```

---

## Especialidades

### GET /especialidades
Listar todas las especialidades

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx9a2b3c4d5e6f7g8h9i0j1k",
      "nombre": "Medicina General",
      "duracionCita": 30,
      "descripcion": "Atención médica general y preventiva",
      "activa": true
    },
    {
      "id": "clx12a2b3c4d5e6f7g8h9i0j1k",
      "nombre": "Cardiología",
      "duracionCita": 45,
      "descripcion": "Especialidad en el sistema cardiovascular",
      "activa": true
    }
  ]
}
```

---

### GET /especialidades/:id
Obtener especialidad por ID

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx9a2b3c4d5e6f7g8h9i0j1k",
    "nombre": "Medicina General",
    "duracionCita": 30,
    "descripcion": "Atención médica general y preventiva",
    "activa": true
  }
}
```

---

### POST /especialidades
Crear especialidad

**Headers:** `Authorization: Bearer <token>`

**Permisos:** ADMIN_ENTIDAD o SUPERADMIN

**Request:**
```json
{
  "nombre": "Dermatología",
  "duracionCita": 30,
  "descripcion": "Especialidad en enfermedades de la piel"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx13a2b3c4d5e6f7g8h9i0j1k",
    "nombre": "Dermatología",
    "duracionCita": 30,
    "descripcion": "Especialidad en enfermedades de la piel",
    "activa": true
  },
  "message": "Especialidad created successfully"
}
```

---

### PUT /especialidades/:id
Actualizar especialidad

**Headers:** `Authorization: Bearer <token>`

**Permisos:** ADMIN_ENTIDAD o SUPERADMIN

**Request:**
```json
{
  "duracionCita": 40,
  "descripcion": "Nueva descripción actualizada"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx13a2b3c4d5e6f7g8h9i0j1k",
    "duracionCita": 40,
    "descripcion": "Nueva descripción actualizada"
  },
  "message": "Especialidad updated successfully"
}
```

---

### DELETE /especialidades/:id
Eliminar especialidad

**Headers:** `Authorization: Bearer <token>`

**Permisos:** ADMIN_ENTIDAD o SUPERADMIN

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Especialidad deleted successfully"
}
```

---

## Agendas

### GET /agendas
Listar agendas

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 10)
- `medicoId` (opcional): Filtrar por médico
- `entidadMedicaId` (opcional): Filtrar por entidad

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx14a2b3c4d5e6f7g8h9i0j1k",
      "medicoId": "clx8a2b3c4d5e6f7g8h9i0j1k",
      "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
      "nombre": "Consulta General - Lunes",
      "diaSemana": "LUNES",
      "horaInicio": "08:00",
      "horaFin": "12:00",
      "duracionSlot": 30,
      "activa": true,
      "medico": {
        "user": {
          "username": "dr.garcia"
        },
        "especialidad": {
          "nombre": "Medicina General"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 28,
    "totalPages": 3
  }
}
```

**Días de la semana:**
- `LUNES`, `MARTES`, `MIERCOLES`, `JUEVES`, `VIERNES`, `SABADO`, `DOMINGO`

---

### GET /agendas/:id
Obtener agenda por ID

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx14a2b3c4d5e6f7g8h9i0j1k",
    "medicoId": "clx8a2b3c4d5e6f7g8h9i0j1k",
    "nombre": "Consulta General - Lunes",
    "diaSemana": "LUNES",
    "horaInicio": "08:00",
    "horaFin": "12:00",
    "duracionSlot": 30,
    "activa": true,
    "medico": {
      "user": {
        "username": "dr.garcia",
        "email": "garcia@clinicaelai.com"
      },
      "especialidad": {
        "nombre": "Medicina General"
      }
    },
    "entidadMedica": {
      "nombre": "Clínica ELAI"
    }
  }
}
```

---

### POST /agendas
Crear nueva agenda

**Headers:** `Authorization: Bearer <token>`

**Permisos:** SUPERADMIN o ADMIN_ENTIDAD

**Request:**
```json
{
  "medicoId": "clx8a2b3c4d5e6f7g8h9i0j1k",
  "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
  "nombre": "Cardiología - Martes",
  "diaSemana": "MARTES",
  "horaInicio": "14:00",
  "horaFin": "18:00",
  "duracionSlot": 45
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx15a2b3c4d5e6f7g8h9i0j1k",
    "nombre": "Cardiología - Martes",
    "diaSemana": "MARTES",
    "horaInicio": "14:00",
    "horaFin": "18:00",
    "duracionSlot": 45,
    "activa": true
  },
  "message": "Agenda created successfully"
}
```

---

### PUT /agendas/:id
Actualizar agenda

**Headers:** `Authorization: Bearer <token>`

**Permisos:** SUPERADMIN o ADMIN_ENTIDAD

**Request:**
```json
{
  "horaInicio": "13:00",
  "horaFin": "17:00",
  "duracionSlot": 30
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx15a2b3c4d5e6f7g8h9i0j1k",
    "horaInicio": "13:00",
    "horaFin": "17:00",
    "duracionSlot": 30
  },
  "message": "Agenda updated successfully"
}
```

---

### DELETE /agendas/:id
Desactivar agenda

**Headers:** `Authorization: Bearer <token>`

**Permisos:** SUPERADMIN o ADMIN_ENTIDAD

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Agenda deactivated successfully"
}
```

---

### POST /agendas/:id/activate
Activar agenda

**Headers:** `Authorization: Bearer <token>`

**Permisos:** SUPERADMIN o ADMIN_ENTIDAD

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx15a2b3c4d5e6f7g8h9i0j1k",
    "activa": true
  },
  "message": "Agenda activated successfully"
}
```

---

### POST /agendas/:id/generate-slots
Generar slots para un rango de fechas

**Headers:** `Authorization: Bearer <token>`

**Permisos:** SUPERADMIN o ADMIN_ENTIDAD

**Request:**
```json
{
  "fechaInicio": "2024-12-10",
  "fechaFin": "2024-12-31"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx16a2b3c4d5e6f7g8h9i0j1k",
      "agendaId": "clx15a2b3c4d5e6f7g8h9i0j1k",
      "fecha": "2024-12-10T00:00:00.000Z",
      "horaInicio": "14:00",
      "horaFin": "14:45",
      "estado": "DISPONIBLE"
    },
    {
      "id": "clx17a2b3c4d5e6f7g8h9i0j1k",
      "agendaId": "clx15a2b3c4d5e6f7g8h9i0j1k",
      "fecha": "2024-12-10T00:00:00.000Z",
      "horaInicio": "14:45",
      "horaFin": "15:30",
      "estado": "DISPONIBLE"
    }
  ],
  "count": 64,
  "message": "64 slots generated successfully"
}
```

**Nota:** Los slots se generan automáticamente basándose en:
- Día de la semana de la agenda
- Hora de inicio y fin
- Duración del slot

---

## Slots

### GET /slots/available
Obtener slots disponibles

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `agendaId` (requerido): ID de la agenda
- `fecha` (opcional): Fecha específica (YYYY-MM-DD)
- `fechaInicio` (opcional): Fecha de inicio del rango
- `fechaFin` (opcional): Fecha de fin del rango

**Ejemplos:**

Slots de un día específico:
```
GET /slots/available?agendaId=clx15a2b3c4d5e6f7g8h9i0j1k&fecha=2024-12-10
```

Slots de un rango de fechas:
```
GET /slots/available?agendaId=clx15a2b3c4d5e6f7g8h9i0j1k&fechaInicio=2024-12-10&fechaFin=2024-12-15
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx16a2b3c4d5e6f7g8h9i0j1k",
      "agendaId": "clx15a2b3c4d5e6f7g8h9i0j1k",
      "fecha": "2024-12-10T00:00:00.000Z",
      "horaInicio": "14:00",
      "horaFin": "14:45",
      "estado": "DISPONIBLE",
      "notas": null,
      "agenda": {
        "nombre": "Cardiología - Martes",
        "medico": {
          "user": {
            "username": "dra.martinez"
          },
          "especialidad": {
            "nombre": "Cardiología"
          }
        }
      }
    }
  ],
  "count": 8
}
```

**Estados de Slot:**
- `DISPONIBLE` - Disponible para agendar
- `RESERVADO` - Temporalmente bloqueado (5 min)
- `CONFIRMADO` - Tiene cita confirmada
- `CANCELADO` - Cita cancelada
- `BLOQUEADO` - Bloqueado manualmente

---

### GET /slots/:id
Obtener slot por ID

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx16a2b3c4d5e6f7g8h9i0j1k",
    "agendaId": "clx15a2b3c4d5e6f7g8h9i0j1k",
    "fecha": "2024-12-10T00:00:00.000Z",
    "horaInicio": "14:00",
    "horaFin": "14:45",
    "estado": "DISPONIBLE",
    "notas": null,
    "agenda": {
      "nombre": "Cardiología - Martes",
      "medico": {
        "user": {
          "username": "dra.martinez",
          "email": "martinez@clinicaelai.com"
        },
        "especialidad": {
          "nombre": "Cardiología"
        }
      },
      "entidadMedica": {
        "nombre": "Clínica ELAI",
        "direccion": "Calle 100 # 15-20",
        "ciudad": "Bogotá"
      }
    },
    "cita": null,
    "lock": null
  }
}
```

---

### POST /slots
Crear slot manualmente

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "agendaId": "clx15a2b3c4d5e6f7g8h9i0j1k",
  "fecha": "2024-12-25",
  "horaInicio": "10:00",
  "horaFin": "10:45",
  "estado": "DISPONIBLE",
  "notas": "Slot especial navidad"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx18a2b3c4d5e6f7g8h9i0j1k",
    "agendaId": "clx15a2b3c4d5e6f7g8h9i0j1k",
    "fecha": "2024-12-25T00:00:00.000Z",
    "horaInicio": "10:00",
    "horaFin": "10:45",
    "estado": "DISPONIBLE",
    "notas": "Slot especial navidad"
  },
  "message": "Slot created successfully"
}
```

---

### PUT /slots/:id
Actualizar slot

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "estado": "BLOQUEADO",
  "notas": "Médico no disponible - reunión"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx18a2b3c4d5e6f7g8h9i0j1k",
    "estado": "BLOQUEADO",
    "notas": "Médico no disponible - reunión"
  },
  "message": "Slot updated successfully"
}
```

---

### PATCH /slots/:id/block
Bloquear slot manualmente (desde frontend)

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx19a2b3c4d5e6f7g8h9i0j1k",
    "slotId": "clx18a2b3c4d5e6f7g8h9i0j1k",
    "sessionId": "user_clx1a2b3c4d5e6f7g8h9i0j1k",
    "expiresAt": "2024-12-08T14:35:00.000Z"
  },
  "message": "Slot blocked successfully"
}
```

**Nota:** El bloqueo expira automáticamente en 5 minutos

---

### PATCH /slots/:id/unblock
Desbloquear slot manualmente (desde frontend)

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Slot unblocked successfully"
}
```

---

### POST /slots/lock
Bloquear slot (webhook N8N)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "slotId": "clx18a2b3c4d5e6f7g8h9i0j1k",
  "sessionId": "573001234567"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx19a2b3c4d5e6f7g8h9i0j1k",
    "slotId": "clx18a2b3c4d5e6f7g8h9i0j1k",
    "sessionId": "573001234567",
    "expiresAt": "2024-12-08T14:35:00.000Z"
  },
  "message": "Slot locked successfully"
}
```

---

### POST /slots/unlock
Desbloquear slot (webhook N8N)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "slotId": "clx18a2b3c4d5e6f7g8h9i0j1k"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Slot unlocked successfully"
}
```

---

### DELETE /slots/:id
Eliminar slot

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Slot deleted successfully"
}
```

**Errores:**
- `400` - No se puede eliminar un slot con cita

---

## Citas

### GET /citas
Listar citas

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 10)
- `estado` (opcional): Filtrar por estado (PENDIENTE, CONFIRMADA, etc.)
- `fecha` (opcional): Filtrar por fecha específica (YYYY-MM-DD)
- `pacienteId` (opcional): Filtrar por paciente
- `medicoId` (opcional): Filtrar por médico

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx20a2b3c4d5e6f7g8h9i0j1k",
      "slotId": "clx16a2b3c4d5e6f7g8h9i0j1k",
      "pacienteId": "clx6a2b3c4d5e6f7g8h9i0j1k",
      "estado": "CONFIRMADA",
      "motivoConsulta": "Control rutinario",
      "sintomas": "Ninguno",
      "notas": null,
      "recordatorioEnviado": true,
      "createdAt": "2024-12-01T10:30:00.000Z",
      "slot": {
        "fecha": "2024-12-10T00:00:00.000Z",
        "horaInicio": "14:00",
        "horaFin": "14:45",
        "agenda": {
          "nombre": "Cardiología - Martes",
          "medico": {
            "user": {
              "username": "dra.martinez"
            },
            "especialidad": {
              "nombre": "Cardiología"
            }
          }
        }
      },
      "paciente": {
        "nombres": "Juan Carlos",
        "apellidos": "Pérez López",
        "numeroDocumento": "1234567890",
        "telefono": "+573001234567"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1567,
    "totalPages": 157
  }
}
```

**Estados de Cita:**
- `PENDIENTE` - Cita creada, pendiente de confirmación
- `CONFIRMADA` - Cita confirmada por el paciente
- `CANCELADA` - Cita cancelada
- `COMPLETADA` - Cita realizada
- `NO_ASISTIO` - Paciente no asistió

---

### GET /citas/:id
Obtener cita por ID

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx20a2b3c4d5e6f7g8h9i0j1k",
    "estado": "CONFIRMADA",
    "motivoConsulta": "Control rutinario",
    "sintomas": "Ninguno",
    "notas": null,
    "recordatorioEnviado": true,
    "createdAt": "2024-12-01T10:30:00.000Z",
    "slot": {
      "fecha": "2024-12-10T00:00:00.000Z",
      "horaInicio": "14:00",
      "horaFin": "14:45"
    },
    "paciente": {
      "nombres": "Juan Carlos",
      "apellidos": "Pérez López",
      "numeroDocumento": "1234567890",
      "telefono": "+573001234567",
      "email": "juan.perez@email.com"
    }
  }
}
```

---

### POST /citas
Crear nueva cita

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "slotId": "clx16a2b3c4d5e6f7g8h9i0j1k",
  "pacienteId": "clx6a2b3c4d5e6f7g8h9i0j1k",
  "motivoConsulta": "Dolor de cabeza persistente",
  "sintomas": "Cefalea intensa, mareos"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx21a2b3c4d5e6f7g8h9i0j1k",
    "slotId": "clx16a2b3c4d5e6f7g8h9i0j1k",
    "pacienteId": "clx6a2b3c4d5e6f7g8h9i0j1k",
    "estado": "PENDIENTE",
    "motivoConsulta": "Dolor de cabeza persistente",
    "sintomas": "Cefalea intensa, mareos",
    "recordatorioEnviado": false
  },
  "message": "Cita created successfully"
}
```

**Errores:**
- `400` - Slot no disponible
- `409` - Slot ya tiene una cita

---

### POST /citas/create
Crear cita desde N8N (webhook)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "slotId": "clx16a2b3c4d5e6f7g8h9i0j1k",
  "pacienteId": "clx6a2b3c4d5e6f7g8h9i0j1k",
  "motivoConsulta": "Consulta por WhatsApp",
  "sintomas": "Fiebre, tos"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx22a2b3c4d5e6f7g8h9i0j1k",
    "estado": "CONFIRMADA",
    "motivoConsulta": "Consulta por WhatsApp",
    "slot": {
      "fecha": "2024-12-12T00:00:00.000Z",
      "horaInicio": "09:00",
      "horaFin": "09:30"
    }
  },
  "message": "Cita created successfully via N8N"
}
```

---

### PUT /citas/:id
Actualizar cita

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "motivoConsulta": "Control de presión arterial",
  "notas": "Paciente con antecedentes de hipertensión"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx21a2b3c4d5e6f7g8h9i0j1k",
    "motivoConsulta": "Control de presión arterial",
    "notas": "Paciente con antecedentes de hipertensión"
  },
  "message": "Cita updated successfully"
}
```

---

### POST /citas/:id/confirm
Confirmar cita

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx21a2b3c4d5e6f7g8h9i0j1k",
    "estado": "CONFIRMADA"
  },
  "message": "Cita confirmed successfully"
}
```

---

### POST /citas/:id/cancel
Cancelar cita

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "motivo": "Paciente no puede asistir por viaje"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx21a2b3c4d5e6f7g8h9i0j1k",
    "estado": "CANCELADA",
    "notas": "Paciente no puede asistir por viaje"
  },
  "message": "Cita cancelled successfully"
}
```

**Nota:** Al cancelar, el slot vuelve al estado DISPONIBLE

---

### POST /citas/:id/complete
Marcar cita como completada

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx21a2b3c4d5e6f7g8h9i0j1k",
    "estado": "COMPLETADA"
  },
  "message": "Cita marked as completed"
}
```

---

### POST /citas/:id/no-show
Marcar paciente como no asistido

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx21a2b3c4d5e6f7g8h9i0j1k",
    "estado": "NO_ASISTIO"
  },
  "message": "Cita marked as no-show"
}
```

---

## WhatsApp

### GET /whatsapp/webhook
Verificar webhook de WhatsApp

**Query Parameters:**
- `hub.mode`: "subscribe"
- `hub.verify_token`: Token de verificación configurado
- `hub.challenge`: Challenge de WhatsApp

**Response (200 OK):**
```
<hub.challenge value>
```

---

### POST /whatsapp/webhook
Recibir mensajes de WhatsApp

**Headers:**
- `x-hub-signature-256`: Firma HMAC SHA256 de WhatsApp

**Request:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "573001234567",
                "id": "wamid.xxx",
                "timestamp": "1702034400",
                "text": {
                  "body": "Hola, necesito una cita"
                },
                "type": "text"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

### POST /whatsapp/send
Enviar mensaje de WhatsApp (N8N)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "to": "573001234567",
  "message": "Tu cita ha sido confirmada para el 10 de diciembre a las 14:00",
  "type": "text"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messageId": "wamid.xxxyyy",
    "status": "sent"
  },
  "message": "Message sent successfully"
}
```

---

### POST /whatsapp/typing
Enviar indicador de escritura (N8N)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "to": "573001234567"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Typing indicator sent"
}
```

---

### POST /whatsapp/conversation
Crear conversación (N8N)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "sessionId": "573001234567",
  "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
  "pacienteId": "clx6a2b3c4d5e6f7g8h9i0j1k"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx23a2b3c4d5e6f7g8h9i0j1k",
    "sessionId": "573001234567",
    "estado": "ACTIVA",
    "contexto": {},
    "ultimoMensaje": "2024-12-08T14:30:00.000Z"
  }
}
```

---

### PUT /whatsapp/context
Actualizar contexto de conversación (N8N)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "sessionId": "573001234567",
  "contexto": {
    "step": "booking",
    "selectedDoctor": "dr.garcia",
    "selectedDate": "2024-12-15"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "573001234567",
    "contexto": {
      "step": "booking",
      "selectedDoctor": "dr.garcia",
      "selectedDate": "2024-12-15"
    }
  }
}
```

---

### POST /whatsapp/validate-patient
Validar paciente (N8N)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "numeroDocumento": "1234567890",
  "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "exists": true,
    "paciente": {
      "id": "clx6a2b3c4d5e6f7g8h9i0j1k",
      "nombres": "Juan Carlos",
      "apellidos": "Pérez López",
      "numeroDocumento": "1234567890",
      "telefono": "+573001234567"
    }
  }
}
```

Si no existe:
```json
{
  "success": true,
  "data": {
    "exists": false,
    "paciente": null
  }
}
```

---

### GET /whatsapp/conversations
Listar conversaciones

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `estado` (opcional): Filtrar por estado (ACTIVA, FINALIZADA, SUSPENDIDA)
- `entidadMedicaId` (opcional): Filtrar por entidad

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx23a2b3c4d5e6f7g8h9i0j1k",
      "sessionId": "573001234567",
      "estado": "ACTIVA",
      "ultimoMensaje": "2024-12-08T14:30:00.000Z",
      "paciente": {
        "nombres": "Juan Carlos",
        "apellidos": "Pérez López"
      }
    }
  ]
}
```

---

### GET /whatsapp/conversations/:sessionId
Obtener conversación por sessionId

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx23a2b3c4d5e6f7g8h9i0j1k",
    "sessionId": "573001234567",
    "estado": "ACTIVA",
    "contexto": {
      "step": "booking",
      "selectedDoctor": "dr.garcia"
    },
    "ultimoMensaje": "2024-12-08T14:30:00.000Z",
    "paciente": {
      "nombres": "Juan Carlos",
      "apellidos": "Pérez López",
      "numeroDocumento": "1234567890"
    },
    "mensajes": [
      {
        "id": "clx24a2b3c4d5e6f7g8h9i0j1k",
        "tipo": "TEXTO",
        "direccion": "ENTRANTE",
        "contenido": "Hola, necesito una cita",
        "createdAt": "2024-12-08T14:25:00.000Z"
      },
      {
        "id": "clx25a2b3c4d5e6f7g8h9i0j1k",
        "tipo": "TEXTO",
        "direccion": "SALIENTE",
        "contenido": "Hola! Con gusto te ayudo. ¿Para qué especialidad necesitas la cita?",
        "createdAt": "2024-12-08T14:25:05.000Z"
      }
    ]
  }
}
```

---

## AI Usage (Uso de IA)

### POST /ai-usage/log
Registrar uso de IA (N8N)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
  "conversacionId": "clx23a2b3c4d5e6f7g8h9i0j1k",
  "sessionId": "573001234567",
  "modelo": "GPT_4O_MINI",
  "tipoOperacion": "CLASIFICACION_INTENCION",
  "tokensPrompt": 150,
  "tokensCompletion": 50,
  "tokensTotal": 200,
  "costoEstimado": 0.0003,
  "duracionMs": 450,
  "metadata": {
    "intencion": "booking",
    "confianza": 0.95
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx26a2b3c4d5e6f7g8h9i0j1k",
    "tokensTotal": 200,
    "costoEstimado": 0.0003,
    "createdAt": "2024-12-08T14:30:00.000Z"
  },
  "message": "AI usage logged successfully"
}
```

**Modelos soportados:**
- `GPT_4O_MINI`
- `GPT_4`
- `GPT_3_5_TURBO`

**Tipos de Operación:**
- `CLASIFICACION_INTENCION` - Clasificar intención del usuario
- `CLASIFICACION_SINTOMAS` - Clasificar síntomas
- `RESPUESTA_CALIDA` - Generar respuesta empática
- `AGENTE_CONVERSACIONAL` - Conversación general

---

### POST /ai-usage/can-use
Verificar si puede usar IA (N8N)

**Headers:** `x-n8n-secret: <secret>`

**Request:**
```json
{
  "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
  "tokensEstimados": 200
}
```

**Response (200 OK):**

Si puede usar:
```json
{
  "success": true,
  "data": {
    "canUse": true,
    "remaining": {
      "daily": 48000,
      "weekly": 295000,
      "monthly": 1180000
    },
    "limits": {
      "daily": 50000,
      "weekly": 300000,
      "monthly": 1200000
    }
  }
}
```

Si excedió límite:
```json
{
  "success": true,
  "data": {
    "canUse": false,
    "reason": "Daily limit exceeded",
    "remaining": {
      "daily": 0,
      "weekly": 295000,
      "monthly": 1180000
    },
    "limits": {
      "daily": 50000,
      "weekly": 300000,
      "monthly": 1200000
    }
  }
}
```

---

### GET /ai-usage/summary
Obtener resumen de uso de IA

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `entidadMedicaId` (opcional): ID de entidad (requerido si no es SUPERADMIN)
- `period` (opcional): "daily", "weekly", "monthly" (default: "daily")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "daily",
    "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
    "summary": [
      {
        "fecha": "2024-12-08",
        "modelo": "GPT_4O_MINI",
        "tipoOperacion": "CLASIFICACION_INTENCION",
        "totalLlamadas": 45,
        "tokensTotal": 9500,
        "costoTotal": 0.0143
      },
      {
        "fecha": "2024-12-08",
        "modelo": "GPT_4O_MINI",
        "tipoOperacion": "AGENTE_CONVERSACIONAL",
        "totalLlamadas": 120,
        "tokensTotal": 35000,
        "costoTotal": 0.0525
      }
    ],
    "totales": {
      "totalLlamadas": 165,
      "tokensTotal": 44500,
      "costoTotal": 0.0668
    }
  }
}
```

---

### GET /ai-usage/limits
Verificar límites de uso

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `entidadMedicaId` (requerido): ID de entidad

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
    "limits": {
      "limiteTokensDiario": 50000,
      "limiteTokensSemanal": 300000,
      "limiteTokensMensual": 1200000,
      "alertaUmbralPorcent": 80,
      "alertasActivas": true
    },
    "current": {
      "tokensDiarios": 2000,
      "tokensSemanales": 5000,
      "tokensMensuales": 15000
    },
    "remaining": {
      "daily": 48000,
      "weekly": 295000,
      "monthly": 1185000
    },
    "percentageUsed": {
      "daily": 4,
      "weekly": 1.67,
      "monthly": 1.25
    }
  }
}
```

---

### GET /ai-usage/stats/:entidadMedicaId
Obtener estadísticas detalladas

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
    "daily": {
      "totalLlamadas": 165,
      "tokensTotal": 44500,
      "costoTotal": 0.0668
    },
    "weekly": {
      "totalLlamadas": 890,
      "tokensTotal": 245000,
      "costoTotal": 0.3675
    },
    "monthly": {
      "totalLlamadas": 3450,
      "tokensTotal": 985000,
      "costoTotal": 1.4775
    },
    "byModel": {
      "GPT_4O_MINI": {
        "totalLlamadas": 3200,
        "tokensTotal": 920000,
        "costoTotal": 1.38
      },
      "GPT_4": {
        "totalLlamadas": 250,
        "tokensTotal": 65000,
        "costoTotal": 0.0975
      }
    },
    "byOperation": {
      "CLASIFICACION_INTENCION": {
        "totalLlamadas": 1200,
        "tokensTotal": 180000
      },
      "AGENTE_CONVERSACIONAL": {
        "totalLlamadas": 2250,
        "tokensTotal": 805000
      }
    }
  }
}
```

---

### PUT /ai-usage/limits
Actualizar límites de uso

**Headers:** `Authorization: Bearer <token>`

**Permisos:** SUPERADMIN o ADMIN_ENTIDAD

**Request:**
```json
{
  "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
  "limiteTokensDiario": 100000,
  "limiteTokensSemanal": 600000,
  "limiteTokensMensual": 2400000,
  "alertaUmbralPorcent": 85,
  "alertasActivas": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "entidadMedicaId": "clx4a2b3c4d5e6f7g8h9i0j1k",
    "limiteTokensDiario": 100000,
    "limiteTokensSemanal": 600000,
    "limiteTokensMensual": 2400000,
    "alertaUmbralPorcent": 85,
    "alertasActivas": true
  },
  "message": "Limits updated successfully"
}
```

---

## Códigos de Estado

### Códigos de Éxito
- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Solicitud exitosa sin contenido de retorno

### Códigos de Error del Cliente
- `400 Bad Request` - Datos de solicitud inválidos
- `401 Unauthorized` - No autenticado o token inválido
- `403 Forbidden` - No tiene permisos para esta acción
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: recurso duplicado)
- `422 Unprocessable Entity` - Validación de datos falló
- `429 Too Many Requests` - Límite de rate limiting excedido

### Códigos de Error del Servidor
- `500 Internal Server Error` - Error interno del servidor
- `503 Service Unavailable` - Servicio temporalmente no disponible

---

## Manejo de Errores

### Formato de Error Estándar

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "El campo 'email' debe ser un email válido",
  "statusCode": 400
}
```

### Errores de Validación

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Multiple validation errors",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "statusCode": 422
}
```

### Errores de Autenticación

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

### Errores de Autorización

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to perform this action",
  "statusCode": 403
}
```

### Errores de Rate Limiting

```json
{
  "success": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900,
  "statusCode": 429
}
```

---

## Notas Importantes

### Autenticación
- Los tokens JWT expiran en 7 días por defecto
- Almacenar el token de forma segura en el cliente
- Incluir el token en el header `Authorization: Bearer <token>` en cada petición autenticada

### Paginación
- Por defecto, se retornan 10 elementos por página
- Máximo de 100 elementos por página
- Incluir `page` y `limit` como query parameters

### Fechas y Horas
- Todas las fechas están en formato ISO 8601
- Zona horaria: America/Bogota (UTC-5)
- Las horas se almacenan en formato "HH:mm" (24 horas)

### Rate Limiting
- Límites por endpoint (ver sección de Rate Limiting)
- Headers de respuesta incluyen `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Webhooks
- WhatsApp webhooks requieren firma HMAC SHA256
- N8N webhooks requieren secret en header `x-n8n-secret`
- Validación automática por middleware

### Seguridad
- Todas las contraseñas se hashean con bcrypt
- Validación de inputs con Zod schemas
- Protección contra SQL Injection via Prisma ORM
- Headers de seguridad con Helmet
- CORS configurado

---

**Versión:** 1.0.0
**Última actualización:** 8 de Diciembre de 2024
**Contacto:** dev@elai.com
