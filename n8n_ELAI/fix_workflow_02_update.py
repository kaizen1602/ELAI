
import json
import os
import copy

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/02-sub-validar-paciente.json"

def fix_workflow_02():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    connections = data.get('connections', {})

    # 1. Find the "Crear Nueva Conversación" node to clone it
    create_node = next((n for n in nodes if n['name'] == 'Crear Nueva Conversación'), None)
    if not create_node:
        print("Error: Could not find 'Crear Nueva Conversación' node")
        return

    # 2. Check if "Actualizar Conversación" already exists
    if any(n['name'] == 'Actualizar Conversación' for n in nodes):
        print("Warning: 'Actualizar Conversación' node already exists. Skipping.")
        return

    # 3. Create "Actualizar Conversación" node
    update_node = copy.deepcopy(create_node)
    update_node['id'] = 'actualizar-conversacion'
    update_node['name'] = 'Actualizar Conversación'
    update_node['position'] = [880, 100] # Adjust position to fit in the diagram (parallel to logic)
    
    # Update notes or description if needed (optional)
    
    nodes.append(update_node)

    # 4. Rewire Connections
    # We want: "¿Conversación Existe?" (True/0) -> "Actualizar Conversación" -> "Respuesta - Conversación Existe"
    
    if_node_name = "¿Conversación Existe?"
    response_node_name = "Respuesta - Conversación Existe"
    
    # Verify connections exist
    if if_node_name not in connections:
        print(f"Error: {if_node_name} has no connections")
        return

    main_outputs = connections[if_node_name]["main"]
    # Logic: Index 0 is True
    if len(main_outputs) > 0:
        # Re-route Index 0
        main_outputs[0] = [
            {
                "node": "Actualizar Conversación",
                "type": "main",
                "index": 0
            }
        ]
        print(f"Rewired {if_node_name} (True) -> Actualizar Conversación")
    else:
        print("Error: unexpected connection structure for If node")
        return

    # Connect "Actualizar Conversación" -> "Respuesta - Conversación Existe"
    connections["Actualizar Conversación"] = {
        "main": [
            [
                {
                    "node": "Respuesta - Conversación Existe",
                    "type": "main",
                    "index": 0
                }
            ]
        ]
    }
    print(f"Connected Actualizar Conversación -> {response_node_name}")
    
    # 5. Save
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched 02-sub-validar-paciente.json")

if __name__ == "__main__":
    if os.path.exists(FILE_PATH):
        fix_workflow_02()
    else:
        print(f"File not found: {FILE_PATH}")
