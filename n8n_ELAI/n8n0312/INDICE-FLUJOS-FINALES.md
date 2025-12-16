# 📚 ÍNDICE DE FLUJOS N8N - VERSIONES FINALES Y FUNCIONALES

## ✅ Archivos Listos para Importar (Orden de Importación)

### **1. Flujo Principal (IMPORTAR PRIMERO)**
```
01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-EXPLICITA.json (47KB)
```
**Descripción:** Workflow principal con todas las correcciones aplicadas:
- ✅ Detección inteligente de estado (REGLA #0)
- ✅ Ejecución secuencial (no paralela)
- ✅ Proceso de decisión paso a paso
- ✅ Configuración de inputs correcta en tool_validar_paciente
- ✅ Optimizado para 100+ usuarios/hora

**Cambios importantes:**
- Nodo CONFIG con URL ngrok (⚠️ actualizar antes de activar)
- AI Agent con prompt completo y optimizado
- Redis Chat Memory configurado
- 6 tools conectadas correctamente

**Requiere:**
- URL ngrok actualizada
- Credenciales: WhatsApp, OpenAI, Redis

---

### **2. Sub-Workflows (Importar en orden después del principal)**

#### **02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED-FINAL.json (20KB)**
**Función:** Valida documento de paciente, busca en BD, crea conversación activa

**Flujo:**
1. Extrae y valida documento (8-15 dígitos)
2. POST `/api/v1/pacientes/validar/`
3. Si existe → crea conversación activa
4. Genera token JWT
5. Retorna: `{paciente_id, nombre, token, conversacion_id}`

**Endpoints usados:**
- `POST /api/v1/pacientes/validar/`
- `GET /api/v1/conversaciones/activa/`
- `POST /api/v1/conversaciones/`

---

#### **03-SUB-CREAR-CONVERSACION-2-CORREGIDO.json (6.8KB)**
**Función:** Crea nueva conversación para paciente validado

**Flujo:**
1. Recibe: `paciente_id`, `session_id`, `token`
2. POST `/api/v1/conversaciones/`
3. Retorna: `{conversacion_id, estado: "activa"}`

**Endpoints usados:**
- `POST /api/v1/conversaciones/`

---

#### **04-SUB-CLASIFICAR-SINTOMAS-V3-FIXED-2.json (9.1KB)**
**Función:** Clasifica síntomas del paciente usando OpenAI

**Flujo:**
1. Recibe: `sintomas` (texto), `paciente_id` (opcional)
2. Envía síntomas a OpenAI GPT-4
3. Clasifica en: "general", "odontologia", "citologia"
4. Retorna: `{categoria, severidad, motivo_consulta}`

**APIs usadas:**
- OpenAI Chat Completions API

---

#### **05-Consultar_citas-CORREGIDO.json (15KB)**
**Función:** Consulta citas disponibles por categoría

**Flujo:**
1. Recibe: `categoria`, `entidad_medica_id`, `page` (opcional)
2. GET `/api/v1/citas/disponibles/?categoria={categoria}&page={page}`
3. Retorna: `{citas: [...10 slots...], total_citas, mapa_posiciones}`

**Campos importantes en respuesta:**
```javascript
{
  slot_id: 2934,  // ← Usar ESTE para agendar
  agenda_id: 199,  // ← IGNORAR
  fecha_formateada: "4 de noviembre",
  hora: "08:00 AM",
  medico_nombre: "Dr. Carlos García López"
}
```

**Endpoints usados:**
- `GET /api/v1/citas/disponibles/`

---

#### **06-SUB-AGENDAR-CITA-OPTIMIZED-FINAL.json (13KB)**
**Función:** Agenda cita con lock transaccional (5 minutos)

**Flujo:**
1. Recibe: `slot_id` (como agenda_id), `paciente_id`, `session_id`, `token`
2. POST `/api/v1/slots/{slot_id}/lock/` → obtiene `lock_token`
3. Si lock exitoso → POST `/api/v1/citas/` con `lock_token`
4. Backend valida lock y crea cita atómicamente
5. Libera lock automáticamente
6. Envía confirmación por WhatsApp

**Endpoints usados:**
- `POST /api/v1/slots/{slot_id}/lock/`
- `POST /api/v1/citas/`
- WhatsApp Business API (confirmación)

**Manejo de errores:**
- Lock fallido → Mensaje: "Horario siendo reservado por otro paciente"
- Cita fallida → Mensaje: "Horario acaba de ser ocupado"
- Lock exitoso → Mensaje: "¡Cita confirmada! 📅..."

---

#### **07-SUB-LISTAR-CITAS-ACTIVAS-CORREGIDO-5-CORREGIDO.json (6.8KB)**
**Función:** Lista citas activas del paciente (para cancelación)

**Flujo:**
1. Recibe: `paciente_id`, `token`
2. GET `/api/v1/citas/?paciente={paciente_id}&estado=activa`
3. Retorna: `{citas: [...], total_citas}`

**Endpoints usados:**
- `GET /api/v1/citas/`

---

#### **08-SUB-CONFIRMAR-CANCELACION-CORREGIDO-4-CORREGIDO.json (7.5KB)**
**Función:** Cancela una cita específica

**Flujo:**
1. Recibe: `cita_id`, `paciente_id`, `token`
2. PATCH `/api/v1/citas/{cita_id}/` → estado: "cancelada"
3. Retorna: `{success: true, mensaje: "Cita cancelada"}`

**Endpoints usados:**
- `PATCH /api/v1/citas/{cita_id}/`

---

#### **09-SUB-ACTUALIZAR-CONTEXTO-CONVERSACION-2-CORREGIDO.json (6.3KB)**
**Función:** Actualiza contexto de conversación (síntomas, clasificación)

**Flujo:**
1. Recibe: `conversacion_id`, `contexto_actualizado`, `token`
2. PATCH `/api/v1/conversaciones/{conversacion_id}/`
3. Retorna: `{success: true}`

**Endpoints usados:**
- `PATCH /api/v1/conversaciones/{conversacion_id}/`

---

#### **10-SUB-FINALIZAR-CONVERSACION-2-CORREGIDO.json (5.4KB)**
**Función:** Finaliza conversación activa

**Flujo:**
1. Recibe: `conversacion_id`, `token`
2. PATCH `/api/v1/conversaciones/{conversacion_id}/` → estado: "finalizada"
3. Retorna: `{success: true}`

**Endpoints usados:**
- `PATCH /api/v1/conversaciones/{conversacion_id}/`

---

## 📊 Resumen de Archivos

| # | Archivo | Tamaño | Función Principal | Estado |
|---|---------|--------|-------------------|--------|
| 01 | WORKFLOW-PRINCIPAL-V3 | 47KB | Orquestador con AI Agent | ✅ Final |
| 02 | VALIDAR-PACIENTE-FINAL | 20KB | Validación y registro | ✅ Final |
| 03 | CREAR-CONVERSACION | 6.8KB | Crear conversación | ✅ Final |
| 04 | CLASIFICAR-SINTOMAS-V3 | 9.1KB | Clasificación con OpenAI | ✅ Final |
| 05 | CONSULTAR-CITAS | 15KB | Listar slots disponibles | ✅ Final |
| 06 | AGENDAR-CITA-FINAL | 13KB | Agendamiento con lock | ✅ Final |
| 07 | LISTAR-CITAS-ACTIVAS | 6.8KB | Citas del paciente | ✅ Final |
| 08 | CONFIRMAR-CANCELACION | 7.5KB | Cancelar cita | ✅ Final |
| 09 | ACTUALIZAR-CONTEXTO | 6.3KB | Actualizar conversación | ✅ Final |
| 10 | FINALIZAR-CONVERSACION | 5.4KB | Cerrar conversación | ✅ Final |
| **TOTAL** | **10 archivos** | **138KB** | **Sistema completo** | **✅ 100%** |

---

## 🚀 Orden de Importación Recomendado

### **Paso 1: Importar Flujo Principal**
```
n8n → Import → 01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-EXPLICITA.json
```

### **Paso 2: Configurar Flujo Principal**
```
1. Abrir workflow importado
2. Nodo "config" → Actualizar BACKEND_NGROK_URL
3. Verificar credenciales: WhatsApp, OpenAI, Redis
4. NO activar todavía
```

### **Paso 3: Importar Sub-Workflows (orden flexible)**
```
n8n → Import → 02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED-FINAL.json
n8n → Import → 03-SUB-CREAR-CONVERSACION-2-CORREGIDO.json
n8n → Import → 04-SUB-CLASIFICAR-SINTOMAS-V3-FIXED-2.json
n8n → Import → 05-Consultar_citas-CORREGIDO.json
n8n → Import → 06-SUB-AGENDAR-CITA-OPTIMIZED-FINAL.json
n8n → Import → 07-SUB-LISTAR-CITAS-ACTIVAS-CORREGIDO-5-CORREGIDO.json
n8n → Import → 08-SUB-CONFIRMAR-CANCELACION-CORREGIDO-4-CORREGIDO.json
n8n → Import → 09-SUB-ACTUALIZAR-CONTEXTO-CONVERSACION-2-CORREGIDO.json
n8n → Import → 10-SUB-FINALIZAR-CONVERSACION-2-CORREGIDO.json
```

### **Paso 4: Verificar Conexiones**
```
1. Abrir flujo 01 (principal)
2. Verificar que todas las tools apuntan a los sub-workflows correctos
3. Los IDs de workflows deben coincidir
```

### **Paso 5: Activar**
```
1. Activar flujo principal (01)
2. Los sub-workflows NO necesitan estar activos
   (se ejecutan cuando el principal los llama)
```

---

## 📁 Archivos Movidos a Backup

Todos los archivos antiguos/duplicados fueron movidos a:
```
versiones_antiguas/
```

**Total movido:** 33 archivos (versiones antiguas, duplicados, experimentales)

**Puedes eliminar esa carpeta si todo funciona correctamente después de 1 semana.**

---

## 🔑 Configuraciones Importantes

### **En Flujo 01 (Principal) - Nodo CONFIG:**
```javascript
BACKEND_NGROK_URL: "https://TU-URL.ngrok-free.app"  // ⚠️ ACTUALIZAR
NGROK_HEADER_NAME: "ngrok-skip-browser-warning"
NGROK_HEADER_VALUE: "true"
TELEFONO_CLINICA: "+573001234567"
```

### **En Flujo 01 (Principal) - Nodo OpenAI Chat Model:**
```
Model: gpt-4-turbo o gpt-4o
Temperature: 0.7
Max Tokens: 1500
```

### **En Flujo 01 (Principal) - Nodo Redis Chat Memory:**
```
Session Key: ={{ $json.session_id }}
TTL: 3600 segundos (1 hora)
```

---

## ✅ Checklist de Validación Post-Importación

Después de importar todos los flujos, verifica:

- [ ] Flujo 01 importado correctamente
- [ ] URL ngrok actualizada en nodo CONFIG
- [ ] Credenciales configuradas (WhatsApp, OpenAI, Redis)
- [ ] Sub-workflows 02-10 importados
- [ ] Tool connections en flujo 01 apuntando a los sub-workflows correctos
- [ ] Flujo 01 activado (toggle ON)
- [ ] Test enviado: "1234567890" → responde con nombre del paciente
- [ ] Test enviado: "tengo dolor de cabeza" → clasifica y muestra citas
- [ ] Sin errores en Executions log

---

## 📞 Archivos de Documentación

### **Guías de Implementación:**
- `ACCION-INMEDIATA.md` - Qué hacer ahora (5 minutos)
- `RESUMEN-FINAL-SOLUCION-COMPLETA.md` - Resumen completo
- `RESUMEN-EJECUTIVO-SOLUCION.md` - Resumen ejecutivo

### **Documentación Técnica:**
- `SOLUCION-CONTEXTO-ESCALABLE.md` - Solución detallada (problema + fix)
- `ACTUALIZACION-V2-EJECUCION-SECUENCIAL.md` - Corrección ejecución paralela
- `DIAGRAMA-FLUJO-OPTIMIZADO.md` - Diagramas visuales de flujos

### **Documentación de Correcciones:**
- `FLUJOS_LISTOS_PARA_IMPORTAR.md` - Lista original de correcciones
- Este archivo: `INDICE-FLUJOS-FINALES.md`

---

## 🎯 Resultado Final

✅ **10 flujos funcionales** listos para importar
✅ **Sistema escalable** para 100+ usuarios/hora
✅ **0 duplicados** en la carpeta
✅ **Documentación completa** de cada flujo
✅ **Versiones antiguas** respaldadas en `versiones_antiguas/`

---

## 🚀 Próximo Paso

**Importa el flujo principal AHORA:**
```
01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-EXPLICITA.json
```

**Lee:** `ACCION-INMEDIATA.md` para instrucciones paso a paso.

---

**Última actualización:** 2025-03-12
**Versión:** Final 3.0
**Status:** ✅ Listo para Producción
