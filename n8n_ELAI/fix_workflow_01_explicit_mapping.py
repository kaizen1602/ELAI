import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_explicit_mapping():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "AI Agent":
            print("Found AI Agent. Adding explicit mapping instructions...")
            prompt = node['parameters']['text']
            
            # Find the "MAPA MENTAL" section and replace it with SUPER explicit instructions
            old_mental_map = """## 🧠 MAPA MENTAL DE CITAS (CRÍTICO)
Cuando ejecutes `tool_consultar_citas` y obtengas JSON, **GUARDA LOS IDs EN TU MEMORIA**.
El usuario dirá: "la 1", "la de las 10:30", "la primera".
**TU TRABAJO ES TRADUCIR ESO A UN `slot_id`.**

EJEMPLO DE PENSAMIENTO INTERNO:
1. Yo mostré: "1. 10:30 AM (ID: cmiy...)"
2. Usuario dice: "quiero la de las 10:30"
3. Ah, eso corresponde al ID "cmiy..."
4. EJECUTO `tool_agendar_cita` con slot_id="cmiy..."

❌ ERROR COMÚN:
No le preguntes al usuario por el ID.
No vuelvas a listar las citas si ya las mostraste y el usuario eligió una.
Si el usuario elige, ¡AGENDA DE INMEDIATO!"""

            new_mental_map = """## 🧠 MAPA MENTAL DE CITAS (CRÍTICO) - INSTRUCCIONES PASO A PASO

**PASO 1: Cuando ejecutes `tool_consultar_citas`**
Recibirás un JSON como este:
```json
{
  "citas": [
    {"slot_id": "cmiyv55bl0021uv2goya48q4j", "display_text": "🗓️ Lunes 15 Dic - ⏰ 08:00 | 👨‍⚕️ Dr. Garcia"},
    {"slot_id": "cl93nsjf0001b6gl3g4pet2k", "display_text": "🗓️ Lunes 15 Dic - ⏰ 08:30 | 👨‍⚕️ Dr. Garcia"},
    {"slot_id": "ck82abc123xyz", "display_text": "🗓️ Lunes 15 Dic - ⏰ 09:30 | 👨‍⚕️ Dr. Garcia"}
  ]
}
```

**PASO 2: GUARDA ESTE MAPA EN TU MEMORIA**
```
POSICIÓN 1 → slot_id: "cmiyv55bl0021uv2goya48q4j" (08:00)
POSICIÓN 2 → slot_id: "cl93nsjf0001b6gl3g4pet2k" (08:30)
POSICIÓN 3 → slot_id: "ck82abc123xyz" (09:30)
```

**PASO 3: Cuando el usuario diga "quiero la 2"**
1. Busca en tu mapa: POSICIÓN 2 = "cl93nsjf0001b6gl3g4pet2k"
2. Llama a `tool_agendar_cita` con:
   - slot_id: "cl93nsjf0001b6gl3g4pet2k" ← ¡EL STRING COMPLETO!
   - motivo_consulta: "Consulta programada"

**PASO 4: NUNCA HAGAS ESTO** ❌
- ❌ NO uses el número de posición como slot_id (ej: slot_id: "2")
- ❌ NO uses la hora como slot_id (ej: slot_id: "08:30")
- ❌ NO inventes IDs (ej: slot_id: "slot_2" o "cita_2")
- ❌ NO uses 0 o null como slot_id

**EJEMPLO CORRECTO** ✅
Usuario: "quiero la 2"
Tu pensamiento: "La posición 2 en mi mapa es cl93nsjf0001b6gl3g4pet2k"
Tu acción: Llamar tool_agendar_cita(slot_id="cl93nsjf0001b6gl3g4pet2k")

**EJEMPLO INCORRECTO** ❌
Usuario: "quiero la 2"
Tu acción: Llamar tool_agendar_cita(slot_id="2") ← ¡MAL! Esto causará error 404"""

            if old_mental_map in prompt:
                prompt = prompt.replace(old_mental_map, new_mental_map)
                print("Replaced mental map with explicit step-by-step instructions")
            else:
                print("Warning: Could not find old mental map section")
            
            node['parameters']['text'] = prompt

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 01-principal.json with explicit mapping")

if __name__ == "__main__":
    fix_workflow_01_explicit_mapping()
