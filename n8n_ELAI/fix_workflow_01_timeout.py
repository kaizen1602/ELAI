import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_timeout_and_context():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # 1. Increase timeout for "Consultar Conversación Pública"
    for node in nodes:
        if node.get('name') == "Consultar Conversación Pública":
            print("Found Consultar Conversación node. Increasing timeout...")
            if 'parameters' in node and 'options' in node['parameters']:
                if 'response' not in node['parameters']['options']:
                    node['parameters']['options']['response'] = {}
                if 'response' not in node['parameters']['options']['response']:
                    node['parameters']['options']['response']['response'] = {}
                
                # Increase timeout to 30 seconds
                node['parameters']['options']['timeout'] = 30000
                print("Timeout increased to 30000ms")
    
    # 2. Update "Preparar Contexto" to handle errors better
    for node in nodes:
        if node.get('name') == "Preparar Contexto":
            print("Found Preparar Contexto node. Improving error handling...")
            
            # Add better error handling at the start
            old_code = node['parameters']['functionCode']
            
            # Add a check to see if we got an error response
            new_start = """// ===== PREPARAR CONTEXTO UNIFICADO PARA EL AI AGENT (MEJORADO) =====

const datosWhatsApp = $('Extraer Datos').first().json;
const respuestaConversacion = $json;

console.log('=== PREPARAR CONTEXTO ===');
console.log('Datos WhatsApp:', JSON.stringify(datosWhatsApp, null, 2));
console.log('Respuesta Conversación:', JSON.stringify(respuestaConversacion, null, 2));

// Incializar contexto base"""
            
            if old_code.startswith("// ===== PREPARAR CONTEXTO"):
                # Replace the start to add the console.log for response
                parts = old_code.split("// Incializar contexto base")
                if len(parts) == 2:
                    node['parameters']['functionCode'] = new_start + parts[1]
                    print("Added debug logging for conversation response")
    
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 01-principal.json")

if __name__ == "__main__":
    fix_workflow_01_timeout_and_context()
