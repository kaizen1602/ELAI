# 🔍 Diagnóstico del Backend - Diciembre 4, 2025

## ✅ Endpoints Funcionando Correctamente

### 1. `/api/v1/pacientes/validar/` ✅

**Paciente 1: `1234567890`**
```json
{
  "success": true,
  "paciente_id": 18,
  "nombre": "Juan Pérez",
  "documento": "1234567890",
  "entidad_medica_id": 2,
  "entidad_nombre": "Hospital Universitario San Rafael",
  "token": "eyJ..."
}
```

**Paciente 2: `0987654321`**
```json
{
  "success": true,
  "paciente_id": 19,
  "nombre": "Ana López",
  "entidad_medica_id": 3
}
```

✅ **Ambos pacientes retornan `entidad_medica_id` correctamente**

---

### 2. `/api/v1/conversaciones/activa-publica/{session_id}/` ✅

**Ejemplo de respuesta:**
```json
{
  "id": 8,
  "paciente_id": 18,
  "entidad_medica_id": 2,
  "token": "eyJ...",
  "estado": "ACTIVO",
  "contexto": {
    "estado_flujo": "ESPERANDO_INICIO",
    "fecha_inicio": "2025-10-30T15:20:59.050944",
    "ultimo_mensaje": "2025-10-30T15:20:59.050952"
  }
}
```

✅ **El endpoint SÍ retorna `entidad_medica_id`**

---

## ⚠️ PROBLEMA CRÍTICO: Citas con Fechas Pasadas

### `/api/v1/citas/disponibles/`

**Respuesta actual:**
```json
{
  "success": true,
  "total_citas": 348,
  "citas": [
    {
      "slot_id": 2662,
      "fecha": "2025-10-30",  ← FECHA PASADA (hace 35 días)
      "hora": "08:00:00",
      "medico": "Dr. Carlos García López",
      "disponible": true
    },
    {
      "slot_id": 2646,
      "fecha": "2025-10-29",  ← FECHA PASADA (hace 36 días)
      "hora": "08:00:00",
      "disponible": true
    },
    {
      "slot_id": 2678,
      "fecha": "2025-10-31",  ← FECHA PASADA (hace 34 días)
      "hora": "08:00:00",
      "disponible": true
    }
  ]
}
```

### 📊 Análisis de Fechas Retornadas

**Fecha actual:** `2025-12-04`

**Primeras 20 citas retornadas:**
- ❌ `2025-10-29` (36 días atrás)
- ❌ `2025-10-30` (35 días atrás)
- ❌ `2025-10-31` (34 días atrás)
- ❌ `2025-11-03` (31 días atrás)
- ❌ `2025-11-04` (30 días atrás)
- ❌ `2025-11-05` (29 días atrás)
- ❌ `2025-11-06` (28 días atrás)
- ❌ `2025-11-07` (27 días atrás)
- ❌ `2025-11-10` (24 días atrás)
- ❌ `2025-11-11` (23 días atrás)
- ❌ `2025-11-12` (22 días atrás)
- ❌ `2025-11-13` (21 días atrás)
- ❌ `2025-11-14` (20 días atrás)
- ❌ `2025-11-17` (17 días atrás)
- ❌ `2025-11-18` (16 días atrás)
- ❌ `2025-11-19` (15 días atrás)
- ❌ `2025-11-20` (14 días atrás)
- ❌ `2025-11-21` (13 días atrás)
- ❌ `2025-11-24` (10 días atrás)
- ❌ `2025-11-25` (9 días atrás)

**Total:** 348 citas retornadas, **TODAS son fechas pasadas** 🚨

---

## 🔧 Solución Requerida

### **Modificar el código del endpoint `/api/v1/citas/disponibles/`**

**Archivo:** `/backend/accounts/views.py` (línea 1193)

**Código Actual (INCORRECTO):**
```python
slots = Slot.objects.filter(
    disponible=True,
    agenda__medico__especialidad=especialidad
).select_related('agenda', 'agenda__medico', 'agenda__medico__especialidad')
```

**Código Corregido (DEBE SER):**
```python
from django.utils import timezone

# Filtrar solo citas FUTURAS (desde hoy en adelante)
fecha_hoy = timezone.now().date()

slots = Slot.objects.filter(
    disponible=True,
    agenda__medico__especialidad=especialidad,
    agenda__fecha__gte=fecha_hoy  # ← AGREGAR ESTE FILTRO
).select_related('agenda', 'agenda__medico', 'agenda__medico__especialidad')
```

---

## 📋 Checklist de Corrección

