
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/06-sub-agendar-cita.json"

def fix_workflow_06_connections_clean():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # We will manually reconstruct the critical connections
    # to ensure they are strictly linear.
    
    connections = data.get('connections', {})
    
    # 1. Trigger -> CONFIG
    connections['When Executed by Another Workflow'] = {
        "main": [
            [
                {
                    "node": "CONFIG",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }
    
    # 2. CONFIG -> Validar Datos
    connections['CONFIG'] = {
        "main": [
            [
                {
                    "node": "Validar Datos",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }
    
    # 3. Validar Datos -> HTTP Verificar Slot
    # (Ensure no other stray connections from Validar Datos if any existed, 
    # though usually it's the *source* that matters)
    connections['Validar Datos'] = {
        "main": [
            [
                {
                    "node": "HTTP Verificar Slot",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }
    
    data['connections'] = connections
    
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully cleaned connections in 06-sub-agendar-cita.json")

if __name__ == "__main__":
    fix_workflow_06_connections_clean()
