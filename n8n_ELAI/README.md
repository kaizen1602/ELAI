# 🤖 Sophia WhatsApp Bot - Flujos N8n

## 📋 Descripción General

Sistema de agendamiento médico automatizado con IA que permite a los pacientes interactuar vía WhatsApp para:
- ✅ Validar identidad médica con documento
- ✅ Clasificar síntomas automáticamente con IA
- ✅ Consultar citas médicas disponibles
- ✅ Agendar, listar y cancelar citas
- ✅ Recibir asistencia personalizada con Sophia (AI Agent)

**Tecnologías**: N8n + Django REST + OpenAI GPT-4 + WhatsApp Business API + PostgreSQL

---

## 🏗️ Arquitectura

```
WhatsApp → N8n (AI Agent) → Django REST APIs → PostgreSQL
              ↓
          OpenAI GPT-4
```

---

## 📁 Flujos Disponibles

| # | Archivo | Tipo | Propósito | API Backend | Integrado |
|---|---------|------|-----------|--------------| --------- |
| 01 | `01-principal.json` | Principal | Orquestador AI Agent con 8 tools | N/A (coordina) | ✅ |
| 02 | `02-sub-validar-paciente.json` | Subflujo | Validar documento y generar JWT | `POST /pacientes/validar/` | ✅ Tool 1 |
| 03 | `03-sub-crear-conversacion.json` | Auxiliar | Crear registro de conversación | `POST /conversaciones/` | ⚙️ Llamado por 02 |
| 04 | `04-sub-clasificar-sintomas.json` | Subflujo | Clasificar síntomas con IA | OpenAI Chat API | ✅ Tool 2 |
| 05 | `05-sub-consultar-citas.json` | Subflujo | Consultar citas disponibles | `GET /citas/disponibles/` | ✅ Tool 3 |
| 06 | `06-sub-agendar-cita.json` | Subflujo | Agendar nueva cita | `POST /citas/` | ✅ Tool 4 |
| 07 | `07-sub-listar-citas-activas.json` | Subflujo | Listar citas del paciente | `GET /citas/paciente/{id}/activas/` | ✅ Tool 5 |
| 08 | `08-sub-confirmar-cancelacion.json` | Subflujo | Cancelar cita específica | `POST /citas/{id}/cancelar/` | ✅ Tool 6 |
| 09 | `09-sub-actualizar-contexto.json` | Subflujo | Actualizar contexto conversación | `PUT /conversaciones/{id}/actualizar-contexto/` | ✅ Tool 7 |
| 10 | `10-sub-finalizar-conversacion.json` | Subflujo | Finalizar conversación | `PUT /conversaciones/{id}/finalizar/` | ✅ Tool 8 |

**Total**: 1 flujo principal + 8 tools + 1 auxiliar = **10 flujos**

---

## 🔧 Variables Globales N8n

**⚠️ REQUERIDAS** - Configurar en N8n Cloud: **Settings → Environment Variables**

| Variable | Valor Ejemplo | Descripción | Sintaxis |
|----------|---------------|-------------|----------|
| `BACKEND_NGROK_URL` | `https://c61c848cfc22...` | URL base del backend Django | `$vars.BACKEND_NGROK_URL` |
| `NGROK_HEADER_NAME` | `ngrok-skip-browser-warning` | Header para bypass ngrok | `$vars.NGROK_HEADER_NAME` |
| `NGROK_HEADER_VALUE` | `true` | Valor del header | `$vars.NGROK_HEADER_VALUE` |
| `WHATSAPP_PHONE_ID` | `807602635767022` | Phone Number ID de WhatsApp | `$vars.WHATSAPP_PHONE_ID` |

**Beneficio**: Cambiar la URL del backend en 1 lugar, no en 8 archivos.

---

## 🚀 Guía de Deployment

### Paso 1: Preparar Backend

```bash
# Iniciar backend Django
cd sophia/backend
python manage.py runserver 0.0.0.0:8000

# Iniciar túnel ngrok
ngrok http 8000
# Copiar URL generada (ej: https://c61c848cfc22.ngrok-free.app)
```

### Paso 2: Configurar Variables en N8n Cloud

