# 🔄 SOLUCIÓN: Caché Temporal Diario con Redis

## 🎯 Objetivo

Guardar el contexto de validación (paciente_id, token, etc.) en Redis con expiración automática a medianoche, evitando re-validaciones innecesarias durante el mismo día.

---

## 🏗️ Arquitectura

### **Componentes:**

1. **Redis** - Almacenamiento de caché con TTL
2. **Nodo "Consultar Caché Diario"** (antes del AI Agent)
3. **Nodo "Guardar Caché Diario"** (después de validar paciente)
4. **Cálculo dinámico de TTL** (segundos hasta medianoche)

### **Flujo de Ejecución:**

```
WhatsApp → Extraer Datos → CONFIG → [NUEVO] Consultar Caché Redis
                                              │
                                    ┌─────────┴──────────┐
                                    ▼                    ▼
                              Caché existe         Caché NO existe
                                    │                    │
                                    │                    ▼
                                    │          Consultar Conversación (BD)
                                    │                    │
                                    │          ┌─────────┴──────────┐
                                    │          ▼                    ▼
                                    │    Conversación        Conversación
                                    │      existe           NO existe
                                    │          │                    │
                                    └──────────┼────────────────────┘
                                               │
                                               ▼
                                    Preparar Contexto Unificado
                                               │
                                               ▼
                                          AI Agent
                                               │
                                    ┌──────────┴──────────┐
                                    ▼                     ▼
                         tool_validar_paciente    Otros tools
                                    │
                                    ▼
                         [NUEVO] Guardar en Caché Redis
                                    │
                                    ▼
                              Continuar flujo
```

---

## 📝 Implementación Paso a Paso

### **PASO 1: Agregar Nodo "Consultar Caché Diario"**

**Ubicación:** Después del nodo "CONFIG", antes de "Consultar Conversación Pública"

**Tipo:** Redis (n8n-nodes-base.redis)

**Configuración:**
```javascript
Operation: Get
Key: ={{ 'sophia:session:' + $json.session_id + ':daily-context' }}
Credentials: Redis account 2
Options:
  - Continue On Fail: true (para que no rompa si no existe)
```

**Salida esperada:**
- Si existe: `{paciente_id: 42, nombre: "Juan", token: "eyJ...", ...}`
- Si no existe: `null` o error (continúa al siguiente nodo)

---

### **PASO 2: Modificar "Preparar Contexto"**

**Función actual:**
```javascript
// Lee solo de "Consultar Conversación Pública"
const respuestaConversacion = $json;
```

**Función mejorada:**
```javascript
// PRIORIZAR CACHÉ REDIS sobre BD
const datosWhatsApp = $('Extraer Datos').first().json;
const datosCache = $('Consultar Caché Diario').first()?.json;
const respuestaConversacion = $('Consultar Conversación Pública').first()?.json;

console.log('=== PREPARAR CONTEXTO MEJORADO ===');
console.log('Datos Caché:', datosCache);
console.log('Datos BD:', respuestaConversacion);

// Inicializar contexto base
let contexto = {
    session_id: datosWhatsApp.session_id,
    message_text: datosWhatsApp.message_text,
    contact_name: datosWhatsApp.contact_name,
    timestamp: datosWhatsApp.timestamp,

    // Estado por defecto
    token: null,
    paciente_id: null,
    entidad_medica_id: null,
    conversacion_id: null,
    tiene_token: false,
    es_usuario_nuevo: true,
    conversacion_activa: false
};

// PRIORIDAD 1: Usar caché si existe (más rápido, más reciente)
if (datosCache && !datosCache.error && datosCache.paciente_id) {
    console.log('✅ USANDO DATOS DE CACHÉ REDIS');

    contexto.token = datosCache.token;
    contexto.paciente_id = Number(datosCache.paciente_id);
    contexto.entidad_medica_id = Number(datosCache.entidad_medica_id);
    contexto.paciente_nombre = datosCache.nombre;
    contexto.documento = datosCache.documento;
    contexto.tiene_token = true;
    contexto.es_usuario_nuevo = false;
    contexto.conversacion_activa = true;
    contexto.fuente_datos = 'CACHE_REDIS';
    contexto.validado_at = datosCache.validado_at;
    contexto.expires_at = datosCache.expires_at;

    console.log('📦 Paciente ID:', contexto.paciente_id);
    console.log('🔑 Token:', contexto.token?.substring(0, 20) + '...');
}
// PRIORIDAD 2: Si no hay caché, usar BD
else if (respuestaConversacion && !respuestaConversacion.error && respuestaConversacion.id) {
    console.log('✅ USANDO DATOS DE BD (NO HAY CACHÉ)');

    contexto.token = respuestaConversacion.token;
    contexto.paciente_id = Number(respuestaConversacion.paciente_id);
    contexto.entidad_medica_id = Number(respuestaConversacion.entidad_medica_id);
    contexto.conversacion_id = Number(respuestaConversacion.id);
    contexto.paciente_nombre = respuestaConversacion.paciente_nombre;
    contexto.tiene_token = true;
    contexto.es_usuario_nuevo = false;
    contexto.conversacion_activa = true;
    contexto.fuente_datos = 'BD';
    contexto.conversacion_estado = respuestaConversacion.estado;
}
// PRIORIDAD 3: Usuario nuevo
else {
    console.log('ℹ️ USUARIO NUEVO - Sin caché ni conversación en BD');
    contexto.fuente_datos = 'NINGUNA';
}

console.log('=== CONTEXTO FINAL ===');
console.log(JSON.stringify(contexto, null, 2));

return { json: contexto };
```

