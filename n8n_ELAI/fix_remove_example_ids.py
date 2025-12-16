import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def remove_example_ids_from_prompt():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "AI Agent":
            print("Found AI Agent. Removing example IDs from prompt...")
            prompt = node['parameters']['text']
            
            # Replace all instances of the example ID with a generic placeholder
            prompt = prompt.replace('cl93nsjf0001b6gl3g4pet2k', '<SLOT_ID_DE_LA_POSICION_2>')
            prompt = prompt.replace('cmiyv55bl0021uv2goya48q4j', '<SLOT_ID_DE_LA_POSICION_1>')
            prompt = prompt.replace('cmiy...', '<CUID_COMPLETO>')
            prompt = prompt.replace('ck82abc123xyz', '<SLOT_ID_DE_LA_POSICION_3>')
            
            node['parameters']['text'] = prompt
            print("Removed all example IDs from prompt")

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 01-principal.json")

if __name__ == "__main__":
    remove_example_ids_from_prompt()
