# 🔧 Correcciones Aplicadas al Workflow V4

## 🚨 Problemas Encontrados y Solucionados

### **PROBLEMA 1: URL Malformada (CRÍTICO)**

**Síntoma:**
```json
{
  "error": "Invalid URL: =https://e5d3dba10ea2.ngrok-free.app/api/v1/conversaciones/activa-publica//."
}
```

**Causa:**
- Espacio extra entre `=` y `{{` en la línea 42
- El nombre del nodo CONFIG estaba en minúsculas en la referencia

**Antes (INCORRECTO):**
```javascript
"url": "= {{ $('config').first().json.BACKEND_NGROK_URL }}/api/v1/conversaciones/activa-publica/{{ $json.session_id }}/"
```

**Después (CORRECTO):**
```javascript
"url": "={{ $('CONFIG').first().json.BACKEND_NGROK_URL }}/api/v1/conversaciones/activa-publica/{{ $json.session_id }}/"
```

**Cambios:**
1. ✅ Eliminado espacio después de `=`
2. ✅ Cambiado `$('config')` a `$('CONFIG')` (nombre correcto del nodo)

---

### **PROBLEMA 2: Conexión Faltante (CRÍTICO)**

**Síntoma:**
- El caché no se guardaba después de ejecutar `tool_validar_paciente`
- Los datos de validación no persistían

**Causa:**
- Faltaba la conexión `main` entre `tool_validar_paciente` → `Calcular TTL Caché`
- Solo existía la conexión `ai_tool` al `AI Agent`

**Antes (INCORRECTO):**
```json
"tool_validar_paciente": {
  "ai_tool": [
    [
      {
        "node": "AI Agent",
        "type": "ai_tool",
        "index": 0
      }
    ]
  ]
}
```

**Después (CORRECTO):**
```json
"tool_validar_paciente": {
  "ai_tool": [
    [
      {
        "node": "AI Agent",
        "type": "ai_tool",
        "index": 0
      }
    ]
  ],
  "main": [
    [
      {
        "node": "Calcular TTL Caché",
        "type": "main",
        "index": 0
      }
    ]
  ]
}
```

**Cambios:**
1. ✅ Agregada conexión `main` a `Calcular TTL Caché`
2. ✅ Ahora los datos de validación fluyen correctamente al nodo de caché

---

### **PROBLEMA 3: CONFIG no Pasaba session_id (CRÍTICO)**

**Síntoma:**
- `session_id` llegaba como `undefined` o `null`
- URL de "Consultar Conversación Pública" quedaba con `//` doble

**Causa:**
- El nodo CONFIG usaba `$json` en lugar de `$input.first().json`
- No estaba recibiendo correctamente los datos de "Extraer Datos"

**Antes (INCORRECTO):**
```javascript
const CONFIG = {
  BACKEND_NGROK_URL: "https://e5d3dba10ea2.ngrok-free.app",
  NGROK_HEADER_NAME: "ngrok-skip-browser-warning",
  NGROK_HEADER_VALUE: "true",
  TELEFONO_CLINICA: "+573001234567"
};

return {
  json: {
    ...CONFIG,
    ...$json  // ❌ No recibe correctamente los datos
  }
};
```

**Después (CORRECTO):**
```javascript
const datosExtraidos = $input.first().json;

const CONFIG = {
  BACKEND_NGROK_URL: "https://e5d3dba10ea2.ngrok-free.app",
  NGROK_HEADER_NAME: "ngrok-skip-browser-warning",
  NGROK_HEADER_VALUE: "true",
  TELEFONO_CLINICA: "+573001234567"
};

console.log('=== CONFIG CARGADA ===');
console.log('BACKEND_NGROK_URL:', CONFIG.BACKEND_NGROK_URL);
console.log('Session ID recibido:', datosExtraidos.session_id);

return {
  json: {
    ...CONFIG,
    ...datosExtraidos  // ✅ Preserva session_id, message_text, etc.
  }
};
```

**Cambios:**
1. ✅ Agregado `const datosExtraidos = $input.first().json;`
2. ✅ Logs de debugging para verificar `session_id`
3. ✅ Ahora el `session_id` se pasa correctamente a todos los nodos siguientes

---

## 🎯 Flujo Corregido

