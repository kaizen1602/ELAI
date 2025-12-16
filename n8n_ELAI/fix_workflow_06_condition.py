
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/06-sub-agendar-cita.json"

def fix_workflow_06_condition():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    target_node_name = "¿Slot Disponible?"
    found = False
    
    for node in nodes:
        if node.get('name') == target_node_name:
            found = True
            params = node.get('parameters', {})
            conditions_wrapper = params.get('conditions', {})
            conditions_list = conditions_wrapper.get('conditions', [])
            
            # Update condition
            # Old: $json.disponible === true
            # New: $json.data.estado === 'DISPONIBLE'
            
            updated = False
            for cond in conditions_list:
                if cond.get('id') == 'slot-disponible':
                    # We change the left value and the operator/right value to match string 'DISPONIBLE'
                    cond['leftValue'] = "={{ $json.data && $json.data.estado }}"
                    cond['rightValue'] = "DISPONIBLE"
                    cond['operator']['type'] = "string"
                    updated = True
                    print("Updated condition to check $json.data.estado === 'DISPONIBLE'")
            
            if not updated:
                # If structure is different, just rewrite the list
                conditions_list.clear()
                conditions_list.append({
                    "id": "slot-disponible",
                    "leftValue": "={{ $json.data && $json.data.estado }}",
                    "rightValue": "DISPONIBLE",
                    "operator": {
                        "type": "string",
                        "operation": "equals"
                    }
                })
                print("Recreated condition list.")

            break
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched IF condition in 06-sub-agendar-cita.json")

if __name__ == "__main__":
    fix_workflow_06_condition()
