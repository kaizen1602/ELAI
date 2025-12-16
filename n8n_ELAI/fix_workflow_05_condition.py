
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/05-sub-consultar-citas.json"

def fix_workflow_05_condition():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    target_node_name = "¿Hay Citas Disponibles?"
    found = False
    
    for node in nodes:
        if node.get('name') == target_node_name:
            found = True
            params = node.get('parameters', {})
            conditions_wrapper = params.get('conditions', {})
            conditions_list = conditions_wrapper.get('conditions', [])
            
            # Since the structure is a bit nested, let's look for the specific condition
            # The structure in previous view_file was:
            # "conditions": [ { "id": "has-results", "leftValue": "...", ... } ]
            
            for cond in conditions_list:
                if cond.get('id') == 'has-results':
                    old_value = cond.get('leftValue', '')
                    # We want to add check for $json.data
                    # Original: "={{ ($json.citas && $json.citas.length > 0) || ($json.results && $json.results.length > 0) || (Array.isArray($json) && $json.length > 0) }}"
                    
                    if "$json.data" not in old_value:
                        # Insert check for $json.data at the beginning
                        # We strip the initial "={{ " and the trailing " }}" to edit the expression
                        expression = old_value.replace("={{", "").replace("}}", "").strip()
                        
                        new_expression = f"={{ ($json.data && $json.data.length > 0) || {expression} }}"
                        cond['leftValue'] = new_expression
                        print(f"Updated condition to: {new_expression}")
                    else:
                        print("Condition already checks for $json.data")
            
            break
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched IF condition in 05-sub-consultar-citas.json")

if __name__ == "__main__":
    fix_workflow_05_condition()
