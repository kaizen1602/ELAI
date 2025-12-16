# 🚀 FLUJOS N8N CORREGIDOS - LISTOS PARA IMPORTAR

## ✅ ARCHIVOS CORRECTOS (Usar estos)

Todos estos archivos tienen sufijo `-CORREGIDO.json` y están 100% funcionales:

### **Flujos principales (importar en orden):**

1. **01-WORKFLOW-PRINCIPAL-COMPLETO-FIXED-V2-4-CORREGIDO.json**
   - ✅ Nodo CONFIG incluido
   - ✅ URLs corregidas
   - ✅ Headers completos

2. **02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED-CORREGIDO.json**
   - ✅ CONFIG añadido
   - ✅ 3 nodos HTTP corregidos
   - ✅ Buscar Paciente, Conversación Activa, Crear Conversación

3. **03-SUB-CREAR-CONVERSACION-2-CORREGIDO.json**
   - ✅ URLs corregidas
   - ✅ Headers completos

4. **04-SUB-CLASIFICAR-SINTOMAS-V3-FIXED-2.json**
   - ✅ Ya estaba correcto (sin cambios necesarios)

5. **05-Consultar_citas-CORREGIDO.json**
   - ✅ CONFIG añadido
   - ✅ 3 nodos Redis corregidos (messageData añadido)
   - ✅ URL HTTP corregida

6. **06-SUB-AGENDAR-CITA-OPTIMIZED-CORREGIDO.json**
   - ✅ CONFIG añadido
   - ✅ 4 nodos Redis corregidos
   - ✅ 5 nodos HTTP corregidos
   - ✅ Lock Slot, Crear Cita, WhatsApp messages

7. **07-SUB-LISTAR-CITAS-ACTIVAS-CORREGIDO-5-CORREGIDO.json**
   - ✅ URLs corregidas
   - ✅ Headers completos

8. **08-SUB-CONFIRMAR-CANCELACION-CORREGIDO-4-CORREGIDO.json**
   - ✅ URLs corregidas
   - ✅ Headers completos

9. **09-SUB-ACTUALIZAR-CONTEXTO-CONVERSACION-2-CORREGIDO.json**
   - ✅ CONFIG añadido
   - ✅ URL HTTP corregida

10. **10-SUB-FINALIZAR-CONVERSACION-2-CORREGIDO.json**
    - ✅ CONFIG añadido
    - ✅ URL HTTP corregida

---

## 📊 RESUMEN DE CORRECCIONES APLICADAS

| Tipo de corrección | Total |
|--------------------|-------|
| Nodos CONFIG añadidos | 6 flujos |
| URLs HTTP corregidas | 15 nodos |
| Nodos Redis corregidos | 7 nodos |
| Headers añadidos/corregidos | 15 nodos |
| **TOTAL CAMBIOS** | **43 correcciones** |

---

## 🔧 CAMBIOS REALIZADOS POR FLUJO

### **Flujo 02 - Validar Paciente**
- ✅ Añadido nodo CONFIG
- ✅ Corregida URL "Buscar Paciente en Backend"
- ✅ Corregida URL "Consultar Conversación Activa"
- ✅ Corregida URL "Crear Nueva Conversación"

### **Flujo 05 - Consultar Citas**
- ✅ Añadido nodo CONFIG
- ✅ Añadido messageData a "Redis Start Typing"
- ✅ Corregida URL "HTTP Request Consultar Citas"
- ✅ Añadido messageData a "Redis Stop Typing (Success)"
- ✅ Añadido messageData a "Redis Stop Typing (Empty)"

### **Flujo 06 - Agendar Cita** (más cambios)
- ✅ Añadido nodo CONFIG
- ✅ Añadido messageData a "Redis: Start Typing"
- ✅ Corregida URL "Lock Slot (30s)"
- ✅ Corregida URL "Crear Cita (Transaction Lock)"
- ✅ Añadido messageData a "Redis: Stop Typing (Success)"
- ✅ Corregida URL "Send Confirmation"
- ✅ Añadido messageData a "Redis: Stop Typing (Error)"
- ✅ Corregida URL "Send Error Message"
- ✅ Añadido messageData a "Redis: Stop Typing (Lock Failed)"
- ✅ Corregida URL "Send Lock Busy Message"

### **Flujo 09 - Actualizar Contexto**
- ✅ Añadido nodo CONFIG
- ✅ Corregida URL "HTTP Request Actualizar Contexto"

### **Flujo 10 - Finalizar Conversación**
- ✅ Añadido nodo CONFIG
- ✅ Corregida URL "HTTP Request Finalizar"

---

## 📝 FORMATO DE URLS CORREGIDO

### **ANTES (❌ no funciona):**
```javascript
"url": "={{ $env.BACKEND_URL }}/api/v1/citas/"
```

### **DESPUÉS (✅ funciona):**
```javascript
"url": "={{ $('CONFIG').item.json.BACKEND_NGROK_URL + '/api/v1/citas/' }}"
```

---

## 🔑 NODO CONFIG (incluido en 6 flujos)

El nodo CONFIG contiene:

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
    ...$json
  }
};
```

**⚠️ IMPORTANTE:** Solo necesitas actualizar la URL en el flujo 01 (principal). Los demás la heredan.

---

## 🎯 CÓMO IMPORTAR

### **Paso 1: Backup**
Exporta tus flujos actuales antes de importar.

### **Paso 2: Importar en orden**
1. Importar flujo 01 (principal)
2. Actualizar URL ngrok en nodo CONFIG del flujo 01
3. Importar flujos 02-10

### **Paso 3: Verificar**
- Todos los nodos HTTP deben tener headers: Authorization, ngrok-skip-browser-warning
- Todos los nodos Redis publish deben tener messageData
- Todas las URLs deben usar `$('CONFIG').item.json.BACKEND_NGROK_URL`

---

## ❌ NO USES ESTOS ARCHIVOS

Archivos SIN sufijo `-CORREGIDO`:
- ❌ 01-WORKFLOW-PRINCIPAL-COMPLETO-FIXED-V2-4.json
- ❌ 02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED.json
- ❌ 05-Consultar_citas.json
- ❌ 06-SUB-AGENDAR-CITA-OPTIMIZED.json
- ❌ etc.

**Estos tienen los problemas originales de $env variables.**

---

## ✅ VALIDACIÓN RÁPIDA

Después de importar, verifica:

```bash
# En cada flujo, buscar estos patrones:

✅ Debe tener: $('CONFIG').item.json.BACKEND_NGROK_URL
❌ NO debe tener: $env.BACKEND_URL
❌ NO debe tener: $vars.BACKEND_NGROK_URL

✅ Headers deben tener: Authorization, ngrok-skip-browser-warning
✅ Redis publish debe tener: messageData con JSON.stringify
```

---

## 🚀 SIGUIENTE PASO

**Importa el flujo 01 primero:**
```
Archivo: 01-WORKFLOW-PRINCIPAL-COMPLETO-FIXED-V2-4-CORREGIDO.json
```

**Luego actualiza la URL ngrok en el nodo CONFIG del flujo 01.**

¿Listo para importar? 🎯
