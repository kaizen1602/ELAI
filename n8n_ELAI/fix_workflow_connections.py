
import json
import os

WORKFLOW_DIR = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI"

# Map of Filename -> Name of the Node that follows CONFIG
NEXT_NODES = {
    "03-sub-crear-conversacion.json": "Preparar Datos",
    "04-sub-clasificar-sintomas.json": "Preparar Prompt Clasificación",
    "05-sub-consultar-citas.json": "Validar y Preparar",
    "06-sub-agendar-cita.json": "Validar Datos",
    "07-sub-listar-citas-activas.json": "Validar Input",
    "08-sub-confirmar-cancelacion.json": "Validar Inputs",
    "09-sub-actualizar-contexto.json": "Preparar Contexto",
    "10-sub-finalizar-conversacion.json": "Validar y Log"
}

def fix_connections(file_path, file_name, next_node_name):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changed = False
    
    # 1. Ensure CONFIG output connects to Next Node
    # Find CONFIG node name (it might be CONFIG or CONFIGURACION or code-node ID)
    config_node_name = None
    for node in data.get('nodes', []):
        if node.get('name') == 'CONFIG':
            config_node_name = 'CONFIG'
            break
    
    if not config_node_name:
        print(f"Skipping {file_name}: No CONFIG node found")
        return

    # Check if Next Node exists
    next_node_exists = False
    for node in data.get('nodes', []):
        if node.get('name') == next_node_name:
            next_node_exists = True
            break
    
    if not next_node_exists:
        print(f"Skipping {file_name}: Next node '{next_node_name}' not found")
        return

    # Update connections
    # We want: ... -> CONFIG -> Next Node
    
    connections = data.get('connections', {})
    
    # Check if CONFIG has output
    if config_node_name not in connections:
        connections[config_node_name] = {}
    
    if "main" not in connections[config_node_name]:
        connections[config_node_name]["main"] = []
    
    # Check if it already connects to next_node_name
    main_outputs = connections[config_node_name]["main"]
    already_connected = False
    if len(main_outputs) > 0:
        for link in main_outputs[0]:
            if link['node'] == next_node_name:
                already_connected = True
                break
    
    if not already_connected:
        # Create connection properly: [ [ {node: ..., type: main, index: 0} ] ]
        # Ensure array structure exists for output 0
        while len(main_outputs) < 1:
            main_outputs.append([])
            
        main_outputs[0].append({
            "node": next_node_name,
            "type": "main",
            "index": 0
        })
        changed = True
        print(f"Fixed {file_name}: Connected CONFIG -> {next_node_name}")

    if changed:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    else:
        print(f"No changes needed for {file_name}")

def main():
    for file_name, next_node in NEXT_NODES.items():
        file_path = os.path.join(WORKFLOW_DIR, file_name)
        if os.path.exists(file_path):
            fix_connections(file_path, file_name, next_node)
        else:
            print(f"File not found: {file_name}")

if __name__ == "__main__":
    main()
