
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_rename_param():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # 1. Update Tool Definition
    for node in nodes:
        if node.get('name') == "tool_agendar_cita":
            print("Found tool_agendar_cita. Updating schema...")
            wf_inputs = node['parameters']['workflowInputs']
            
            # Update 'value' mapping
            # Old: "agenda_id": "={{ $fromAI('agenda_id', '', 'string') }}"
            # New: "agenda_id": "={{ $fromAI('slot_id', '', 'string') }}"
            if 'values' in wf_inputs: # N8N structural variance check
                 # Handling variance just in case, but usually it's 'value' object
                 pass
            
            values = wf_inputs.get('value', {})
            if 'agenda_id' in values:
                values['agenda_id'] = "={{ $fromAI('slot_id', '', 'string') }}"
            
            # Update 'schema' definition
            schema = wf_inputs.get('schema', [])
            for field in schema:
                if field.get('id') == 'agenda_id':
                    field['id'] = 'slot_id'
                    field['displayName'] = 'slot_id'
                    print("Renamed parameter schema to slot_id")

            # Update Description
            desc = node['parameters'].get('description', '')
            # Replace instructions
            new_desc = desc.replace(
                "Provide: agenda_id (USE slot_id from selected appointment - NEVER use position number or 0)",
                "Provide: slot_id (The CUID string from the appointment list). DO NOT use position numbers."
            )
            node['parameters']['description'] = new_desc

    # 2. Update System Prompt regarding this tool
    for node in nodes:
        if node.get('name') == "AI Agent":
            print("Found AI Agent. Updating prompt...")
            prompt = node['parameters']['text']
            
            # Replace old misleading instruction
            # Old: EJECUTO `tool_agendar_cita` con agenda_id="cmiy..."
            # New: EJECUTO `tool_agendar_cita` con slot_id="cmiy..."
            
            prompt = prompt.replace(
                'EJECUTO `tool_agendar_cita` con agenda_id="cmiy', 
                'EJECUTO `tool_agendar_cita` con slot_id="cmiy'
            )
            
            # Replace the "Critical Rule" section
            old_rule = """## 🚨 REGLA CRÍTICA: slot_id vs agenda_id

**ESTRUCTURA DE UNA CITA RETORNADA:**
```json
{
  "slot_id": 2934,                    // ← ESTE ES EL ID REAL QUE DEBES USAR
  "agenda_id": 199,                   // ← IGNORA ESTO COMPLETAMENTE
  "fecha_formateada": "4 de noviembre",
  "hora": "08:00 AM",
  "medico_nombre": "Dr. Carlos García López"
}
```

**AL AGENDAR:**
- Usa SIEMPRE el `slot_id` (ej: 2934) como valor para `agenda_id`.
- NUNCA uses el número de posición (1, 2, 3)."""

            new_rule = """## 🚨 REGLA CRÍTICA: USAR slot_id

**ESTRUCTURA DE UNA CITA:**
La herramienta `tool_consultar_citas` te devuelve una lista donde cada cita tiene un `slot_id` (ej: "cmiy...").

**AL AGENDAR:**
- La herramienta `tool_agendar_cita` requiere el parámetro `slot_id`.
- Pásale EXACTAMENTE el string del `slot_id` que guardaste en tu memoria.
- JAMÁS uses el número de lista (1, 2, 3)."""
            
            # Since strict replacement is brittle, I will replace substring tokens
            if "REGLA CRÍTICA: slot_id vs agenda_id" in prompt:
                 # We can try to replace the block if it matches, otherwise just generic replace
                 prompt = prompt.replace("slot_id vs agenda_id", "USO DE slot_id")
                 prompt = prompt.replace('como valor para `agenda_id`', 'para la tool')
            
            # Ensure the "Internal Thought" example is updated
            prompt = prompt.replace('agenda_id="cmiy...', 'slot_id="cmiy...')
            
            node['parameters']['text'] = prompt

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully renamed tool parameter to slot_id in 01-principal.json")

if __name__ == "__main__":
    fix_workflow_01_rename_param()