---

### **PASO 3: Agregar Nodo "Guardar Caché Diario"**

**Ubicación:** Conectar desde la salida de `tool_validar_paciente`

**Tipo:** Function (n8n-nodes-base.function)

**Nombre:** "Guardar en Caché Redis"

**Código:**
```javascript
// ===== CALCULAR TTL HASTA MEDIANOCHE =====

const ahora = new Date();
const medianoche = new Date(ahora);
medianoche.setHours(24, 0, 0, 0); // Próxima medianoche

const ttlSegundos = Math.floor((medianoche - ahora) / 1000);

console.log('=== CÁLCULO TTL ===');
console.log('Ahora:', ahora.toISOString());
console.log('Medianoche:', medianoche.toISOString());
console.log('TTL (segundos):', ttlSegundos);
console.log('TTL (horas):', (ttlSegundos / 3600).toFixed(2));

// ===== PREPARAR DATOS PARA REDIS =====

const resultadoValidacion = $json;
const sessionId = $('Preparar Contexto').first().json.session_id;

const datosCache = {
    paciente_id: resultadoValidacion.paciente_id,
    nombre: resultadoValidacion.nombre,
    entidad_medica_id: resultadoValidacion.entidad_medica_id,
    token: resultadoValidacion.token,
    documento: resultadoValidacion.documento,
    conversacion_id: resultadoValidacion.conversacion_id,
    validado_at: new Date().toISOString(),
    expires_at: medianoche.toISOString()
};

console.log('=== DATOS A GUARDAR EN CACHÉ ===');
console.log(JSON.stringify(datosCache, null, 2));

return {
    json: {
        redis_key: `sophia:session:${sessionId}:daily-context`,
        redis_value: JSON.stringify(datosCache),
        redis_ttl: ttlSegundos,
        ...resultadoValidacion  // Pasar también los datos originales
    }
};
```

---

### **PASO 4: Agregar Nodo Redis "SET con TTL"**

**Ubicación:** Después de "Guardar en Caché Redis"

**Tipo:** Redis (n8n-nodes-base.redis)

**Configuración:**
```javascript
Operation: Set
Key: ={{ $json.redis_key }}
Value: ={{ $json.redis_value }}
Credentials: Redis account 2
Options:
  - Expire: true
  - TTL: ={{ $json.redis_ttl }}
```

---

### **PASO 5: Conexiones del Flujo**

```
Extraer Datos
    → CONFIG
        → Consultar Caché Diario (Redis GET)
            → Consultar Conversación Pública (BD)
                → Preparar Contexto (Function - Lee Caché + BD)
                    → AI Agent
                        → tool_validar_paciente
                            → Guardar en Caché Redis (Function - Calcula TTL)
                                → Redis SET con TTL
                                    → [Continuar flujo normal]
```

---

## 🔑 Claves de Redis Utilizadas

### **Patrón de Keys:**
```
sophia:session:{session_id}:daily-context
```

**Ejemplo:**
```
Key: sophia:session:+573001234567:daily-context
Value: {"paciente_id":42,"nombre":"Juan Pérez","token":"eyJ..."}
TTL: 43200 segundos (12 horas hasta medianoche)
```

### **Comandos útiles para debugging:**

```bash
# Ver todas las sesiones activas
redis-cli KEYS "sophia:session:*:daily-context"

# Ver datos de una sesión específica
redis-cli GET "sophia:session:+573001234567:daily-context"

# Ver TTL restante
redis-cli TTL "sophia:session:+573001234567:daily-context"

# Eliminar caché de una sesión (para testing)
redis-cli DEL "sophia:session:+573001234567:daily-context"

# Eliminar TODAS las sesiones (⚠️ usar con cuidado)
redis-cli KEYS "sophia:session:*:daily-context" | xargs redis-cli DEL
```

