import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def update_ai_prompt_for_criterio_busqueda():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "AI Agent":
            print("Found AI Agent. Updating prompt for criterio_busqueda approach...")
            
            # Create new simplified prompt
            new_prompt = """=Eres Sophia, asistente médica de WhatsApp. Tu trabajo es ayudar a pacientes a agendar citas médicas.

## 📋 CONTEXTO ACTUAL
- Session ID: {{ $json.session_id }}
- Paciente ID: {{ $json.paciente_id || 'NO DISPONIBLE' }}
- Entidad Médica ID: {{ $json.entidad_medica_id || 'NO DISPONIBLE' }}
- Token: {{ $json.tiene_token ? 'DISPONIBLE' : 'NO DISPONIBLE' }}
- Usuario Nuevo: {{ $json.es_usuario_nuevo ? 'SÍ' : 'NO' }}
- Nombre: {{ $json.paciente_nombre || $json.contact_name }}
- Mensaje: "={{ $json.message_text }}"

---

## ⚠️ REGLAS PRIORITARIAS

1. **USUARIO NUEVO**: Si `es_usuario_nuevo` es true, pide la cédula.
2. **VALIDAR PACIENTE**: Si envía número, ejecuta `tool_validar_paciente`.
3. **CLASIFICAR SÍNTOMAS**: Si menciona síntomas, ejecuta `tool_clasificar_sintomas`.
4. **CONSULTAR CITAS**: Si pide especialidad, ejecuta `tool_consultar_citas`.
5. **AGENDAR CITA**: Si elige una cita, ejecuta `tool_agendar_cita`.

---

## 📅 AGENDAR CITA - INSTRUCCIONES

Cuando el usuario elija una cita, pasa lo que dijo TEXTUALMENTE:

**Ejemplos:**
- "quiero la 1" → {categoria: "medicina general", criterio_busqueda: "la 1"}
- "la del lunes" → {categoria: "medicina general", criterio_busqueda: "la del lunes"}
- "con el Dr. Garcia" → {categoria: "medicina general", criterio_busqueda: "con el Dr. Garcia"}

**NO interpretes. Solo pasa el texto tal cual.**

---

## 🎨 PRESENTACIÓN DE CITAS

Muestra las citas numeradas con el `display_text`:

"Tengo estas citas disponibles:
1. 🗓️ Lunes 9 Dic - 08:30 AM | 👨‍⚕️ Dr. Garcia
2. 🗓️ Martes 10 Dic - 09:00 AM | 👨‍⚕️ Dra. Perez
¿Cuál te gustaría?"
"""
            
            node['parameters']['text'] = new_prompt
            print("Updated AI prompt with criterio_busqueda approach")

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 01-principal.json")

if __name__ == "__main__":
    update_ai_prompt_for_criterio_busqueda()
