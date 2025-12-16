
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_relax_constraints():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "tool_agendar_cita":
            print("Found tool_agendar_cita. Relaxing constraints...")
            desc = node['parameters'].get('description', '')
            # Remove the strict condition
            # Old: "...EXECUTE silently. IMPORTANT: Only execute if paciente_id and token are not null."
            # New: "...EXECUTE silently."
            
            new_desc = desc.replace(
                "IMPORTANT: Only execute if paciente_id and token are not null.",
                "Safe to execute."
            )
            node['parameters']['description'] = new_desc

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully relaxed tool constraints in 01-principal.json")

if __name__ == "__main__":
    fix_workflow_01_relax_constraints()