### **Paso 1: Modificar el Endpoint**
```bash
cd /Users/kaizen1602/proyectoSophia/sophia/backend
# Editar accounts/views.py línea 1193
```

**Agregar filtro de fecha:**
```python
# En el método disponibles() de CitaViewSet (línea 1193)
from django.utils import timezone

# Antes de:
slots = Slot.objects.filter(...)

# Agregar:
fecha_hoy = timezone.now().date()

# Y modificar el filtro a:
slots = Slot.objects.filter(
    disponible=True,
    agenda__medico__especialidad=especialidad,
    agenda__fecha__gte=fecha_hoy  # NUEVO
)
```

### **Paso 2: Crear Slots para Diciembre 2025**

Si no existen slots para diciembre, necesitas ejecutar un script de creación de agendas:

```bash
cd /Users/kaizen1602/proyectoSophia/sophia/backend
python manage.py shell
```

```python
from accounts.models import Agenda, Slot, Medico
from datetime import date, timedelta, time

# Buscar el médico (Dr. Carlos García López)
medico = Medico.objects.get(id=34)

# Crear agendas para diciembre 2025 (del 4 al 31)
fecha_inicio = date(2025, 12, 4)
fecha_fin = date(2025, 12, 31)

fecha_actual = fecha_inicio
while fecha_actual <= fecha_fin:
    # Saltar fines de semana (opcional)
    if fecha_actual.weekday() < 5:  # Lunes=0, Viernes=4
        # Crear agenda para este día
        agenda, created = Agenda.objects.get_or_create(
            medico=medico,
            fecha=fecha_actual,
            defaults={
                'hora_inicio': time(8, 0),
                'hora_fin': time(12, 0),
                'duracion_cita': 30,
                'estado': 'publicado'
            }
        )

        if created:
            print(f"✅ Agenda creada para {fecha_actual}")
            # Los slots se crean automáticamente en el método save() del modelo Agenda
        else:
            print(f"⚠️ Agenda ya existe para {fecha_actual}")

    fecha_actual += timedelta(days=1)

print("✅ Agendas y slots creados para diciembre 2025")
```

### **Paso 3: Verificar Slots Creados**

```bash
curl -s "https://e5d3dba10ea2.ngrok-free.app/api/v1/citas/disponibles/?categoria=general&entidad_medica_id=2" \
  -H "Authorization: Bearer $(curl -s -X POST https://e5d3dba10ea2.ngrok-free.app/api/v1/pacientes/validar/ -H 'Content-Type: application/json' -H 'ngrok-skip-browser-warning: true' -d '{"documento": "1234567890"}' | jq -r '.token')" \
  -H "ngrok-skip-browser-warning: true" | jq '.citas[:10]'
```

**Resultado esperado:**
```json
{
  "success": true,
  "total_citas": 50,
  "citas": [
    {
      "fecha": "2025-12-04",  ← HOY O FUTURO
      "hora": "08:00:00"
    },
    {
      "fecha": "2025-12-05",
      "hora": "08:00:00"
    }
  ]
}
```

---

## 📊 Resumen de Estado

| Componente | Estado | Problema | Solución |
|------------|--------|----------|----------|
| **Validación Pacientes** | ✅ OK | Ninguno | N/A |
| **Conversación Activa** | ✅ OK | Ninguno | N/A |
| **entidad_medica_id** | ✅ OK | Ninguno | N/A |
| **Citas Disponibles - Endpoint** | ❌ ERROR | Retorna fechas pasadas | Agregar filtro `agenda__fecha__gte=fecha_hoy` |
| **Slots para Diciembre** | ❓ VERIFICAR | Posiblemente no existen | Ejecutar script de creación |

---

## 🚀 Acción Inmediata Requerida

1. **CRÍTICO:** Modificar `/backend/accounts/views.py` línea 1193 para filtrar solo fechas futuras
2. **CRÍTICO:** Crear slots/agendas para diciembre 2025 (del 4 al 31)
3. **Reiniciar backend:** `docker-compose restart backend` (si usa Docker)
4. **Verificar:** Probar endpoint de citas disponibles

---

## ✅ Datos Correctos para Testing

**Paciente 1:**
- Documento: `1234567890`
- Nombre: `Juan Pérez`
- ID: `18`
- Entidad ID: `2` (Hospital Universitario San Rafael)

**Paciente 2:**
- Documento: `0987654321`
- Nombre: `Ana López`
- ID: `19`
- Entidad ID: `3`

**Ambos pacientes están correctamente registrados y tienen `entidad_medica_id` válido.**

---

**Fecha de diagnóstico:** 2025-12-04
**Estado:** Requiere corrección en endpoint de citas disponibles + creación de slots futuros
