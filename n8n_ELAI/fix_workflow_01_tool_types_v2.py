
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_01_tool_types():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    count = 0
    for node in nodes:
        node_name = node.get('name')
        
        # FIX 1: tool_agendar_cita (agenda_id)
        if node_name == "tool_agendar_cita":
            params = node.get('parameters', {})
            wf_inputs = params.get('workflowInputs', {})
            
            # Update conversion expression
            val_obj = wf_inputs.get('value', {})
            if "agenda_id" in val_obj:
                # Old: "={{ $fromAI('agenda_id', '', 'number') }}"
                # New: "={{ $fromAI('agenda_id', '', 'string') }}"
                val_obj['agenda_id'] = "={{ $fromAI('agenda_id', '', 'string') }}"
            
            # Update schema
            schema = wf_inputs.get('schema', [])
            for field in schema:
                if field.get('id') == "agenda_id":
                    field['type'] = "string"
                    print("Updated tool_agendar_cita: agenda_id -> string")
                    count += 1
        
        # FIX 2: tool_confirmar_cancelacion (cita_id)
        if node_name == "tool_confirmar_cancelacion":
            params = node.get('parameters', {})
            wf_inputs = params.get('workflowInputs', {})
            
            # Update conversion expression
            val_obj = wf_inputs.get('value', {})
            if "cita_id" in val_obj:
                # Old: "={{ $fromAI('cita_id', '', 'number') }}"
                # New: "={{ $fromAI('cita_id', '', 'string') }}"
                val_obj['cita_id'] = "={{ $fromAI('cita_id', '', 'string') }}"
            
            # Update schema
            schema = wf_inputs.get('schema', [])
            for field in schema:
                if field.get('id') == "cita_id":
                    field['type'] = "string"
                    print("Updated tool_confirmar_cancelacion: cita_id -> string")
                    count += 1

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"Successfully patched {count} tool types in 01-principal.json")

if __name__ == "__main__":
    fix_01_tool_types()
