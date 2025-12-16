# 🎯 SOLUCIÓN DEFINITIVA - Problema de Mapeo de Citas

## 🔴 PROBLEMA IDENTIFICADO

Cuando el usuario dice "quiero la 2", el sistema agenda una cita INCORRECTA:
- **Usuario pidió**: Posición 2 = Dr. Kevin Uribe (slot_id: 5800)
- **Sistema agendó**: Dr. Carlos García López (slot_id: 2951)

**Causa**: El Agent (OpenAI) NO está guardando correctamente el mapeo entre posiciones (1, 2, 3...) y slot_ids reales.

---

## ✅ SOLUCIÓN PROPUESTA

### Opción A: Usar Redis para Guardar el Mapeo (MÁS CONFIABLE)

En lugar de depender de la "memoria" del Agent, guardamos el mapeo en Redis:

**Flujo 05 (Consultar Citas):**
1. Consulta las citas disponibles
2. Crea el mapeo: `{1: 5464, 2: 5800, 3: 6136, ...}`
3. **Guarda el mapeo en Redis** con key: `sophia:mapeo:{session_id}`
4. Retorna las citas formateadas al Agent

**Flujo 06 (Agendar Cita):**
1. Recibe `posicion` del Agent (1, 2, 3, etc.)
2. **Lee el mapeo de Redis**: `sophia:mapeo:{session_id}`
3. Convierte posición → slot_id: `mapeo[posicion]`
4. Agenda la cita con el slot_id correcto

### Opción B: Cambiar el Enfoque del Agent (MÁS SIMPLE)

En lugar de que el Agent "recuerde" el mapeo, cambiar la interacción:

**Nuevo flujo:**
1. Consultar citas retorna JSON estructurado
2. Agent muestra las citas con un "código" único
3. Usuario responde con el código
4. Agent envía el código/slot_id directamente

---

## 🔧 IMPLEMENTACIÓN - OPCIÓN A (Recomendada)

### Paso 1: Modificar Flujo 05

Añadir nodo al final del flujo 05 que guarde el mapeo en Redis:

```javascript
// Nodo: Guardar Mapeo en Redis
const citas = $json.citas || [];
const sessionId = $('When Executed by Another Workflow').item.json.session_id;

// Crear mapeo posicion -> slot_id
const mapeo = {};
citas.forEach((cita, index) => {
    mapeo[index + 1] = cita.slot_id;
});

console.log('Mapeo creado:', mapeo);
console.log('Session ID:', sessionId);

// Retornar para guardar en Redis
return {
    json: {
        key: `sophia:mapeo:${sessionId}`,
        value: JSON.stringify(mapeo),
        ttl: 3600  // 1 hora
    }
};
```

Luego conectar a nodo Redis con operación SET.

### Paso 2: Modificar Flujo 06

Añadir nodo después de "Parse Query JSON" que lea el mapeo:

```javascript
// Nodo: Obtener Slot ID desde Mapeo
const posicion = $json.posicion;  // Si el Agent envía posición
const agendaId = $json.agenda_id;  // O si envía agenda_id directamente
const sessionId = $json.session_id;

let slotIdFinal = agendaId;  // Por defecto usar agenda_id

// Si se envió posición, buscar en el mapeo
if (posicion && !agendaId) {
    // Leer mapeo de Redis (usando nodo Redis GET previo)
    const mapeoStr = $('Redis GET Mapeo').item.json.value;
    if (mapeoStr) {
        const mapeo = JSON.parse(mapeoStr);
        slotIdFinal = mapeo[posicion];
        console.log(`Posición ${posicion} → Slot ID ${slotIdFinal}`);
    }
}

return {
    json: {
        ...$json,
        slot_id: slotIdFinal,
        agenda_id: slotIdFinal
    }
};
```

### Paso 3: Modificar Description del tool_agendar_cita

Cambiar la descripción para que el Agent entienda mejor:

```
USE THIS when user selects appointment by position (1, 2, 3...) or date.

Provide EITHER:
- posicion: number (1-10) if user says "la 1", "la primera", etc.
- agenda_id: number (slot_id) if you have the exact slot_id

The system will look up the correct slot_id from the mapping.

Context provides: paciente_id, session_id, token
```

---

## 📝 ALTERNATIVA MÁS RÁPIDA (Sin modificar flujos)

### Simplificar el Prompt del Agent

Reemplazar toda la sección de "PASO 2: GUARDAR MAPEO" con esto:

```
### MAPEO DE CITAS - REGLA CRÍTICA

Cuando tool_consultar_citas retorna citas, ANOTA ESTO EN TU MEMORIA:

Ejemplo de respuesta:
{
  "citas": [
    {"slot_id": 5464, "fecha": "5 dic", "hora": "08:00", "medico": "Dr. García"},
    {"slot_id": 5800, "fecha": "5 dic", "hora": "08:00", "medico": "Dr. Uribe"},
    ...
  ]
}

TU TRABAJO:
1. Mostrar las citas numeradas (1, 2, 3...)
2. CUANDO EL USUARIO DIGA "LA 2":
   - Buscar en la respuesta original: citas[1] (posición 1 en array)
   - Tomar el slot_id: 5800
   - Ejecutar tool_agendar_cita(agenda_id=5800)

NUNCA inventes números. SIEMPRE usa el slot_id de la respuesta original.
```

Y añadir validación:

```
ANTES de ejecutar tool_agendar_cita:
1. ¿Tengo la respuesta de tool_consultar_citas en mi contexto?
2. ¿Puedo ver el array de citas?
3. ¿Sé qué slot_id corresponde a la posición que el usuario pidió?
4. SI NO → Pedir al usuario que repita o mostrar citas nuevamente
5. SI SÍ → Usar ese slot_id exacto
```

---

## 🧪 PRUEBA DESPUÉS DE APLICAR

```
Usuario: tengo dolor de cabeza
Bot: [Muestra 10 citas]

Usuario: quiero la 2
→ El sistema debe agendar EXACTAMENTE la cita #2 de la lista mostrada
→ Verificar en BD que el slot_id y médico sean correctos
```

---

## ⚠️ DECISIÓN RECOMENDADA

**Opción A (Redis)**: Más trabajo inicial, pero 100% confiable
**Opción B (Prompt)**: Más rápido, pero depende de que OpenAI funcione bien

**MI RECOMENDACIÓN**: Empezar con Opción B (prompt mejorado) y si sigue fallando, implementar Opción A (Redis).

---

## 📊 VERIFICACIÓN EN BD

```bash
# Verificar última cita agendada
docker-compose exec backend python manage.py shell << 'EOF'
from accounts.models import Cita
cita = Cita.objects.latest('created_at')
print(f"Cita con: {cita.slot.agenda.medico.user.get_full_name()}")
print(f"Fecha: {cita.slot.agenda.fecha}")
print(f"Hora: {cita.slot.hora_inicio}")
print(f"Slot ID: {cita.slot.id}")
EOF
```

Comparar con lo que el bot mostró al usuario.

---

**¿Qué prefieres implementar primero?**
- A) Modificar flujos 05 y 06 (Redis - más confiable)
- B) Solo mejorar el prompt del Agent (más rápido)
