
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_defaults():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # We want to find mappings like:
    # "={{ $('Preparar Contexto').item.json.token }}"
    # And change them to:
    # "={{ $('Preparar Contexto').item.json.token || '' }}"
    
    # We will look recursively or just target specific known tools.
    # Targeted tools: 
    # tool_validar_paciente (session_id)
    # tool_clasificar_sintomas (paciente_id)
    # tool_consultar_citas (entidad_medica_id, token)
    # tool_agendar_cita (paciente_id, session_id, token)
    # tool_cancelar_cita (paciente_id, token)
    # tool_confirmar_cancelacion (paciente_id, token)
    
    target_tools = [
        "tool_validar_paciente",
        "tool_clasificar_sintomas", 
        "tool_consultar_citas",
        "tool_agendar_cita",
        "tool_cancelar_cita",
        "tool_confirmar_cancelacion"
    ]
    
    count = 0
    
    for node in nodes:
        if node.get('name') in target_tools:
            params = node.get('parameters', {})
            wf_inputs = params.get('workflowInputs', {})
            values = wf_inputs.get('value', {})
            
            for key, val in values.items():
                if isinstance(val, str) and "$('Preparar Contexto').item.json" in val:
                    if "|| ''" not in val and '|| ""' not in val:
                        # Append || '' before the closing brackets
                        if val.endswith("}}"):
                            # "={{ ... }}" -> "={{ ... || '' }}"
                            new_val = val[:-2] + " || '' }}"
                            values[key] = new_val
                            count += 1
                            print(f"Updated {node.get('name')}.{key}")

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"Successfully added defaults to {count} inputs in 01-principal.json")

if __name__ == "__main__":
    fix_workflow_01_defaults()
