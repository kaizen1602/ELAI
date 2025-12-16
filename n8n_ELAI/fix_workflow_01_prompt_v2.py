
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_prompt_v2():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    target_node_name = "AI Agent"
    found = False
    
    for node in nodes:
        if node.get('name') == target_node_name:
            found = True
            
            old_prompt = node['parameters']['text']
            
            # We want to make the "Mental Map" and "ID Mapping" instructions VERY aggressive.
            
            new_instruction = """
## 🧠 MAPA MENTAL DE CITAS (CRÍTICO)
Cuando ejecutes `tool_consultar_citas` y obtengas JSON, **GUARDA LOS IDs EN TU MEMORIA**.
El usuario dirá: "la 1", "la de las 10:30", "la primera".
**TU TRABAJO ES TRADUCIR ESO A UN `slot_id`.**

EJEMPLO DE PENSAMIENTO INTERNO:
1. Yo mostré: "1. 10:30 AM (ID: cmiy...)"
2. Usuario dice: "quiero la de las 10:30"
3. Ah, eso corresponde al ID "cmiy..."
4. EJECUTO `tool_agendar_cita` con agenda_id="cmiy..."

❌ ERROR COMÚN:
No le preguntes al usuario por el ID.
No vuelvas a listar las citas si ya las mostraste y el usuario eligió una.
Si el usuario elige, ¡AGENDA DE INMEDIATO!
"""
            
            # Replace the old "GESTIÓN DE CITAS MOSTRADAS" section or append
            if "## \ud83d\uddd3\ufe0f GESTI\u00d3N DE CITAS MOSTRADAS" in old_prompt:
                # Replace explicitly
                segment_to_replace = """## \ud83d\uddd3\ufe0f GESTI\u00d3N DE CITAS MOSTRADAS
Crea y mant\u00e9n un mapa mental de las citas que le mostraste al usuario:
CITAS_MOSTRADAS = { "1": slot_2950, "2": slot_2951, ... }
Cuando el usuario diga "la 1", buscas en tu mapa el slot_id real."""
                
                # Check if it exists in the string (handling escaping might be tricky)
                # Instead, I will just append the new instruction at the end, which usually overrides previous weak instructions.
                # Or replace the whole Prompt with a constructed one if I was sure of content.
                # Let's try appending/injecting right before the end.
                
                node['parameters']['text'] = old_prompt + "\n\n" + new_instruction
                print("Appended aggressive Mental Map instructions.")
                
            else:
                # Just append
                node['parameters']['text'] = old_prompt + "\n\n" + new_instruction
                print("Appended aggressive Mental Map instructions (section not found to replace).")
                
            break
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched AI Agent Prompt v2 in 01-principal.json")

if __name__ == "__main__":
    fix_workflow_01_prompt_v2()
