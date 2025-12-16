# ARCHIVOS CORREGIDOS - FLUJOS N8N SOPHIA

**Fecha de generación:** 2025-12-03
**Método:** Corrección automática mediante script Python
**Estado:** ✅ Todos los flujos corregidos y validados

---

## LISTA DE ARCHIVOS GENERADOS

### Flujos corregidos (sufijo -FIXED.json):

1. **01-WORKFLOW-PRINCIPAL-COMPLETO-FIXED-V2-4-FIXED.json** (42K)
   - Flujo principal de WhatsApp
   - 1 cambio: URL HTTP corregida
   - Ya tenía nodo CONFIG

2. **02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED-FIXED.json** (21K)
   - Sub-workflow de validación de pacientes
   - 4 cambios: CONFIG añadido + 3 URLs HTTP corregidas
   - 18 nodos totales

3. **03-SUB-CREAR-CONVERSACION-2-FIXED.json** (6.7K)
   - Sub-workflow de creación de conversaciones
   - 1 cambio: URL HTTP corregida
   - Ya tenía nodo CONFIG

4. **04-SUB-CLASIFICAR-SINTOMAS-V3-FIXED-2-FIXED.json** (10K)
   - Sub-workflow de clasificación de síntomas con IA
   - 1 cambio: CONFIG añadido
   - Sin nodos HTTP (usa OpenAI directamente)

5. **05-Consultar_citas-FIXED.json** (15K)
   - Sub-workflow de consulta de citas disponibles
   - 5 cambios: CONFIG añadido + 1 URL HTTP + 3 nodos Redis
   - Incluye paginación y filtrado

6. **06-SUB-AGENDAR-CITA-OPTIMIZED-FIXED.json** (12K)
   - Sub-workflow de agendamiento de citas
   - 5 cambios: CONFIG añadido + 4 nodos Redis
   - Maneja locks para evitar doble reserva

7. **07-SUB-LISTAR-CITAS-ACTIVAS-CORREGIDO-5-FIXED.json** (6.7K)
   - Sub-workflow de listado de citas activas del paciente
   - 1 cambio: URL HTTP corregida
   - Ya tenía nodo CONFIG

8. **08-SUB-CONFIRMAR-CANCELACION-CORREGIDO-4-FIXED.json** (7.4K)
   - Sub-workflow de cancelación de citas
   - 1 cambio: URL HTTP corregida
   - Ya tenía nodo CONFIG

9. **09-SUB-ACTUALIZAR-CONTEXTO-CONVERSACION-2-FIXED.json** (6.5K)
   - Sub-workflow de actualización de contexto
   - 2 cambios: CONFIG añadido + URL HTTP corregida
   - Actualiza estado de conversación en BD

10. **10-SUB-FINALIZAR-CONVERSACION-2-FIXED.json** (5.7K)
    - Sub-workflow de finalización de conversación
    - 2 cambios: CONFIG añadido + URL HTTP corregida
    - Cierra conversación y limpia estado

---

## DOCUMENTACIÓN GENERADA

### Reportes y documentación:

- **REPORTE_CORRECCION_FLUJOS.md**
  - Reporte ejecutivo de todas las correcciones
  - Incluye checklist de validación
  - Instrucciones de importación

- **RESUMEN_DETALLADO_CORRECCIONES.md**
  - Análisis técnico profundo
  - Ejemplos de cada tipo de corrección
  - Tabla comparativa de cambios
  - FAQ y troubleshooting

- **README_ARCHIVOS_CORREGIDOS.md** (este archivo)
  - Índice de todos los archivos generados
  - Resumen rápido de cada flujo

### Scripts:

- **fix_workflows.py**
  - Script Python de corrección automática
  - Puede re-ejecutarse si se necesitan ajustes
  - Preserva archivos originales

---

## ESTRUCTURA DE DIRECTORIOS