1. Ir a **Settings** → **Environment Variables**
2. Crear las 4 variables listadas arriba
3. Pegar la URL de ngrok en `BACKEND_NGROK_URL`
4. Guardar

### Paso 3: Importar Flujos

**⚠️ ORDEN IMPORTANTE**:

```
1. Importar PRIMERO los subflujos (02 al 10)
2. Copiar los IDs generados por N8n para cada flujo
3. Actualizar los IDs en 01-principal.json
4. Importar 01-principal.json
```

**Obtener IDs**: En cada flujo importado, ir a **Settings** → copiar **Workflow ID**

### Paso 4: Actualizar IDs en Flujo Principal

Editar `01-principal.json` y buscar:

```json
"value": "PEGAR_ID_DEL_SUBFLUJO_VALIDAR_AQUI"
"value": "ID_SUBFLUJO_CLASIFICAR"
// etc.
```

Reemplazar con IDs reales de N8n:

```json
{
  "tool_validar_paciente": "abc123xyz456",
  "tool_clasificar_sintomas": "def789uvw012",
  "tool_consultar_citas": "ghi345rst678",
  // ... etc
}
```

### Paso 5: Configurar Credenciales

1. **WhatsApp Business API**:
   - Nodo "WhatsApp Trigger"
   - Create New Credential
   - Ingresar Access Token y Phone Number ID

2. **OpenAI API**:
   - Nodo "OpenAI Chat Model"
   - Create New Credential
   - Ingresar API Key de OpenAI

### Paso 6: Activar Flujo

1. Abrir `01-principal.json`
2. Click **Activate** (toggle superior derecha)
3. ¡Sophia está lista para recibir mensajes!

---

## 🧪 Testing End-to-End

### Test 1: Validación de Paciente

**Entrada**:
```
Usuario: "Hola"
Sophia: "¡Hola! Soy Sophia. ¿Podrías compartirme tu cédula?"
Usuario: "1234567890"
```

**Resultado Esperado**:
- ✅ Paciente validado
- ✅ Token JWT generado
- ✅ Conversación creada
- ✅ Respuesta: "¡Perfecto, [nombre]! ¿En qué puedo ayudarte?"

**Verificar en BD**:
```sql
SELECT * FROM conversacion_whatsapp WHERE session_id = '573001234567';
```

### Test 2: Clasificación y Agendamiento

**Entrada**:
```
Usuario: "Necesito una cita, tengo dolor de cabeza fuerte"
```

**Resultado Esperado**:
- ✅ Síntomas clasificados (categoría: "general")
- ✅ Citas disponibles consultadas
- ✅ Lista mostrada al usuario
- ✅ Usuario puede seleccionar y agendar

### Test 3: Cancelación de Cita

**Entrada**:
```
Usuario: "Quiero cancelar una cita"
```

**Resultado Esperado**:
- ✅ Lista de citas activas mostrada
- ✅ Usuario selecciona cita
- ✅ Confirmación de cancelación
- ✅ Slot liberado en BD

---

## 🔍 Debugging

### Ver Logs Estructurados

Los flujos generan logs en formato JSON:

```json
{
  "level": "INFO",
  "timestamp": "2025-10-28T15:30:45.123Z",
  "operation": "AGENDAR_CITA",
  "sessionId": "573001234567",
  "paciente_id": 1,
  "success": true
}
```

**Dónde ver**: N8n → **Executions** → Click en ejecución → Ver detalles de cada nodo

### Errores Comunes

| Error | Causa Probable | Solución |
|-------|----------------|----------|
| `401 Unauthorized` | Token JWT expirado/inválido | Validar paciente nuevamente |
| `404 Not Found` | URL backend incorrecta | Verificar `BACKEND_NGROK_URL` |
| `Timeout` | Backend no responde | Verificar que backend esté corriendo |
| `Workflow not found` | ID subflujo incorrecto | Actualizar IDs en 01-principal.json |
| `ngrok tunnel closed` | Túnel ngrok cerrado | Reiniciar ngrok y actualizar variable |

---

## 📊 Cambios vs Versión Anterior

### Migración PostgreSQL → APIs REST

