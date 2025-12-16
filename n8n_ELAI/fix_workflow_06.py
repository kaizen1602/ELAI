
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/06-sub-agendar-cita.json"

def fix_workflow_06():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # 1. Update "HTTP Verificar Slot"
    # URL: /api/v1/slots/{{slot}}/  ->  /api/v1/slots/{{slot}}/bot
    # Headers: Add Secret
    
    for node in nodes:
        if node.get('name') == "HTTP Verificar Slot":
            params = node.get('parameters', {})
            current_url = params.get('url', "")
            
            if "/bot" not in current_url:
                # Append /bot just before query params or end
                # Actually, the current url is .../slots/{{...}}/
                # It likely ends with slash.
                if current_url.endswith("/"):
                    new_url = current_url[:-1] + "/bot"
                else:
                    new_url = current_url + "/bot"
                
                params['url'] = new_url
                print(f"Updated Verify URL to: {new_url}")

            # Add Secret Header
            header_params = params.get('headerParameters', {})
            parameters_list = header_params.get('parameters', [])
            has_secret = any(p.get('name') == 'x-webhook-secret' for p in parameters_list)
            
            if not has_secret:
                parameters_list.append({
                    "name": "x-webhook-secret",
                    "value": "={{ $('CONFIG').first().json.N8N_WEBHOOK_SECRET }}"
                })
                print("Added secret to Verify Slot")

        # 2. Update "HTTP Request Agendar Cita"
        # URL: /api/v1/citas/ -> /api/v1/citas/create
        # Headers: Add Secret
        
        if node.get('name') == "HTTP Request Agendar Cita":
            params = node.get('parameters', {})
            current_url = params.get('url', "")
            
            if "citas/" in current_url and "create" not in current_url:
                # Replace trailing slash if exist
                clean_url = current_url.rstrip("/")
                new_url = clean_url + "/create"
                params['url'] = new_url
                print(f"Updated Book URL to: {new_url}")

            # Add Secret Header
            header_params = params.get('headerParameters', {})
            parameters_list = header_params.get('parameters', [])
            has_secret = any(p.get('name') == 'x-webhook-secret' for p in parameters_list)
            
            if not has_secret:
                parameters_list.append({
                    "name": "x-webhook-secret",
                    "value": "={{ $('CONFIG').first().json.N8N_WEBHOOK_SECRET }}"
                })
                print("Added secret to Book Cita")

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched 06-sub-agendar-cita.json")

if __name__ == "__main__":
    fix_workflow_06()
