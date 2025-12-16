
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_prompt_realism():
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
            
            # 1. Replace the misleading example
            # Old: CITAS_MOSTRADAS = { "1": slot_2950, "2": slot_2951, ... }
            # New: CITAS_MOSTRADAS = { "1": "ck82...", "2": "cl93...", ... }
            
            new_prompt = old_prompt.replace(
                'CITAS_MOSTRADAS = { "1": slot_2950, "2": slot_2951, ... }',
                'CITAS_MOSTRADAS = { "1": "cmiyv55bl0021uv2goya48q4j", "2": "cl93nsjf0001b6gl3g4pet2k", ... }'
            ).replace(
                'Cuando el usuario diga "la 1", buscas en tu mapa el slot_id real.',
                'Cuando el usuario diga "la 1", buscas en tu mapa el slot_id real (ej: "cmiyv...").\n⚠️ IMPORTANTE: Los IDs son cadenas complejas (CUID). JAMAS inventes IDs como "slot_1" o "1". Usa SIEMPRE el ID exacto que recibiste de la herramienta.'
            )
            
            node['parameters']['text'] = new_prompt
            print("Patched AI Prompt with realistic CUID examples.")
            break
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched 01-principal.json")

if __name__ == "__main__":
    fix_workflow_01_prompt_realism()