```
/config/n8n0312/
├── 01-WORKFLOW-PRINCIPAL-COMPLETO-FIXED-V2-4.json ................. (original)
├── 01-WORKFLOW-PRINCIPAL-COMPLETO-FIXED-V2-4-FIXED.json ........... ✅ (corregido)
├── 02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED.json ...................... (original)
├── 02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED-FIXED.json ................ ✅ (corregido)
├── 03-SUB-CREAR-CONVERSACION-2.json ............................... (original)
├── 03-SUB-CREAR-CONVERSACION-2-FIXED.json ......................... ✅ (corregido)
├── 04-SUB-CLASIFICAR-SINTOMAS-V3-FIXED-2.json ..................... (original)
├── 04-SUB-CLASIFICAR-SINTOMAS-V3-FIXED-2-FIXED.json ............... ✅ (corregido)
├── 05-Consultar_citas.json ........................................ (original)
├── 05-Consultar_citas-FIXED.json .................................. ✅ (corregido)
├── 06-SUB-AGENDAR-CITA-OPTIMIZED.json ............................. (original)
├── 06-SUB-AGENDAR-CITA-OPTIMIZED-FIXED.json ....................... ✅ (corregido)
├── 07-SUB-LISTAR-CITAS-ACTIVAS-CORREGIDO-5.json ................... (original)
├── 07-SUB-LISTAR-CITAS-ACTIVAS-CORREGIDO-5-FIXED.json ............. ✅ (corregido)
├── 08-SUB-CONFIRMAR-CANCELACION-CORREGIDO-4.json .................. (original)
├── 08-SUB-CONFIRMAR-CANCELACION-CORREGIDO-4-FIXED.json ............ ✅ (corregido)
├── 09-SUB-ACTUALIZAR-CONTEXTO-CONVERSACION-2.json ................. (original)
├── 09-SUB-ACTUALIZAR-CONTEXTO-CONVERSACION-2-FIXED.json ........... ✅ (corregido)
├── 10-SUB-FINALIZAR-CONVERSACION-2.json ........................... (original)
├── 10-SUB-FINALIZAR-CONVERSACION-2-FIXED.json ..................... ✅ (corregido)
├── fix_workflows.py ............................................... (script)
├── REPORTE_CORRECCION_FLUJOS.md ................................... (reporte)
├── RESUMEN_DETALLADO_CORRECCIONES.md .............................. (análisis)
└── README_ARCHIVOS_CORREGIDOS.md .................................. (este archivo)
```

---

## RESUMEN DE CORRECCIONES APLICADAS

### Por tipo de corrección:

| Tipo de corrección | Cantidad | Flujos afectados |
|-------------------|----------|------------------|
| Nodo CONFIG añadido | 6 | 02, 04, 05, 06, 09, 10 |
| URLs HTTP corregidas | 10 | 01, 02(3x), 03, 05, 07, 08, 09, 10 |
| Nodos Redis corregidos | 7 | 05(3x), 06(4x) |
| Headers ngrok corregidos | Todos | Incluidos en URLs HTTP |
| **TOTAL** | **23** | **10 flujos** |

### Por gravedad del problema:

- 🔴 **Crítico** (impedía ejecución): 16 correcciones
  - 6 flujos sin CONFIG (no podían ejecutarse)
  - 7 nodos Redis sin messageData (causaban error)
  - 3 URLs con sintaxis incorrecta

- 🟡 **Medio** (funcionaba con plan de pago): 7 correcciones
  - 7 URLs usando $vars (requería plan de pago)

- 🟢 **Menor** (optimización): 0 correcciones

---

## VALIDACIÓN DE CORRECCIONES

### Tests automáticos ejecutados:

✅ **JSON válido** - Todos los archivos -FIXED.json son JSON válido
✅ **Estructura n8n** - Todos mantienen la estructura esperada por n8n
✅ **IDs únicos** - Todos los nodos tienen IDs únicos
✅ **Conexiones válidas** - Todas las conexiones apuntan a nodos existentes
✅ **CONFIG presente** - Todos los flujos que lo necesitan tienen CONFIG
✅ **URLs corregidas** - Ninguna URL usa $vars o sintaxis incorrecta
✅ **Redis completo** - Todos los nodos Redis publish tienen messageData

### Validación manual recomendada:

- [ ] Importar flujos en n8n sin errores
- [ ] Verificar credenciales asignadas correctamente
- [ ] Actualizar URL de ngrok en CONFIG del flujo 01
- [ ] Ejecutar prueba del flujo principal (01)
- [ ] Verificar que sub-workflows se ejecutan correctamente

---

## PRÓXIMOS PASOS

### 1. Pre-importación

Antes de importar en n8n:

```bash
# Verificar archivos
cd /Users/kaizen1602/proyectoSophia/sophia/config/n8n0312
ls -lh *-FIXED.json

# Validar JSON
for f in *-FIXED.json; do
  python3 -m json.tool "$f" > /dev/null && echo "✅ $f" || echo "❌ $f"
done
```

### 2. Importación en n8n

Orden recomendado:
1. Flujo 01 (principal)
2. Flujos 02-10 (sub-workflows)

Para cada flujo:
1. Ir a n8n → Workflows → Import from File
2. Seleccionar archivo `-FIXED.json`
3. Verificar que no hay errores de importación
4. Asignar credenciales si es necesario

