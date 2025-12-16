# ✅ INSTRUCCIONES FINALES - IMPLEMENTACIÓN COMPLETADA

## 📋 RESUMEN

Se ha completado la implementación del sistema de mapeo Redis (Opción A) para solucionar el problema de citas incorrectas. Todos los archivos están listos.

---

## 🚀 PASO 1: LIMPIEZA COMPLETA

Ejecuta el script de limpieza:

```bash
cd /Users/kaizen1602/proyectoSophia/sophia/config/n8n0312
chmod +x SCRIPTS_LIMPIEZA.sh
./SCRIPTS_LIMPIEZA.sh
```

O ejecuta los comandos manualmente:

```bash
# 1. Limpiar conversaciones y citas
docker-compose exec backend python manage.py shell << 'EOF'
from accounts.models import ConversacionWhatsApp, Cita, Slot
from datetime import datetime, timedelta

ConversacionWhatsApp.objects.all().delete()
Cita.objects.filter(created_at__gte=datetime.now() - timedelta(days=1)).delete()
Slot.objects.all().update(disponible=True)
print("✅ Base de datos limpia")
EOF

# 2. Limpiar Redis
docker-compose exec redis redis-cli FLUSHALL
echo "✅ Redis limpio"
```

---

## 🔧 PASO 2: ACTUALIZAR PROMPT DEL AGENT

1. Ve a n8n → Workflows → `01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-U.V`

2. Haz clic en el nodo "AI Agent"

3. En el campo "System Message", **REEMPLAZA TODO EL CONTENIDO** con el texto del archivo:
   ```
   PROMPT_AGENT_CORREGIDO_FINAL.txt
   ```

4. **Guarda el workflow** (botón Save en la esquina superior derecha)

---

## 📥 PASO 3: REIMPORTAR WORKFLOWS

### 3.1. Eliminar workflows viejos

En n8n:
1. Ve a "Workflows" (menú izquierdo)
2. Busca y elimina (si existen):
   - `01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-U.V`
   - `05-Consultar_citas-CORREGIDO`
   - `06-SUB-AGENDAR-CITA-OPTIMIZED-FINAL16`

### 3.2. Importar workflows nuevos

Para cada uno de estos archivos:
- `01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-U.V.json`
- `05-Consultar_citas-CORREGIDO.json`
- `06-SUB-AGENDAR-CITA-OPTIMIZED-FINAL16.json`

**Hacer:**
1. Click en "Import from File" (botón + en workflows)
2. Seleccionar el archivo JSON
3. Click "Import"
4. **IMPORTANTE**: Activar el workflow (toggle en la esquina superior derecha)

### 3.3. Actualizar el prompt del Agent (CRÍTICO)

Después de importar el workflow 01:
1. Abrir `01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-U.V`
2. Click en nodo "AI Agent"
3. Copiar TODO el contenido de `PROMPT_AGENT_CORREGIDO_FINAL.txt`
4. Pegarlo en el campo "System Message"
5. **Guardar el workflow**

---

## 🧪 PASO 4: PROBAR EL FLUJO COMPLETO

### Escenario de prueba:

**1. Enviar:** `hola`
   - **Esperado:** Bot pide número de cédula

**2. Enviar:** `1108252740`
   - **Esperado:** Bot saluda con nombre "¡Hola K!"

**3. Enviar:** `tengo dolor de cabeza`
   - **Esperado:** Bot muestra 10 citas numeradas
   - Ejemplo:
     ```
     📅 2. Lunes 5 de diciembre a las 08:00 AM
        👨‍⚕️ Dr. Kevin Uribe

     📅 3. Lunes 5 de diciembre a las 08:30 AM
        👨‍⚕️ Dr. Kevin Uribe
     ```

**4. Enviar:** `quiero la 3`
   - **Esperado:** Bot confirma cita #3 EXACTAMENTE
   - Debe mostrar:
     ```
     ¡Perfecto! Tu cita está confirmada:
     📅 Lunes 5 de diciembre a las 08:30 AM
     👨‍⚕️ Dr. Kevin Uribe
     ```

---

## 🔍 PASO 5: VERIFICACIÓN EN N8N

Si hay algún problema, verifica en n8n:

### Flujo 05 - Última ejecución:

**Nodo "Crear Mapeo Posición→SlotID"** → OUTPUT:
```json
{
  "key": "sophia:mapeo:573001090344",
  "value": "{\"1\":5464,\"2\":5800,\"3\":6136,...}",
  "mapeo_preview": {
    "1": 5464,
    "2": 5800,
    "3": 6136
  }
}
```

**Nodo "Redis: Guardar Mapeo"** → OUTPUT:
- Debe mostrar "OK" o similar

### Flujo 06 - Última ejecución:

