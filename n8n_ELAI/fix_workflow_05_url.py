
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/05-sub-consultar-citas.json"

def fix_workflow_05_url():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    target_node_name = "HTTP Request Consultar Citas"
    found = False
    
    for node in nodes:
        if node.get('name') == target_node_name:
            found = True
            params = node.get('parameters', {})
            
            # 1. Update URL
            # Old: .../api/v1/citas/disponibles/?...
            # New: .../api/v1/slots/available-bot/?...
            
            current_url = params.get('url', "")
            if "api/v1/citas/disponibles" in current_url:
                new_url = current_url.replace("api/v1/citas/disponibles", "api/v1/slots/available-bot")
                params['url'] = new_url
                print(f"Updated URL to: {new_url}")
            elif "api/v1/slots/available-bot" in current_url:
                print("URL already updated.")
            else:
                # Force update if it doesn't match expected pattern but needs fixing
                print(f"Warning: Unexpected URL pattern: {current_url}")
                new_url = "={{ $('CONFIG').first().json.BACKEND_NGROK_URL }}/api/v1/slots/available-bot/?categoria={{ $json.categoria }}&entidad_medica_id={{ $json.entidad_medica_id }}"
                params['url'] = new_url
                print(f"Forced URL update to: {new_url}")

            # 2. Add x-webhook-secret header
            header_params = params.get('headerParameters', {})
            parameters_list = header_params.get('parameters', [])
            
            # Remove Authorization (Bearer) as we are switching to Secret?
            # Actually, keeping it doesn't hurt, but the new route checks Secret.
            # Let's ADD the secret.
            
            has_secret = any(p.get('name') == 'x-webhook-secret' for p in parameters_list)
            
            if not has_secret:
                parameters_list.append({
                    "name": "x-webhook-secret",
                    "value": "={{ $('CONFIG').first().json.N8N_WEBHOOK_SECRET }}"
                })
                print("Added x-webhook-secret header.")
            else:
                print("x-webhook-secret header already exists.")
            
            break
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched 05-sub-consultar-citas.json")

if __name__ == "__main__":
    fix_workflow_05_url()
