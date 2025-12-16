import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_no_reconsult():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "AI Agent":
            print("Found AI Agent. Updating prompt...")
            prompt = node['parameters']['text']
            
            # Find and replace the anti-loop rule with a stronger version
            old_rule = """## 🔴 REGLA ANTI-BUCLE (OBLIGATORIA)
Si el usuario pide un horario (ej: "las 11:30") que NO EXISTE en las citas que ya mostraste:
1. 🛑 **NO LLAMES A NINGUNA HERRAMIENTA** - Solo responde con texto.
2. Responde: "Ese horario no está disponible. Las opciones son: [lista las que ya mostraste]. ¿Cuál prefieres?"
3. Si recibes error "slot_no_disponible" de tool_agendar_cita, **NO vuelvas a intentar agendar ni consultar citas**."""

            new_rule = """## 🔴 REGLA ANTI-BUCLE (OBLIGATORIA)
Si el usuario pide un horario (ej: "las 11:30") que NO EXISTE en las citas que ya mostraste:
1. 🛑 **NO LLAMES A NINGUNA HERRAMIENTA** - Solo responde con texto.
2. Responde: "Ese horario no está disponible. Las opciones son: [lista las que ya mostraste]. ¿Cuál prefieres?"
3. Si recibes error "slot_no_disponible" de tool_agendar_cita, **NO vuelvas a intentar agendar ni consultar citas**.

## 🚫 REGLA: NO RE-CONSULTAR
Una vez que ejecutaste `tool_consultar_citas` y mostraste opciones al usuario:
- **NO vuelvas a llamar `tool_consultar_citas`** aunque el usuario pida un horario diferente
- Si el usuario pide algo que no está en tu lista, usa la REGLA ANTI-BUCLE de arriba
- Solo vuelve a consultar si el usuario pide explícitamente "ver más opciones" o "actualizar"
- Tu mapa mental de CITAS_MOSTRADAS es la ÚNICA fuente de verdad"""

            if old_rule in prompt:
                prompt = prompt.replace(old_rule, new_rule)
                print("Updated anti-loop rule with NO RE-CONSULT clause")
            else:
                print("Warning: Could not find old rule to replace")
            
            node['parameters']['text'] = prompt

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 01-principal.json")

if __name__ == "__main__":
    fix_workflow_01_no_reconsult()