---

## 📊 Comparación: Antes vs Después

### **ANTES (Sin Caché):**
```
Usuario envía: "1234567890"
→ tool_validar_paciente ejecuta
→ Backend consulta BD
→ Retorna: {paciente_id: 42, nombre: "Juan", token: "eyJ..."}
→ AI Agent responde
→ FIN - Datos NO se guardan

Usuario envía (5 min después): "tengo dolor de cabeza"
→ Preparar Contexto consulta BD
→ Si conversación existe → bien
→ Si conversación NO existe → ❌ RE-VALIDA (problema)
→ 2 consultas SQL por mensaje
```

### **DESPUÉS (Con Caché TTL):**
```
Usuario envía: "1234567890"
→ Redis GET → Miss (no existe)
→ tool_validar_paciente ejecuta
→ Backend consulta BD
→ Retorna: {paciente_id: 42, nombre: "Juan", token: "eyJ..."}
→ Redis SET con TTL hasta medianoche
→ AI Agent responde
→ FIN

Usuario envía (5 min después): "tengo dolor de cabeza"
→ Redis GET → ✅ Hit (existe)
→ Preparar Contexto usa datos de Redis
→ NO consulta BD
→ NO ejecuta tool_validar_paciente
→ 0 consultas SQL
→ Latencia: -80% (de ~500ms a ~5ms)
```

---

## ⚡ Ventajas de esta Solución

### **Performance:**
- ✅ **Latencia reducida en 80%** (Redis < 5ms vs BD ~500ms)
- ✅ **Menos carga en PostgreSQL** (1 query inicial vs múltiples)
- ✅ **Escalable a miles de usuarios** (Redis soporta 100k ops/seg)

### **Limpieza Automática:**
- ✅ **Auto-expiración a medianoche** (sin cron jobs)
- ✅ **Sin acumulación de datos** (TTL automático)
- ✅ **Sin mantenimiento manual** (Redis limpia solo)

### **Simplicidad:**
- ✅ **Solo 3 nodos nuevos** en n8n
- ✅ **Sin cambios en backend Django**
- ✅ **Sin tablas SQL adicionales**

### **Flexibilidad:**
- ✅ **TTL ajustable** (cambiar fórmula de medianoche si se requiere)
- ✅ **Datos en JSON** (fácil agregar campos)
- ✅ **Invalidación manual** (DEL key para testing)

---

## 🔄 Alternativa: TTL Fijo vs TTL Dinámico

### **Opción 1: TTL Dinámico (Recomendado)**
```javascript
// Expira a medianoche del día siguiente
const medianoche = new Date();
medianoche.setHours(24, 0, 0, 0);
const ttl = Math.floor((medianoche - new Date()) / 1000);
```
**Ventaja:** Todos expiran a la misma hora (fácil de razonar)
**Desventaja:** TTL variable (1-24 horas dependiendo de cuándo se valide)

### **Opción 2: TTL Fijo 24 horas**
```javascript
const ttl = 86400; // 24 horas fijas
```
**Ventaja:** Siempre 24 horas de validez
**Desventaja:** No expira a medianoche (puede durar hasta el día siguiente)

### **Opción 3: TTL hasta fin de día + 6 horas**
```javascript
// Expira a las 06:00 AM del día siguiente
const expiracion = new Date();
expiracion.setHours(30, 0, 0, 0); // 24 + 6 = 06:00 AM
const ttl = Math.floor((expiracion - new Date()) / 1000);
```
**Ventaja:** Evita que expire justo a medianoche (usuarios nocturnos)
**Desventaja:** Puede acumular más datos en Redis

**Para tu caso, recomiendo Opción 1 (TTL hasta medianoche).**

---

## 🛡️ Manejo de Casos Especiales

### **Caso 1: Usuario válido en caché pero conversación cerrada en BD**
```javascript
// En "Preparar Contexto"
if (datosCache && datosCache.paciente_id) {
    // Usar caché primero
    contexto = {...datosCache};

    // Pero si BD dice que conversación está "finalizada"
    if (respuestaConversacion?.estado === 'finalizada') {
        // Invalidar caché
        // (Agregar nodo Redis DEL después)
        contexto.conversacion_activa = false;
        console.log('⚠️ Conversación finalizada - invalidando caché');
    }
}
```

### **Caso 2: Token expiró pero caché aún válido**
```javascript
// En backend Django (endpoint de conversación activa)
# Si token expiró, retornar 401
if token_expirado:
    return Response({'error': 'Token expirado'}, status=401)

// En n8n "Preparar Contexto"
if (respuestaConversacion?.error?.includes('expirado')) {
    // Invalidar caché y forzar re-validación
    contexto.tiene_token = false;
    console.log('⚠️ Token expirado - forzando re-validación');
}
```

