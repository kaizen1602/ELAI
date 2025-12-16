
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_unavailable_slots():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    target_node_name = "AI Agent"
    found = False
    
    new_rule = """
## ⛔ MANEJO DE HORARIOS NO DISPONIBLES (CRÍTICO)
Si el usuario pide un horario específico (ej: "las 11:30") que NO coincide con ninguna de las citas que ya le mostraste:
1. **NO intentes agendar** - ese slot no existe
2. **NO vuelvas a llamar tool_consultar_citas** - ya tienes las opciones
3. Responde amablemente: "Lo siento, pero las 11:30 no está disponible. Las opciones que tengo son: [repite las opciones que ya mostraste]. ¿Cuál te gustaría?"
4. **NUNCA inventes slot_id** - solo usa los IDs exactos que recibiste
"""

    for node in nodes:
        if node.get('name') == target_node_name:
            found = True
            old_prompt = node['parameters']['text']
            
            # Use strict text replacement to insert the new rule before "## 🎨 PRESENTACIÓN DE CITAS"
            # This places it high in priority but after the basic execution rules.
            
            if "## ⛔ MANEJO DE HORARIOS NO DISPONIBLES" in old_prompt:
                print("Rule already exists. Skipping.")
                return

            split_marker = "## 🎨 PRESENTACIÓN DE CITAS (IMPORTANTE)"
            if split_marker in old_prompt:
                parts = old_prompt.split(split_marker)
                new_prompt = parts[0] + new_rule + "\n\n" + split_marker + parts[1]
                node['parameters']['text'] = new_prompt
                print("Injected new rule before 'PRESENTACIÓN DE CITAS'")
            else:
                # Fallback: append to end if marker not found (though it should be there)
                node['parameters']['text'] = old_prompt + "\n\n" + new_rule
                print("Appended new rule to end of prompt")
            break
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched 01-principal.json with Unavailable Slots logic")

if __name__ == "__main__":
    fix_workflow_01_unavailable_slots()