| Operación | ❌ Antes (v1.0) | ✅ Ahora (v2.0) |
|-----------|----------------|-----------------|
| Validar Paciente | `SELECT FROM paciente` | `POST /pacientes/validar/` |
| Crear Conversación | `INSERT INTO conversacion_whatsapp` | `POST /conversaciones/` |
| Consultar Citas | `SELECT FROM agenda WHERE...` | `GET /citas/disponibles/?categoria=...` |
| Agendar Cita | `INSERT INTO cita` | `POST /citas/` |
| Listar Citas | `SELECT FROM cita WHERE estado='ACTIVO'` | `GET /citas/paciente/{id}/activas/` |
| Cancelar Cita | `UPDATE cita SET estado='CANCELADA'` | `POST /citas/{id}/cancelar/` |

### Mejoras Implementadas

- ✅ **0 conexiones directas** a PostgreSQL
- ✅ **Variables globales** para URLs (fácil mantenimiento)
- ✅ **Manejo de errores** robusto (`continueOnFail` en todos)
- ✅ **Timeouts aumentados** de 5s a 15s
- ✅ **Logging estructurado** en formato JSON
- ✅ **2 flujos nuevos**: actualizar-contexto y finalizar-conversacion
- ✅ **JWT Authentication** en todos los endpoints

---

## 🔒 Seguridad

### Implementado

- ✅ JWT Authentication en todas las APIs
- ✅ Timeouts de 15s en requests
- ✅ Manejo de errores sin exponer datos sensibles
- ✅ Validación de input antes de enviar a APIs
- ✅ Logs sin tokens ni información médica sensible

### ⚠️ NO Loguear

- Tokens JWT completos
- Números de teléfono completos
- Información médica detallada

### ✅ SÍ Loguear

- IDs (paciente_id, cita_id, etc.)
- Operaciones y timestamps
- Mensajes de error generales
- Métricas de performance

---

## 🛠️ Mantenimiento

### Actualizar URL del Backend

```bash
# En N8n Cloud
Settings → Environment Variables → BACKEND_NGROK_URL
# Cambiar valor y guardar
# ✅ Todos los flujos usan la nueva URL automáticamente
```

### Agregar Nuevo Flujo/Tool

1. Crear archivo JSON del subflujo
2. Importar en N8n
3. Copiar Workflow ID
4. Agregar tool en `01-principal.json`
5. Actualizar prompt del AI Agent
6. Probar end-to-end

---

## 📚 Archivos de Referencia

- **`LOGGING_TEMPLATE.md`** - Templates para logging estructurado
- **`MEJORAS_FASE2.md`** - Mejoras opcionales pendientes de implementar
- **`../CLAUDE.md`** - Documentación completa del backend Django

---

## 🎯 Quick Start

```bash
# 1. Backend corriendo
python manage.py runserver 0.0.0.0:8000

# 2. Túnel ngrok
ngrok http 8000

# 3. Configurar variables en N8n
BACKEND_NGROK_URL=<URL_NGROK>
NGROK_HEADER_NAME=ngrok-skip-browser-warning
NGROK_HEADER_VALUE=true
WHATSAPP_PHONE_ID=807602635767022

# 4. Importar flujos (02-10 primero, luego 01)

# 5. Activar flujo principal

# 6. Enviar mensaje WhatsApp
"Hola" → ¡Sophia responde!
```

---

## 📝 Changelog

### [v2.0.0] - 2025-10-28

**✅ Migración Completa a APIs REST**
- Eliminadas todas las conexiones directas a PostgreSQL
- Implementadas variables globales N8n
- Manejo de errores mejorado (continueOnFail, alwaysOutputData)
- Timeouts aumentados a 15 segundos
- Nuevos flujos: 09-actualizar-contexto, 10-finalizar-conversacion
- Logging estructurado en formato JSON
- Documentación completa

### [v1.0.0] - 2025-09-26

**⚠️ Versión Legacy**
- Conexiones directas a PostgreSQL (deprecated)
- URLs hardcodeadas (deprecated)
- Sin manejo de errores robusto (deprecated)

---

**Última actualización**: 28 de Octubre, 2025
**Versión**: 2.0.0
**Equipo**: Sophia Medical AI
**Soporte**: Ver issues en repositorio

🎉 **¡Sophia lista para ayudar a los pacientes!**