### 3. Configuración

Solo en el flujo 01:
1. Abrir nodo `CONFIG`
2. Actualizar `BACKEND_NGROK_URL` con tu URL actual de ngrok
3. Guardar workflow

### 4. Pruebas

Ejecutar en orden:
1. Flujo 04 (clasificar síntomas) - No requiere backend
2. Flujo 05 (consultar citas) - Requiere backend
3. Flujo 06 (agendar cita) - Requiere backend + Redis
4. Flujo 01 (principal) - Prueba end-to-end

### 5. Activación

Una vez validado todo:
1. Activar flujo 01 (principal)
2. Los sub-workflows se activan automáticamente al ejecutarse

---

## TROUBLESHOOTING

### Error: "Cannot find module CONFIG"

**Causa:** El nodo CONFIG no está conectado correctamente
**Solución:**
1. Verificar que CONFIG está después del trigger
2. Verificar conexión: `Trigger → CONFIG → Resto del flujo`

### Error: "Invalid URL"

**Causa:** La URL aún tiene sintaxis incorrecta
**Solución:**
1. Verificar que NO tenga `=` al inicio si usa `{{ }}`
2. Verificar que usa `$('CONFIG').item.json.BACKEND_NGROK_URL` y no `$vars`

### Error: "Redis publish failed"

**Causa:** Falta campo messageData
**Solución:**
1. Verificar que el nodo Redis publish tenga campo `messageData`
2. Si no lo tiene, ejecutar nuevamente `fix_workflows.py`

### Error: "$vars is not defined"

**Causa:** Flujo aún usa $vars en lugar de CONFIG
**Solución:**
1. Verificar que estás usando el archivo `-FIXED.json`
2. Si el problema persiste, regenerar con `python3 fix_workflows.py`

---

## MANTENIMIENTO

### Actualizar URL de ngrok

Cuando reinicies ngrok:
1. Obtener nueva URL: `ngrok http 8000`
2. Copiar URL (ej: `https://abc123.ngrok-free.app`)
3. En n8n, abrir flujo 01
4. Abrir nodo `CONFIG`
5. Actualizar línea: `BACKEND_NGROK_URL: "https://abc123.ngrok-free.app"`
6. Guardar

**Nota:** NO necesitas actualizar los otros 9 flujos. Solo el 01.

### Regenerar flujos corregidos

Si necesitas aplicar nuevas correcciones:

```bash
cd /Users/kaizen1602/proyectoSophia/sophia/config/n8n0312
python3 fix_workflows.py
```

El script:
- Preserva archivos originales
- Sobrescribe archivos `-FIXED.json`
- Genera nuevo reporte

---

## ARCHIVOS A IMPORTAR EN N8N

**IMPORTANTE:** Solo importa archivos con sufijo `-FIXED.json`

### Lista de importación:

```
✅ 01-WORKFLOW-PRINCIPAL-COMPLETO-FIXED-V2-4-FIXED.json
✅ 02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED-FIXED.json
✅ 03-SUB-CREAR-CONVERSACION-2-FIXED.json
✅ 04-SUB-CLASIFICAR-SINTOMAS-V3-FIXED-2-FIXED.json
✅ 05-Consultar_citas-FIXED.json
✅ 06-SUB-AGENDAR-CITA-OPTIMIZED-FIXED.json
✅ 07-SUB-LISTAR-CITAS-ACTIVAS-CORREGIDO-5-FIXED.json
✅ 08-SUB-CONFIRMAR-CANCELACION-CORREGIDO-4-FIXED.json
✅ 09-SUB-ACTUALIZAR-CONTEXTO-CONVERSACION-2-FIXED.json
✅ 10-SUB-FINALIZAR-CONVERSACION-2-FIXED.json
```

### Archivos a NO importar:

```
❌ *-OPTIMIZED.json (originales sin corregir)
❌ *-CORREGIDO-*.json (originales sin corregir)
❌ *-FIXED-V2-*.json (original del flujo 01 sin corregir)
```

---

## CONTACTO Y SOPORTE

**Documentación completa:**
- REPORTE_CORRECCION_FLUJOS.md - Reporte ejecutivo
- RESUMEN_DETALLADO_CORRECCIONES.md - Análisis técnico

**Script de corrección:**
- fix_workflows.py - Script Python reutilizable

**Versión:** 1.0
**Fecha:** 2025-12-03
**Estado:** ✅ Producción

---

**NOTA IMPORTANTE:**
Los archivos originales (sin sufijo `-FIXED`) NO fueron modificados.
Siempre tienes un backup de los flujos originales.
