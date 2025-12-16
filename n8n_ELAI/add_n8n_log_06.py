
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/06-sub-agendar-cita.json"

def add_n8n_log_06():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "Validar Datos":
            # Inject console.log to print inputs
            code = node['parameters']['functionCode']
            
            log_line = "\nconsole.log('🔍 N8N Validar Input:', { slotId, pacienteId, motivoConsulta, sessionId, token });"
            
            if "console.log('🔍 N8N Validar Input" not in code:
                # Add before "if (!slotId)" checks
                insert_point = "if (!slotId) {"
                if insert_point in code:
                    new_code = code.replace(insert_point, log_line + "\n" + insert_point)
                    node['parameters']['functionCode'] = new_code
                    print("Added console.log to Validar Datos in 06")

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched 06-sub-agendar-cita.json with debug logs")

if __name__ == "__main__":
    add_n8n_log_06()
