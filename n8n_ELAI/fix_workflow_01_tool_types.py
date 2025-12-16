
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_tool_types():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # Fields that must be STRING (CUIDs) but are currently NUMBER
    target_fields = ['paciente_id', 'entidad_medica_id']
    
    count = 0
    for node in nodes:
        if node.get('type') == '@n8n/n8n-nodes-langchain.toolWorkflow':
            print(f"Checking node: {node.get('name')}")
            
            # Check workflowInputs schema
            params = node.get('parameters', {})
            workflow_inputs = params.get('workflowInputs', {})
            schema = workflow_inputs.get('schema', [])
            
            for field in schema:
                if field.get('id') in target_fields:
                    if field.get('type') == 'number':
                        field['type'] = 'string'
                        print(f"  -> Fixed '{field.get('id')}' type: number -> string")
                        count += 1
                        
    if count == 0:
        print("No incorrect types found or already fixed.")
    else:
        with open(FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully fixed {count} schema types in 01-principal.json")

if __name__ == "__main__":
    if os.path.exists(FILE_PATH):
        fix_workflow_01_tool_types()
    else:
        print(f"File not found: {FILE_PATH}")
