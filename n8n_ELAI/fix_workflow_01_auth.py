
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_auth():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # Target node: "Consultar Conversación Pública"
    # Logic: It currently relies on 'public' access but the route is projected.
    # We must add x-webhook-secret header.
    
    target_node_name = "Consultar Conversación Pública"
    found = False
    
    for node in nodes:
        if node.get('name') == target_node_name:
            found = True
            # Check headerParameters
            params = node.get('parameters', {})
            header_params = params.get('headerParameters', {})
            parameters_list = header_params.get('parameters', [])
            
            # Check if secret already exists (unlikely given my analysis)
            has_secret = any(p.get('name') == 'x-webhook-secret' for p in parameters_list)
            
            if not has_secret:
                # Add Secret Header
                parameters_list.append({
                    "name": "x-webhook-secret",
                    "value": "={{ $('CONFIG').first().json.N8N_WEBHOOK_SECRET }}"
                })
                print(f"Added x-webhook-secret header to node: {target_node_name}")
            else:
                print(f"Node {target_node_name} already has secret header.")
                
            # Update notes to reflect it's no longer 'public'
            node['notes'] = "Consulta con Auth"
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched 01-principal.json with authentication.")

if __name__ == "__main__":
    if os.path.exists(FILE_PATH):
        fix_workflow_01_auth()
    else:
        print(f"File not found: {FILE_PATH}")
