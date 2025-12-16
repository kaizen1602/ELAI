import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/06-sub-agendar-cita.json"

def add_debug_to_formatear_respuesta():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "Formatear Respuesta":
            print("Found Formatear Respuesta node. Adding debug logging...")
            
            old_code = node['parameters']['functionCode']
            
            # Add console.log at the very beginning to see what we received
            new_code = """// ===== FORMATEAR RESPUESTA =====
const response = $json;
const data = response.data ? response.data : response;

console.log('🔍 [Formatear Respuesta] Raw response:', JSON.stringify(response, null, 2));
console.log('🔍 [Formatear Respuesta] Extracted data:', JSON.stringify(data, null, 2));
console.log('🔍 [Formatear Respuesta] Has error?', !!response.error);

if (response.error || !data) {
     console.error('❌ [Formatear Respuesta] ERROR DETECTED:', response.error);
     return {
        json: {
            success: false,
            mensaje: response.error?.message || 'Error al agendar',
            error_tipo: 'backend_error'
        }
    };
}

console.log('✅ [Formatear Respuesta] Success! Cita ID:', data.id);
return {
    json: {
        success: true,
        cita_id: data.id,
        mensaje: 'Cita agendada exitosamente',
        detalles: data
    }
};"""
            
            node['parameters']['functionCode'] = new_code
            print("Added comprehensive debug logging")

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 06-sub-agendar-cita.json")

if __name__ == "__main__":
    add_debug_to_formatear_respuesta()