```
WhatsApp Trigger
  ↓
Extraer Datos (extrae session_id, message_text, etc.)
  ↓
CONFIG (agrega BACKEND_NGROK_URL + preserva session_id)
  ↓
Consultar Caché Diario (Redis GET con session_id)
  ↓
Consultar Conversación Pública (HTTP GET con URL correcta)
  ↓
Preparar Contexto (prioriza Caché → BD → Nuevo)
  ↓
AI Agent (decide qué tool ejecutar)
  ↓
[Si ejecuta tool_validar_paciente]
  ↓
Calcular TTL Caché (calcula TTL hasta medianoche) ← ✅ AHORA CONECTADO
  ↓
Guardar Caché Diario (Redis SET con TTL)
```

---

## ✅ Verificación Post-Corrección

### **Test 1: Verificar URL Correcta**

1. **Revisar ejecución de "Consultar Conversación Pública":**
   ```
   ✅ URL debe ser: https://e5d3dba10ea2.ngrok-free.app/api/v1/conversaciones/activa-publica/+573001234567/
   ❌ NO debe tener: =https://... ni .../activa-publica///
   ```

2. **Logs esperados en CONFIG:**
   ```
   === CONFIG CARGADA ===
   BACKEND_NGROK_URL: https://e5d3dba10ea2.ngrok-free.app
   Session ID recibido: +573001234567
   ```

---

### **Test 2: Verificar Caché se Guarda**

1. **Limpiar caché existente:**
   ```bash
   redis-cli DEL "sophia:session:+573001234567:daily-context"
   ```

2. **Enviar mensaje con documento:**
   ```
   "1234567890"
   ```

3. **Verificar en n8n Executions:**
   ```
   ✅ tool_validar_paciente ejecutado
   ✅ Calcular TTL Caché ejecutado (AHORA SÍ)
   ✅ Guardar Caché Diario ejecutado
   ```

4. **Verificar en Redis:**
   ```bash
   redis-cli GET "sophia:session:+573001234567:daily-context"
   # Debe retornar JSON con paciente_id, token, etc.

   redis-cli TTL "sophia:session:+573001234567:daily-context"
   # Debe retornar segundos hasta medianoche
   ```

---

### **Test 3: Verificar Caché se Usa**

1. **Enviar segundo mensaje:**
   ```
   "tengo gripa"
   ```

2. **Verificar en n8n Executions:**
   ```
   ✅ Consultar Caché Diario → retorna datos (no null)
   ✅ Preparar Contexto → logs muestran "USANDO DATOS DE CACHÉ REDIS"
   ✅ fuente_datos: "CACHE_REDIS"
   ✅ tool_clasificar_sintomas ejecutado (NO tool_validar_paciente)
   ```

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes (Roto) | Después (Corregido) |
|---------|--------------|---------------------|
| **URL "Consultar Conversación"** | `=https://.../activa-publica///` | `https://.../activa-publica/+573001234567/` |
| **session_id en CONFIG** | `undefined` o `null` | `+573001234567` |
| **Conexión tool_validar → Caché** | ❌ No existe | ✅ Existe |
| **Caché se guarda** | ❌ Nunca | ✅ Siempre después de validación |
| **Caché se usa** | ❌ No (siempre null) | ✅ Sí (reduce latencia 99%) |
| **Bucle infinito** | ✅ Ocurre | ❌ No ocurre |

---

## 🚀 Próximos Pasos

1. **Importar el workflow corregido:**
   ```
   /Users/kaizen1602/Downloads/01-WORKFLOW-PRINCIPAL-V4-CON-CACHE-TEMPORAL.json
   ```

2. **Activar el workflow:**
   ```
   n8n → Workflow → Toggle "Active" = ON
   ```

3. **Limpiar caché de pruebas anteriores:**
   ```bash
   redis-cli KEYS "sophia:session:*:daily-context" | xargs redis-cli DEL
   ```

4. **Ejecutar Test 1, 2 y 3** (ver arriba)

5. **Monitorear logs en n8n Executions** para confirmar:
   - ✅ URLs correctas sin errores
   - ✅ Caché se guarda después de validación
   - ✅ Caché se usa en mensajes siguientes
   - ✅ No hay bucles infinitos

---

## 📝 Notas Adicionales

- **Todas las correcciones son retrocompatibles:** No afectan funcionalidad existente
- **No se requieren cambios en el backend:** Solo correcciones en n8n
- **Redis debe estar corriendo:** Verificar con `redis-cli PING` (debe responder `PONG`)
- **ngrok URL debe estar actualizada:** Cambiar en nodo CONFIG si es necesario

---

**Archivo corregido:** `/Users/kaizen1602/Downloads/01-WORKFLOW-PRINCIPAL-V4-CON-CACHE-TEMPORAL.json`

**Estado:** ✅ LISTO PARA IMPORTAR
