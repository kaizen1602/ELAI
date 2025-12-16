
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/06-sub-agendar-cita.json"

def fix_workflow_06_body():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    target_node_name = "HTTP Request Agendar Cita"
    found = False
    
    for node in nodes:
        if node.get('name') == target_node_name:
            found = True
            params = node.get('parameters', {})
            body_params = params.get('bodyParameters', {})
            parameters_list = body_params.get('parameters', [])
            
            # Map of old names to new names
            # N8N uses "name" field for the key
            # We want:
            # paciente -> pacienteId
            # slot -> slotId
            # motivo_consulta -> motivoConsulta
            # telefono -> (Backend doesn't seem to use it in Schema, but maybe controller uses it? 
            # Controller uses createCitaSchema which has NO telefono. So it's ignored or useful for external logs?)
            # createCitaSchema: slotId, pacienteId, motivoConsulta, sintomas, notas
            
            for param in parameters_list:
                if param.get('name') == 'paciente':
                    param['name'] = 'pacienteId'
                    print("Renamed 'paciente' to 'pacienteId'")
                elif param.get('name') == 'slot':
                    param['name'] = 'slotId'
                    print("Renamed 'slot' to 'slotId'")
                elif param.get('name') == 'motivo_consulta':
                    param['name'] = 'motivoConsulta'
                    print("Renamed 'motivo_consulta' to 'motivoConsulta'")
            
            break
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched body parameters in 06-sub-agendar-cita.json")

if __name__ == "__main__":
    fix_workflow_06_body()
