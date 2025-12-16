
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/02-sub-validar-paciente.json"

def fix_workflow_02_expressions():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # Target nodes to fix
    target_nodes = ['Crear Nueva Conversación', 'Actualizar Conversación']
    
    # Replacement map
    # We want to replace .item.json. with .first().json.
    # Because n8n expressions are strings like "={{ ... }}"
    
    for node in nodes:
        if node['name'] in target_nodes:
            # Check jsonBody parameter
            params = node.get('parameters', {})
            json_body = params.get('jsonBody', '')
            
            if json_body and '.item.json.' in json_body:
                new_body = json_body.replace('.item.json.', '.first().json.')
                params['jsonBody'] = new_body
                print(f"Fixed expressions in node: {node['name']}")
    
    # Also fix "Respuesta - Conversación Existe" to NOT ignore the update result
    # It currently fetches from 'Consultar Conversación Activa'. 
    # Whatever, fixing the expression in Update is the most critical part. 
    # If Update succeeds, the NEXT turn will be fine. 
    # But for "Respuesta - Conversación Existe", it returns data to the Chat.
    # The Chat does NOT need the updated context immediately, it just needs success msg.
    # The next User Message will trigger 01 again which fetches from DB.
    # So if DB is updated, next turn is fine.
    
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched expressions in 02-sub-validar-paciente.json")

if __name__ == "__main__":
    if os.path.exists(FILE_PATH):
        fix_workflow_02_expressions()
    else:
        print(f"File not found: {FILE_PATH}")