**Nodo "Parse Query JSON"** → OUTPUT:
```json
{
  "posicion": 3,
  "tiene_posicion": true,
  "tiene_agenda_id": false,
  "paciente_id": 22,
  "motivo_consulta": "Consulta general",
  ...
}
```

**Nodo "Redis: Leer Mapeo"** → OUTPUT:
```json
{
  "value": "{\"1\":5464,\"2\":5800,\"3\":6136,...}"
}
```

**Nodo "Resolver Slot ID"** → OUTPUT:
```json
{
  "slot_id": 6136,
  "posicion": 3,
  "resolucion": "mapeo",
  ...
}
```

**Nodo "Lock Slot (5 min)"** → URL debe ser:
```
https://.../api/v1/slots/6136/lock/
```
(Nota: 6136 es el slot_id de la posición 3)

---

## ✅ PASO 6: VERIFICAR EN BASE DE DATOS

Después de agendar la cita, verifica que sea la correcta:

```bash
docker-compose exec backend python manage.py shell << 'EOF'
from accounts.models import Cita

cita = Cita.objects.latest('created_at')
print(f"✅ Cita agendada con:")
print(f"   Médico: {cita.slot.agenda.medico.user.get_full_name()}")
print(f"   Fecha: {cita.slot.agenda.fecha}")
print(f"   Hora: {cita.slot.hora_inicio}")
print(f"   Slot ID: {cita.slot.id}")
EOF
```

Debe mostrar los datos de la cita que el usuario eligió (la #3).

---

## 🐛 TROUBLESHOOTING

### Problema: Agent sigue enviando `agenda_id` en lugar de `posicion`

**Solución:**
1. Verifica que actualizaste el prompt del Agent en el flujo 01
2. El prompt debe tener la sección "## 🚨 REGLA CRÍTICA #-1"
3. Limpia las conversaciones y Redis de nuevo
4. Prueba con una conversación completamente nueva

### Problema: "Slot no disponible"

**Solución:**
```bash
# Liberar el slot específico
docker-compose exec backend python manage.py shell << 'EOF'
from accounts.models import Cita, Slot

# Cambiar 6136 por el slot_id que está fallando
slot_id = 6136
Cita.objects.filter(slot_id=slot_id).delete()
Slot.objects.filter(id=slot_id).update(disponible=True)
print(f"✅ Slot {slot_id} liberado")
EOF

# Limpiar lock en Redis
docker-compose exec redis redis-cli DEL slot:lock:6136
```

### Problema: "Redis: Leer Mapeo" retorna null

**Causa:** El flujo 05 no guardó el mapeo o expiró (TTL de 1 hora)

**Solución:**
1. Verifica en flujo 05 → última ejecución → nodo "Redis: Guardar Mapeo"
2. Debe mostrar que guardó la key `sophia:mapeo:{session_id}`
3. Si no existe, vuelve a consultar citas (envía síntomas de nuevo)

---

## 📦 ARCHIVOS IMPORTANTES

- ✅ `PROMPT_AGENT_CORREGIDO_FINAL.txt` - Prompt corregido para copiar/pegar
- ✅ `SCRIPTS_LIMPIEZA.sh` - Script para limpiar todo
- ✅ `01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-U.V.json` - Flujo principal
- ✅ `05-Consultar_citas-CORREGIDO.json` - Flujo con mapeo Redis
- ✅ `06-SUB-AGENDAR-CITA-OPTIMIZED-FINAL16.json` - Flujo agendar corregido
- ✅ `INSTRUCCIONES_FINALES.md` - Este archivo

---

## 🎯 RESULTADO ESPERADO

```
Usuario: hola
Bot: ¡Hola! 👋 Soy Sophia. Para ayudarte, necesito tu número de cédula 🆔

Usuario: 1108252740
Bot: ¡Hola K! ¿En qué puedo ayudarte hoy? 😊

Usuario: tengo dolor de cabeza
Bot: He clasificado tus síntomas como Medicina General 🏥

     Encontré 520 citas disponibles. Te muestro las primeras 10:

     📅 1. Lunes 5 de diciembre a las 08:00 AM
        👨‍⚕️ Dr. Carlos García López

     📅 2. Lunes 5 de diciembre a las 08:00 AM
        👨‍⚕️ Dr. Kevin Uribe

     📅 3. Lunes 5 de diciembre a las 08:30 AM
        👨‍⚕️ Dr. Kevin Uribe

     [...]

     ¿Cuál te gustaría? Dime el número 😊

Usuario: quiero la 3
Bot: ¡Perfecto! Tu cita está confirmada:
     📅 Lunes 5 de diciembre a las 08:30 AM
     👨‍⚕️ Dr. Kevin Uribe

     Te llegará un recordatorio antes de tu cita 😊
```

**✅ La cita agendada DEBE ser la #3 (Dr. Kevin Uribe, 08:30 AM)**

---

¡Listo para probar! 🚀