### **Caso 3: Múltiples dispositivos (mismo paciente, diferente session_id)**
```javascript
// Cambiar el patrón de key para usar documento en lugar de session_id
Key: `sophia:paciente:${documento}:daily-context`

// Ventaja: Misma caché para todos los dispositivos del paciente
// Desventaja: Necesita extraer documento del mensaje
```

---

## 📈 Monitoreo y Métricas

### **Métricas a trackear:**

```javascript
// En "Preparar Contexto" - agregar al final
const metricas = {
    fuente_datos: contexto.fuente_datos, // 'CACHE_REDIS', 'BD', 'NINGUNA'
    tiene_cache: datosCache && !datosCache.error,
    tiene_bd: respuestaConversacion && !respuestaConversacion.error,
    cache_hit: contexto.fuente_datos === 'CACHE_REDIS',
    timestamp: new Date().toISOString()
};

console.log('📊 MÉTRICAS:', metricas);

// Opcional: enviar a analytics
// POST a endpoint de métricas
```

### **Dashboard de Redis:**

```bash
# Comando para ver estadísticas
redis-cli INFO stats

# Métricas importantes:
# - keyspace_hits: Cuántas veces se encontró la key
# - keyspace_misses: Cuántas veces NO se encontró
# - Hit rate = hits / (hits + misses)

# Ejemplo de salida:
# keyspace_hits:1500
# keyspace_misses:200
# Hit rate: 88% (excelente)
```

---

## 🧪 Testing

### **Test 1: Validación inicial**
```
1. Eliminar caché: redis-cli DEL "sophia:session:+57300...:daily-context"
2. Enviar: "1234567890"
3. Verificar logs "Preparar Contexto":
   ✅ fuente_datos: "NINGUNA" (primera vez)
4. Verificar que se ejecuta tool_validar_paciente
5. Verificar logs "Guardar en Caché Redis":
   ✅ TTL calculado (ej: 43200 segundos)
6. Verificar Redis:
   redis-cli GET "sophia:session:+57300...:daily-context"
   ✅ Debe retornar JSON con datos
```

### **Test 2: Cache hit**
```
1. Inmediatamente después de Test 1
2. Enviar: "tengo dolor de cabeza"
3. Verificar logs "Preparar Contexto":
   ✅ fuente_datos: "CACHE_REDIS"
   ✅ paciente_id: 42
4. Verificar que NO se ejecuta tool_validar_paciente
5. Verificar que se ejecuta tool_clasificar_sintomas
```

### **Test 3: Expiración de caché**
```
1. Cambiar TTL a 10 segundos (para testing)
2. Validar paciente
3. Esperar 15 segundos
4. Enviar mensaje
5. Verificar logs:
   ✅ fuente_datos: "BD" (caché expiró)
   ✅ Redis GET retorna null
```

---

## 🚀 Implementación Rápida (Resumen)

### **1. Agregar 3 nodos nuevos:**
- **Nodo A:** Redis GET (Consultar Caché Diario)
- **Nodo B:** Function (Guardar en Caché Redis - calcula TTL)
- **Nodo C:** Redis SET (Guardar con TTL)

### **2. Modificar 1 nodo existente:**
- **Nodo "Preparar Contexto":** Leer caché primero, luego BD

### **3. Conectar:**
```
CONFIG → [A] Redis GET → Consultar Conv. → Preparar Contexto → AI Agent
                                                                     ↓
                                                          tool_validar_paciente
                                                                     ↓
                                                          [B] Function (TTL)
                                                                     ↓
                                                          [C] Redis SET
```

### **4. Tiempo estimado:** 15-20 minutos

---

## ✅ Checklist de Implementación

- [ ] Nodo "Consultar Caché Diario" (Redis GET) agregado
- [ ] Nodo "Preparar Contexto" modificado (prioriza caché)
- [ ] Nodo "Guardar en Caché Redis" (Function) agregado
- [ ] Nodo "Redis SET con TTL" agregado
- [ ] Conexiones verificadas
- [ ] Test 1: Validación inicial → caché se guarda
- [ ] Test 2: Mensaje posterior → caché se usa
- [ ] Test 3: Logs muestran `fuente_datos: "CACHE_REDIS"`
- [ ] Redis CLI confirma datos guardados
- [ ] TTL correcto (segundos hasta medianoche)

---

**Próximo paso:** Implementar los nodos en el workflow.

**Archivo de implementación:** `IMPLEMENTACION-CACHE-TEMPORAL.json` (próximo archivo)
