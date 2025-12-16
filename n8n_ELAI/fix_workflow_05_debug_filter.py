import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/05-sub-consultar-citas.json"

def fix_workflow_05_debug_filter():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "Formatear Citas":
            print("Found Formatear Citas node. Adding debug logging...")
            
            # Get current code
            old_code = node['parameters']['functionCode']
            
            # Add console.log before the filter to see ALL slots
            new_code = old_code.replace(
                '.filter((c) => c.disponible === true && c.slot_id);',
                '''.filter((c) => {
    console.log('🔍 Slot:', c.slot_id, 'Estado:', c.disponible ? 'DISPONIBLE' : 'NO DISPONIBLE', 'Hora:', c.hora);
    return c.disponible === true && c.slot_id;
  });'''
            )
            
            node['parameters']['functionCode'] = new_code
            print("Added debug logging to filter")

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 05-sub-consultar-citas.json with debug logging")

if __name__ == "__main__":
    fix_workflow_05_debug_filter()
