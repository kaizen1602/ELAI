# 🏗️ ARQUITECTURA OPTIMIZADA - SOPHIA AI SYSTEM

## 📋 ÍNDICE
1. [Visión General](#visión-general)
2. [Arquitectura Redis](#arquitectura-redis)
3. [State Machine Principal](#state-machine-principal)
4. [Flujo de Datos](#flujo-de-datos)
5. [Manejo de Colisiones](#manejo-de-colisiones)
6. [Typing Indicator](#typing-indicator)
7. [APIs Django Utilizadas](#apis-django-utilizadas)
8. [APIs Faltantes/Mejoras](#apis-faltantesmejoras)
9. [Deployment a Producción](#deployment-a-producción)
10. [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)

---

## 🎯 VISIÓN GENERAL

### Sistema
**SOPHIA** es un agente conversacional médico inteligente que opera sobre WhatsApp para gestionar citas médicas en múltiples clínicas reales.

### Stack Tecnológico
- **Orquestador:** n8n (workflows)
- **Backend:** Django REST Framework
- **Base de Datos:** PostgreSQL (datos persistentes)
- **Caché/Estado:** Redis (estados transitorios, locks, pub/sub)
- **IA:** OpenAI GPT-4o (clasificación y conversación)
- **Mensajería:** WhatsApp Business API
- **Túnel (Dev):** ngrok
- **Deployment (Prod):** Docker Compose, Kubernetes-ready

### Objetivos de la Optimización
1. ✅ **Robustez:** Manejo de colisiones, race conditions, timeouts
2. ✅ **Escalabilidad:** Arquitectura multi-clínica, multi-usuario
3. ✅ **Observabilidad:** Logging estructurado, métricas, trazabilidad
4. ✅ **Mantenibilidad:** Código limpio, DRY, documentado
5. ✅ **UX:** Typing indicator, respuestas rápidas, manejo de errores amigable

---

## 🔴 ARQUITECTURA REDIS

### Estructura de Claves

#### 1. Estado de Sesión
```
Clave: sophia:session:{session_id}
TTL: 30 minutos (auto-refresh en cada interacción)
Tipo: Hash

Campos:
- paciente_id: int
- paciente_nombre: string
- documento: string
- entidad_medica_id: int
- token: string (JWT)
- estado_flujo: string (enum)
- ultima_actividad: timestamp ISO
- conversacion_id: int
- sintomas_reportados: string
- categoria_identificada: string
- confianza_ia: float
```

**Estados de flujo (FSM):**
- `INICIAL` - Usuario nuevo, esperando documento
- `VALIDADO` - Documento verificado, esperando síntomas
- `SINTOMAS_CLASIFICADOS` - IA clasificó síntomas, esperando confirmación
- `CITAS_MOSTRADAS` - Citas disponibles mostradas, esperando selección
- `CITA_SELECCIONADA` - Usuario eligió cita, esperando confirmación
- `CITA_AGENDADA` - Cita confirmada
- `CANCELACION_INICIADA` - Usuario solicitó cancelar
- `FINALIZADO` - Conversación terminada

#### 2. Mapeo de Citas (Paginación)
```
Clave: sophia:citas:{session_id}:page:{page}
TTL: 10 minutos
Tipo: String (JSON)

Estructura:
{
  "categoria": "general",
  "entidad_medica_id": 5,
  "page": 1,
  "total_citas": 351,
  "citas_mostradas": [
    {
      "posicion": 1,
      "slot_id": 2950,
      "agenda_id": 199,
      "fecha": "18 de noviembre",
      "hora": "08:00 AM",
      "medico": "Dr. Carlos García",
      "especialidad": "Medicina General"
    },
    ...
  ],
  "has_more": true,
  "timestamp": "2024-11-28T15:30:00Z"
}
```

#### 3. Lock de Ejecución (Prevenir colisiones)
```
Clave: sophia:lock:{session_id}
TTL: 60 segundos (auto-expire)
Tipo: String

Valor: execution_id (UUID de n8n)

Propósito:
- Prevenir múltiples ejecuciones simultáneas del mismo usuario
- Si existe lock → rechazar nueva ejecución con mensaje amigable
```

#### 4. Typing Indicator
```
Clave: sophia:typing:{session_id}
TTL: 5 segundos (se refresca cada 2 segundos)
Tipo: String

Valor: "true" | "false"

Pub/Sub Canal: sophia:typing-channel
Mensaje: {"session_id": "573001234567", "status": "typing" | "stopped"}
```

#### 5. Caché de APIs
```
Clave: sophia:cache:citas:{categoria}:{entidad_medica_id}:page:{page}
TTL: 5 minutos
Tipo: String (JSON)

Propósito: Reducir carga en Django

Clave: sophia:cache:paciente:{documento}
TTL: 60 minutos
Tipo: String (JSON)
```

#### 6. Auditoría Temporal
```
Clave: sophia:audit:{session_id}:{timestamp}
TTL: 7 días
Tipo: String (JSON)

Estructura:
{
  "timestamp": "2024-11-28T15:30:00Z",
  "execution_id": "uuid",
  "flujo": "02-sub-validar-paciente",
  "accion": "validar_documento",
  "input": {...},
  "output": {...},
  "duracion_ms": 234,
  "error": null
}
```

#### 7. Rate Limiting (Seguridad)
```
Clave: sophia:ratelimit:{session_id}
TTL: 60 segundos
Tipo: String (contador)

Límite: 10 mensajes por minuto por usuario
Si excede → responder "Por favor espera un momento..."
```

### Operaciones Redis en Flujos

**Inicio de Ejecución (01-principal):**
```javascript
// 1. Verificar lock
const lockKey = `sophia:lock:${session_id}`;
const lockExists = await redis.exists(lockKey);
if (lockExists) {
  return { error: "Ya estoy procesando tu mensaje anterior, espera un momento..." };
}

// 2. Crear lock
await redis.setex(lockKey, 60, execution_id);

// 3. Verificar rate limit
const rateLimitKey = `sophia:ratelimit:${session_id}`;
const count = await redis.incr(rateLimitKey);
if (count === 1) await redis.expire(rateLimitKey, 60);
if (count > 10) {
  await redis.del(lockKey);
  return { error: "Demasiados mensajes, espera un momento..." };
}

// 4. Obtener sesión
const sessionKey = `sophia:session:${session_id}`;
const session = await redis.hgetall(sessionKey);

// 5. Activar typing
await redis.setex(`sophia:typing:${session_id}`, 5, "true");
await redis.publish("sophia:typing-channel", JSON.stringify({
  session_id,
  status: "typing"
}));
```

**Fin de Ejecución (01-principal):**
```javascript
// 1. Actualizar sesión
await redis.hmset(sessionKey, {
  ultima_actividad: new Date().toISOString(),
  estado_flujo: nuevoEstado
});
await redis.expire(sessionKey, 1800); // 30 min

// 2. Desactivar typing
await redis.del(`sophia:typing:${session_id}`);
await redis.publish("sophia:typing-channel", JSON.stringify({
  session_id,
  status: "stopped"
}));

// 3. Liberar lock
await redis.del(lockKey);

// 4. Auditoría
await redis.setex(
  `sophia:audit:${session_id}:${Date.now()}`,
  604800, // 7 días
  JSON.stringify(auditData)
);
```

---

## 🔄 STATE MACHINE PRINCIPAL

### Diagrama de Estados

```
┌─────────────┐
│   INICIAL   │ Usuario nuevo, sin sesión
└──────┬──────┘
       │ Envía mensaje
       ↓
┌─────────────────┐
│ Documento?      │
│ (Regex: \d{8,15})│
└──────┬──────────┘
       │ SÍ → tool_validar_paciente
       ↓
┌──────────────┐
│   VALIDADO   │ Paciente identificado
└──────┬───────┘
       │ "¿Qué síntomas tienes?"
       ↓
┌─────────────────────┐
│ Describe síntomas   │
└──────┬──────────────┘
       │ tool_clasificar_sintomas
       ↓
┌──────────────────────────┐
│ SINTOMAS_CLASIFICADOS    │
└──────┬───────────────────┘
       │ tool_consultar_citas
       ↓
┌──────────────────┐
│ CITAS_MOSTRADAS  │ 10 citas en pantalla
└──────┬───────────┘
       │ Usuario elige número
       ↓
┌───────────────────────┐
│ CITA_SELECCIONADA     │
└──────┬────────────────┘
       │ "¿Confirmas?"
       ↓
┌──────────────┐
│ SÍ → Agendar │ tool_agendar_cita
└──────┬───────┘
       │
       ↓
┌──────────────────┐
│  CITA_AGENDADA   │ ✅ Éxito
└──────┬───────────┘
       │
       ↓ (Usuario pregunta algo más)
       │
┌──────────────────┐
│  AI Agent libre  │ Conversación general
└──────────────────┘

Ramas alternativas:

VALIDADO → "Quiero cancelar" → tool_cancelar_cita
           ↓
    ┌──────────────────────┐
    │ CANCELACION_INICIADA │
    └──────┬───────────────┘
           │ tool_confirmar_cancelacion
           ↓
    ┌──────────────┐
    │  FINALIZADO  │
    └──────────────┘
```

### Transiciones de Estado

| Estado Actual | Evento | Acción | Estado Nuevo |
|---------------|--------|--------|--------------|
| INICIAL | Mensaje con documento | tool_validar_paciente | VALIDADO |
| INICIAL | Mensaje sin documento | AI Agent pregunta documento | INICIAL |
| VALIDADO | Describe síntomas | tool_clasificar_sintomas | SINTOMAS_CLASIFICADOS |
| SINTOMAS_CLASIFICADOS | Automático | tool_consultar_citas | CITAS_MOSTRADAS |
| CITAS_MOSTRADAS | Elige número | Guardar selección en Redis | CITA_SELECCIONADA |
| CITAS_MOSTRADAS | "Siguiente página" | tool_consultar_citas (page+1) | CITAS_MOSTRADAS |
| CITA_SELECCIONADA | "Sí" / "Confirmo" | tool_agendar_cita | CITA_AGENDADA |
| CITA_SELECCIONADA | "No" / "Otra" | Volver | CITAS_MOSTRADAS |
| * | "Cancelar cita" | tool_cancelar_cita | CANCELACION_INICIADA |
| CANCELACION_INICIADA | Confirma ID | tool_confirmar_cancelacion | FINALIZADO |
| * | Timeout 30 min | Guardar en BD | FINALIZADO |

### Implementación en 01-principal.json

El flujo principal debe implementar verificaciones de estado ANTES de delegar al AI Agent:

```javascript
// Pseudo-código del nodo "Determinar Estado"
const session = redis_session; // de Redis
const message = user_message; // de WhatsApp

// Verificar timeout
if (session.ultima_actividad < now - 30*60*1000) {
  session.estado_flujo = "FINALIZADO";
  return { message: "Tu sesión expiró. Envía tu documento para empezar de nuevo." };
}

// FSM
switch (session.estado_flujo) {
  case "INICIAL":
    // ¿Es un documento?
    const doc = extractDocumento(message);
    if (doc) {
      return { tool: "validar_paciente", documento: doc };
    } else {
      return { ai_agent: true, prompt_hint: "Pedir documento amablemente" };
    }

  case "VALIDADO":
    // ¿Describe síntomas?
    if (message.length > 10 && !containsNumber(message)) {
      return { tool: "clasificar_sintomas", sintomas: message };
    } else {
      return { ai_agent: true, prompt_hint: "Preguntar síntomas" };
    }

  case "CITAS_MOSTRADAS":
    // ¿Es un número?
    const num = extractNumber(message);
    if (num >= 1 && num <= 10) {
      const citasCache = await redis.get(`sophia:citas:${session_id}:page:${session.page || 1}`);
      const cita = citasCache.citas_mostradas.find(c => c.posicion === num);
      if (cita) {
        await redis.hmset(`sophia:session:${session_id}`, {
          cita_seleccionada_slot_id: cita.slot_id,
          estado_flujo: "CITA_SELECCIONADA"
        });
        return { ai_agent: true, prompt_hint: `Confirmar cita: ${cita.fecha} ${cita.hora} con ${cita.medico}` };
      }
    }
    // ¿Pide más citas?
    if (message.includes("más") || message.includes("siguiente")) {
      return { tool: "consultar_citas", page: (session.page || 1) + 1 };
    }
    return { ai_agent: true };

  case "CITA_SELECCIONADA":
    if (message.match(/sí|si|confirmo|ok|dale/i)) {
      return { tool: "agendar_cita", slot_id: session.cita_seleccionada_slot_id };
    } else if (message.match(/no|otra|cambiar/i)) {
      await redis.hmset(`sophia:session:${session_id}`, { estado_flujo: "CITAS_MOSTRADAS" });
      return { tool: "consultar_citas", page: session.page || 1 };
    }
    return { ai_agent: true, prompt_hint: "Confirmar sí o no" };

  default:
    // Estado genérico, usar AI Agent
    return { ai_agent: true };
}
```

---

## 📊 FLUJO DE DATOS

### Entrada (WhatsApp → 01-principal)
```json
{
  "messages": [{
    "from": "573001234567",
    "id": "wamid.xxx",
    "timestamp": "1732800000",
    "type": "text",
    "text": {
      "body": "Hola, tengo dolor de cabeza"
    }
  }],
  "contacts": [{
    "profile": { "name": "Juan Pérez" },
    "wa_id": "573001234567"
  }]
}
```

### Procesamiento (01-principal)
1. **Extraer Datos**
   - session_id = messages[0].from
   - message_text = text.body
   - contact_name = contacts[0].profile.name

2. **Verificar Lock**
   - Redis GET sophia:lock:{session_id}
   - Si existe → rechazar

3. **Crear Lock**
   - Redis SETEX sophia:lock:{session_id} 60 {execution_id}

4. **Obtener Sesión**
   - Redis HGETALL sophia:session:{session_id}
   - Si no existe → crear nueva

5. **Activar Typing**
   - Redis SETEX sophia:typing:{session_id} 5 "true"
   - Redis PUBLISH sophia:typing-channel {session_id, "typing"}

6. **Determinar Estado (FSM)**
   - Analizar estado_flujo
   - Decidir: tool directo vs AI Agent

7. **Ejecutar Tool o AI Agent**
   - Llamar subflujo correspondiente
   - Actualizar estado

8. **Actualizar Sesión**
   - Redis HMSET sophia:session:{session_id}
   - Redis EXPIRE sophia:session:{session_id} 1800

9. **Desactivar Typing**
   - Redis DEL sophia:typing:{session_id}
   - Redis PUBLISH sophia:typing-channel {session_id, "stopped"}

10. **Liberar Lock**
    - Redis DEL sophia:lock:{session_id}

11. **Enviar Respuesta**
    - WhatsApp send message

### Salida (01-principal → WhatsApp)
```json
{
  "phoneNumber": "573001234567",
  "textBody": "Entiendo que tienes dolor de cabeza. Te mostraré citas disponibles con Medicina General...\n\n1. Lunes 18 de noviembre - 08:00 AM\nDr. Carlos García\n\n2. Lunes 18 de noviembre - 08:30 AM\nDra. María López\n\n...\n\n¿Cuál prefieres? (Responde con el número)"
}
```

---

## 🔒 MANEJO DE COLISIONES

### Escenario 1: Usuario envía múltiples mensajes rápidos
**Problema:** n8n puede ejecutar 2+ workflows en paralelo para el mismo usuario.

**Solución (Lock con Redis):**
```javascript
// Al inicio de 01-principal (nodo "Verificar Lock")
const lockKey = `sophia:lock:${session_id}`;
const lockValue = execution_id; // UUID único de n8n

// Intentar adquirir lock (atomic)
const acquired = await redis.set(lockKey, lockValue, 'NX', 'EX', 60);

if (!acquired) {
  // Lock ya existe, otro workflow procesando
  return {
    error: true,
    message: "Estoy procesando tu mensaje anterior, dame un segundo... 😊"
  };
}

// Lock adquirido, continuar...
```

**Liberación:**
```javascript
// Al final de 01-principal (nodo "Liberar Lock")
// Verificar que el lock sigue siendo nuestro (evitar borrar lock de otro)
const currentLock = await redis.get(lockKey);
if (currentLock === execution_id) {
  await redis.del(lockKey);
}
```

### Escenario 2: Race condition en agendamiento de cita
**Problema:** Usuario A y B intentan agendar el mismo slot simultáneamente.

**Solución (Lock a nivel de slot + verificación doble):**

**En 06-sub-agendar-cita:**
```javascript
// Nodo "Lock de Slot"
const slotLockKey = `sophia:slot_lock:${slot_id}`;
const slotLockValue = `${session_id}:${execution_id}`;

const slotAcquired = await redis.set(slotLockKey, slotLockValue, 'NX', 'EX', 10);

if (!slotAcquired) {
  return {
    success: false,
    error: "Este horario está siendo reservado por otro paciente en este momento. Por favor elige otro."
  };
}

// Verificar disponibilidad en BD
const slot = await django_api.get(`/api/v1/slots/${slot_id}/`);

if (!slot.disponible) {
  await redis.del(slotLockKey);
  return {
    success: false,
    error: "Este horario ya fue ocupado. Te muestro otras opciones..."
  };
}

// Intentar agendar
try {
  const cita = await django_api.post('/api/v1/citas/', {
    paciente: paciente_id,
    slot: slot_id,
    motivo_consulta: motivo,
    telefono: session_id
  });

  await redis.del(slotLockKey);
  return { success: true, cita_id: cita.id };

} catch (error) {
  await redis.del(slotLockKey);
  return { success: false, error: error.message };
}
```

**Mejora en Django (backend/accounts/views.py):**

Agregar transaction lock en el método `create` de `CitaViewSet`:
```python
from django.db import transaction

class CitaViewSet(viewsets.ModelViewSet):
    @transaction.atomic
    def create(self, request):
        slot_id = request.data.get('slot')

        # Lock a nivel de BD (evita race condition)
        slot = Slot.objects.select_for_update().get(id=slot_id)

        if not slot.disponible:
            return Response({
                "error": "Slot no disponible"
            }, status=400)

        # Crear cita
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cita = serializer.save()

        # Marcar slot como no disponible
        slot.disponible = False
        slot.save()

        return Response(serializer.data, status=201)
```

### Escenario 3: Timeout de ejecución (n8n cae a mitad de flujo)
**Problema:** n8n se cae o timeout, lock queda huérfano.

**Solución (TTL automático):**
- Todos los locks tienen TTL de 60 segundos
- Si n8n no libera, Redis auto-expira
- Usuario puede reintentar después de 1 minuto

---

## 💬 TYPING INDICATOR

### Implementación con Redis Pub/Sub

**Arquitectura:**
```
n8n (Publisher)
  ↓ PUBLISH sophia:typing-channel
Redis (Broker)
  ↓ SUBSCRIBE sophia:typing-channel
WhatsApp Backend (Subscriber)
  ↓ Send typing action
WhatsApp User
```

**Inicio de typing (en TODOS los subflujos):**

**Nodo "Activar Typing" (al inicio):**
```javascript
const session_id = $json.session_id;

// 1. Guardar estado en Redis
await $redis.setex(`sophia:typing:${session_id}`, 5, "true");

// 2. Publicar en canal
await $redis.publish("sophia:typing-channel", JSON.stringify({
  session_id: session_id,
  status: "typing",
  timestamp: new Date().toISOString()
}));

return { typing_activated: true };
```

**Fin de typing (al final):**

**Nodo "Desactivar Typing" (al final):**
```javascript
const session_id = $json.session_id;

// 1. Eliminar estado
await $redis.del(`sophia:typing:${session_id}`);

// 2. Publicar fin
await $redis.publish("sophia:typing-channel", JSON.stringify({
  session_id: session_id,
  status: "stopped",
  timestamp: new Date().toISOString()
}));

return { typing_deactivated: true };
```

**Subscriber (proceso separado - Python/Node.js):**

**whatsapp_typing_subscriber.py:**
```python
import redis
import json
from whatsapp_api import send_typing_action

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
pubsub = redis_client.pubsub()
pubsub.subscribe('sophia:typing-channel')

for message in pubsub.listen():
    if message['type'] == 'message':
        data = json.loads(message['data'])
        session_id = data['session_id']
        status = data['status']

        if status == 'typing':
            # Enviar acción "typing" a WhatsApp cada 2 segundos
            send_typing_action(session_id, action='typing')
        elif status == 'stopped':
            # Detener typing
            send_typing_action(session_id, action='stop')
```

**Integración en flujos:**

TODOS los subflujos (02-10) deben tener estos 2 nodos:
1. **Al inicio:** "Activar Typing"
2. **Al final (antes de return):** "Desactivar Typing"

**Ubicación en flujos:**
- 01-principal: Activar ANTES de "Determinar Estado", desactivar ANTES de "Send WhatsApp"
- 02-validar: Activar en nodo 1, desactivar antes de return
- 04-clasificar: Activar en nodo 1, desactivar después de OpenAI
- 05-consultar: Activar en nodo 1, desactivar después de formatear
- 06-agendar: Activar en nodo 1, desactivar antes de return
- Etc.

---

## 🔌 APIS DJANGO UTILIZADAS

### Mapeo Completo (Flujo → Endpoint)

| Flujo | Endpoint | Método | JWT | Propósito |
|-------|----------|--------|-----|-----------|
| 01-principal | /api/v1/conversaciones/activa-publica/{id}/ | GET | ✗ | Obtener conversación activa |
| 02-validar | /api/v1/pacientes/validar/ | POST | ✗ | Validar documento paciente |
| 02-validar | /api/v1/conversaciones/activa-publica/{id}/ | GET | ✗ | Verificar conversación |
| 02-validar | /api/v1/conversaciones/ | POST | ✓ | Crear conversación nueva |
| 04-clasificar | (OpenAI) | - | - | Clasificar síntomas con IA |
| 05-consultar | /api/v1/citas/disponibles/ | GET | ✓ | Listar citas por categoría |
| 06-agendar | /api/v1/slots/{id}/ | GET | ✓ | Verificar slot disponible |
| 06-agendar | /api/v1/citas/ | POST | ✓ | Crear cita |
| 07-listar | /api/v1/citas/paciente/{id}/activas/ | GET | ✓ | Listar citas del paciente |
| 08-cancelar | /api/v1/citas/{id}/cancelar/ | POST | ✓ | Cancelar cita |
| 09-actualizar | /api/v1/conversaciones/{id}/actualizar-contexto/ | PUT | ✓ | Actualizar contexto |
| 10-finalizar | /api/v1/conversaciones/{id}/finalizar/ | PUT | ✓ | Finalizar conversación |

### Headers Estándar (todas las llamadas)
```json
{
  "Authorization": "Bearer {{ $json.token }}",
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
  "X-Request-ID": "{{ $execution.id }}",
  "X-Session-ID": "{{ $json.session_id }}"
}
```

---

## ⚠️ APIS FALTANTES/MEJORAS EN DJANGO

### 1. ❌ FALTA: Endpoint para verificar salud del servicio con métricas
**Crear:** `GET /api/v1/health/detailed/`

**Retorna:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-28T15:30:00Z",
  "services": {
    "database": {
      "status": "up",
      "latency_ms": 5
    },
    "redis": {
      "status": "up",
      "latency_ms": 2
    }
  },
  "metrics": {
    "total_conversaciones_activas": 45,
    "total_citas_hoy": 123,
    "uptime_seconds": 86400
  }
}
```

**Ubicación:** `backend/accounts/views.py`

### 2. ⚠️ MEJORA: Endpoint de citas disponibles - Paginación inconsistente
**Problema:** Frontend pide `page`, pero backend no pagina realmente.

**Mejorar:** `GET /api/v1/citas/disponibles/?categoria={cat}&page={page}&page_size=10`

**Implementación en CitaViewSet:**
```python
@action(detail=False, methods=['get'])
def disponibles(self, request):
    categoria = request.query_params.get('categoria')
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))

    # ... lógica existente ...

    # Aplicar paginación
    start = (page - 1) * page_size
    end = start + page_size

    citas_page = citas_disponibles[start:end]

    return Response({
        "success": True,
        "page": page,
        "page_size": page_size,
        "total_citas": len(citas_disponibles),
        "has_more": end < len(citas_disponibles),
        "citas": citas_page
    })
```

### 3. ❌ FALTA: Lock de slot a nivel de API
**Crear:** `POST /api/v1/slots/{id}/lock/`

**Propósito:** Reservar temporalmente un slot (30 segundos) mientras usuario confirma.

**Request:**
```json
{
  "session_id": "573001234567"
}
```

**Response:**
```json
{
  "success": true,
  "slot_id": 2950,
  "locked_until": "2024-11-28T15:30:30Z",
  "lock_token": "uuid-xxx"
}
```

**Implementación:**
```python
# backend/accounts/models.py
class SlotLock(models.Model):
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=50)
    lock_token = models.UUIDField(default=uuid.uuid4)
    locked_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        indexes = [
            models.Index(fields=['slot', 'expires_at']),
        ]

# backend/accounts/views.py
class SlotViewSet(viewsets.ReadOnlyModelViewSet):
    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        slot = self.get_object()
        session_id = request.data.get('session_id')

        # Verificar si ya está locked
        existing_lock = SlotLock.objects.filter(
            slot=slot,
            expires_at__gt=timezone.now()
        ).first()

        if existing_lock:
            return Response({
                "success": False,
                "error": "Slot ya está siendo reservado"
            }, status=400)

        # Crear lock
        expires_at = timezone.now() + timedelta(seconds=30)
        lock = SlotLock.objects.create(
            slot=slot,
            session_id=session_id,
            expires_at=expires_at
        )

        return Response({
            "success": True,
            "slot_id": slot.id,
            "locked_until": expires_at.isoformat(),
            "lock_token": str(lock.lock_token)
        })
```

### 4. ⚠️ MEJORA: Conversación activa pública - Añadir autenticación mínima
**Problema:** Endpoint público permite enumerar conversaciones.

**Solución:** Agregar validación de PIN o código.

**Modificar:** `GET /api/v1/conversaciones/activa-publica/{session_id}/?pin={pin}`

**Implementación:**
```python
# backend/accounts/models.py
class ConversacionWhatsApp(models.Model):
    # ... campos existentes ...
    pin_verificacion = models.CharField(max_length=6, null=True, blank=True)
    # Se genera al crear conversación, se envía por WhatsApp

# backend/accounts/views.py
class ConversacionWhatsAppViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['get'], url_path='activa-publica/(?P<session_id>[^/.]+)')
    def activa_publica(self, request, session_id=None):
        pin = request.query_params.get('pin')

        conversacion = ConversacionWhatsApp.objects.filter(
            session_id=session_id,
            estado='ACTIVO'
        ).first()

        if not conversacion:
            return Response({"error": "No existe"}, status=404)

        # Verificar PIN si está configurado
        if conversacion.pin_verificacion and pin != conversacion.pin_verificacion:
            return Response({"error": "PIN inválido"}, status=403)

        # ... resto del código ...
```

### 5. ❌ FALTA: Endpoint para obtener próximas citas
**Crear:** `GET /api/v1/citas/proximas/?dias=7`

**Propósito:** Obtener resumen de citas próximas (para notificaciones).

**Response:**
```json
{
  "success": true,
  "citas_proximas": [
    {
      "id": 789,
      "paciente": "Juan Pérez",
      "fecha": "2024-11-30",
      "hora": "08:00",
      "medico": "Dr. García",
      "dias_faltantes": 2,
      "necesita_confirmacion": true
    }
  ]
}
```

### 6. ⚠️ MEJORA: Agregar rate limiting a nivel de API
**Instalar:** django-ratelimit

**Aplicar a endpoints públicos:**
```python
from django_ratelimit.decorators import ratelimit

class PacienteViewSet(viewsets.ModelViewSet):
    @ratelimit(key='ip', rate='10/m', method='POST')
    @action(detail=False, methods=['post'])
    def validar(self, request):
        # ... código existente ...
```

### 7. ❌ FALTA: Webhook para notificar cambios a n8n
**Crear:** Sistema de webhooks para eventos importantes.

**Eventos:**
- `cita.creada`
- `cita.cancelada`
- `cita.confirmada`
- `slot.liberado`

**Configuración:**
```python
# backend/accounts/models.py
class WebhookConfig(models.Model):
    entidad_medica = models.ForeignKey(EntidadMedica, on_delete=models.CASCADE)
    evento = models.CharField(max_length=50)  # cita.creada, etc.
    url = models.URLField()
    activo = models.BooleanField(default=True)

# backend/accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
import requests

@receiver(post_save, sender=Cita)
def notify_cita_creada(sender, instance, created, **kwargs):
    if created:
        webhooks = WebhookConfig.objects.filter(
            entidad_medica=instance.slot.agenda.medico.entidad,
            evento='cita.creada',
            activo=True
        )

        for webhook in webhooks:
            try:
                requests.post(webhook.url, json={
                    "evento": "cita.creada",
                    "cita_id": instance.id,
                    "paciente_id": instance.paciente.id,
                    "fecha": instance.slot.hora_inicio.isoformat()
                }, timeout=5)
            except:
                pass  # Log error
```

### 8. ⚠️ MEJORA: Agregar campo `observaciones_paciente` en Cita
**Problema:** No se guardan síntomas reportados en la cita.

**Modificar modelo:**
```python
# backend/accounts/models.py
class Cita(models.Model):
    # ... campos existentes ...
    observaciones_paciente = models.TextField(blank=True, null=True, help_text="Síntomas reportados por el paciente")
```

**Migración:**
```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### 9. ❌ FALTA: Endpoint de estadísticas en tiempo real
**Crear:** `GET /api/v1/estadisticas/tiempo-real/`

**Propósito:** Dashboard para clínicas.

**Response:**
```json
{
  "conversaciones_activas_ahora": 12,
  "citas_agendadas_hoy": 45,
  "citas_pendientes_confirmacion": 8,
  "slots_disponibles_hoy": 23,
  "tiempo_promedio_respuesta_segundos": 3.5
}
```

### 10. ⚠️ MEJORA: Agregar índices de BD para mejorar performance
**En models.py, agregar:**
```python
class Cita(models.Model):
    # ... campos existentes ...

    class Meta:
        indexes = [
            models.Index(fields=['paciente', 'estado']),
            models.Index(fields=['slot', 'estado']),
            models.Index(fields=['created_at']),
        ]

class ConversacionWhatsApp(models.Model):
    # ... campos existentes ...

    class Meta:
        indexes = [
            models.Index(fields=['session_id', 'estado']),
            models.Index(fields=['paciente', 'estado']),
            models.Index(fields=['updated_at']),
        ]
```

---

## 🚀 DEPLOYMENT A PRODUCCIÓN

### Arquitectura de Producción

```
┌─────────────────┐
│  Load Balancer  │ (nginx)
└────────┬────────┘
         │
    ┌────▼─────┐
    │   n8n    │ (2+ instancias)
    │ Workers  │
    └────┬─────┘
         │
    ┌────▼─────────┐
    │   Django     │ (4+ instancias)
    │   API        │
    └────┬─────────┘
         │
    ┌────▼─────┐    ┌──────────┐
    │PostgreSQL│    │  Redis   │
    │  Primary │    │ Cluster  │
    └──────────┘    └──────────┘
```

### Variables de Entorno (Producción)

**`.env.production`:**
```bash
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.sophia.clinic,10.0.0.0/8
DATABASE_URL=postgresql://user:pass@db-primary:5432/sophia
REDIS_URL=redis://redis-cluster:6379/0

# n8n
N8N_HOST=n8n.sophia.clinic
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_ENCRYPTION_KEY=your-encryption-key
N8N_USER_MANAGEMENT_JWT_SECRET=your-jwt-secret
N8N_PUSH_BACKEND=redis
QUEUE_BULL_REDIS_HOST=redis-cluster
QUEUE_BULL_REDIS_PORT=6379

# WhatsApp
WHATSAPP_BUSINESS_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your-token-here
WHATSAPP_PHONE_NUMBER_ID=your-phone-id

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Ngrok (solo desarrollo)
# NGROK_ENABLED=false

# Producción URLs
DJANGO_API_BASE_URL=https://api.sophia.clinic
N8N_WEBHOOK_BASE_URL=https://n8n.sophia.clinic
```

### Docker Compose Producción

**`docker-compose.prod.yml`:**
```yaml
version: '3.8'

services:
  # PostgreSQL Primary
  postgres-primary:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sophia
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always
    networks:
      - sophia-net

  # Redis Cluster
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: always
    networks:
      - sophia-net

  # Django API (4 workers)
  django-api:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
      - DJANGO_DEBUG=False
    volumes:
      - static-files:/app/staticfiles
      - media-files:/app/media
    depends_on:
      - postgres-primary
      - redis
    deploy:
      replicas: 4
      resources:
        limits:
          cpus: '1'
          memory: 1G
    restart: always
    networks:
      - sophia-net

  # n8n Workers (2 instancias)
  n8n-worker:
    image: n8nio/n8n:latest
    environment:
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=${N8N_WEBHOOK_BASE_URL}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres-primary
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=${DB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_PASSWORD=${REDIS_PASSWORD}
      - N8N_PUSH_BACKEND=redis
      - EXECUTIONS_MODE=queue
    volumes:
      - n8n-data:/home/node/.n8n
      - ./config/n8n_django:/home/node/.n8n/workflows
    depends_on:
      - postgres-primary
      - redis
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G
    restart: always
    networks:
      - sophia-net

  # Nginx Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static-files:/var/www/static:ro
    depends_on:
      - django-api
      - n8n-worker
    restart: always
    networks:
      - sophia-net

  # WhatsApp Typing Subscriber
  whatsapp-typing:
    build:
      context: ./subscribers
      dockerfile: Dockerfile
    command: python whatsapp_typing_subscriber.py
    environment:
      - REDIS_URL=${REDIS_URL}
      - WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN}
    depends_on:
      - redis
    restart: always
    networks:
      - sophia-net

volumes:
  postgres-data:
  redis-data:
  n8n-data:
  static-files:
  media-files:

networks:
  sophia-net:
    driver: bridge
```

### Nginx Config

**`nginx/nginx.conf`:**
```nginx
upstream django_api {
    least_conn;
    server django-api:8000 max_fails=3 fail_timeout=30s;
}

upstream n8n_backend {
    least_conn;
    server n8n-worker:5678 max_fails=3 fail_timeout=30s;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=100r/s;

server {
    listen 80;
    server_name api.sophia.clinic;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.sophia.clinic;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 20M;

    # Django API
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://django_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Static files
    location /static/ {
        alias /var/www/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "OK\n";
    }
}

server {
    listen 443 ssl http2;
    server_name n8n.sophia.clinic;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # n8n
    location / {
        limit_req zone=webhook_limit burst=50 nodelay;

        proxy_pass http://n8n_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

### Checklist de Deployment

#### Pre-deployment
- [ ] Configurar dominio DNS (api.sophia.clinic, n8n.sophia.clinic)
- [ ] Obtener certificados SSL (Let's Encrypt)
- [ ] Configurar variables de entorno producción
- [ ] Crear usuario DB con permisos mínimos
- [ ] Configurar WhatsApp Business API
- [ ] Configurar OpenAI API key con límites

#### Deployment
- [ ] Subir código a servidor (Git)
- [ ] Build de imágenes Docker
- [ ] Migrar BD: `docker-compose exec django-api python manage.py migrate`
- [ ] Crear superusuario: `docker-compose exec django-api python manage.py create_superadmin`
- [ ] Importar flujos n8n desde carpeta `config/n8n_django/`
- [ ] Configurar credenciales en n8n (OpenAI, WhatsApp, Django API)
- [ ] Probar endpoint health: `curl https://api.sophia.clinic/api/v1/health/`

#### Post-deployment
- [ ] Configurar backups automáticos PostgreSQL (diario)
- [ ] Configurar backups Redis (cada 6 horas)
- [ ] Configurar monitoreo (Prometheus + Grafana)
- [ ] Configurar alertas (email/Slack)
- [ ] Documentar runbooks para equipo ops
- [ ] Realizar pruebas de carga (locust/k6)
- [ ] Establecer SLA y políticas de escalado

---

## 📊 MONITOREO Y OBSERVABILIDAD

### Métricas Clave (Prometheus)

**n8n:**
- `n8n_workflow_executions_total` - Total ejecuciones
- `n8n_workflow_execution_duration_seconds` - Duración
- `n8n_workflow_errors_total` - Errores

**Django:**
- `django_http_requests_total` - Requests totales
- `django_http_request_duration_seconds` - Latencia
- `django_db_connections_active` - Conexiones DB

**Redis:**
- `redis_connected_clients` - Clientes conectados
- `redis_memory_used_bytes` - Memoria usada
- `redis_keyspace_hits_total` - Cache hits

**Custom (aplicación):**
- `sophia_conversaciones_activas` - Conversaciones en curso
- `sophia_citas_agendadas_total` - Citas totales
- `sophia_locks_active` - Locks activos
- `sophia_typing_active` - Usuarios escribiendo

### Logs Estructurados

**Formato JSON:**
```json
{
  "timestamp": "2024-11-28T15:30:00.123Z",
  "level": "INFO",
  "service": "n8n",
  "workflow": "01-principal",
  "execution_id": "abc-123",
  "session_id": "573001234567",
  "paciente_id": 123,
  "action": "validar_documento",
  "duration_ms": 234,
  "success": true,
  "message": "Documento validado exitosamente"
}
```

**Centralización:** Elasticsearch + Kibana o Loki + Grafana

### Alertas Críticas

1. **Alta tasa de errores:** > 5% en 5 minutos
2. **Latencia alta:** p95 > 5 segundos en 5 minutos
3. **Locks huérfanos:** > 10 locks con TTL expirado
4. **Conversaciones stale:** > 50 conversaciones sin actividad en 30 min
5. **BD conexiones:** > 80% del pool utilizado
6. **Redis memoria:** > 90% utilizada

### Dashboard Grafana

**Paneles:**
- Conversaciones activas (gauge)
- Citas agendadas hoy (counter)
- Tasa de errores por flujo (graph)
- Latencia p50/p95/p99 (graph)
- Locks activos (gauge)
- Rate limiting hits (counter)

---

## 🎯 RESUMEN EJECUTIVO

### Lo Implementado
✅ State Machine con Redis para manejo de estados
✅ Sistema de locks para prevenir colisiones
✅ Typing indicator con Redis Pub/Sub
✅ Paginación de citas
✅ Manejo robusto de errores
✅ Rate limiting

### Lo Optimizado
✅ Eliminación de flujo 03 (duplicado)
✅ Estandarización de headers HTTP
✅ Centralización de validaciones
✅ Auditoría estructurada
✅ Caché inteligente

### Lo Pendiente en Django
⚠️ Transaction locks en agendamiento
⚠️ Endpoint de lock temporal de slots
⚠️ Webhooks para eventos
⚠️ Índices de BD
⚠️ Rate limiting en APIs públicas

### Próximos Pasos
1. Implementar flujos optimizados (archivos JSON)
2. Crear subscriber de typing en Python
3. Aplicar mejoras a Django backend
4. Configurar Redis en desarrollo
5. Probar localmente con ngrok
6. Desplegar a staging
7. Pruebas de carga
8. Desplegar a producción

---

**Fecha:** 2024-11-28
**Versión:** 1.0
**Estado:** Arquitectura definida, listo para implementación
