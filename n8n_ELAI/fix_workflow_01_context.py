
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_context():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # Target node: "Preparar Contexto"
    target_node_name = "Preparar Contexto"
    
    for node in nodes:
        if node.get('name') == target_node_name:
            # We need to replace the functionCode
            # Old logic: if (data.id && data.token) ...
            # New logic: if (data.id && (data.pacienteId || data.paciente_id)) ...
            
            # Since manipulating the string directly inside Python is risky if I don't have the full string, 
            # I will replace the ENTIRE functionCode with the corrected version based on my previous "view_file".
            
            new_code = r"""// ===== PREPARAR CONTEXTO UNIFICADO PARA EL AI AGENT (MEJORADO) =====

const datosWhatsApp = $('Extraer Datos').first().json;
const respuestaConversacion = $json;

console.log('=== PREPARAR CONTEXTO ===');
console.log('Datos WhatsApp:', JSON.stringify(datosWhatsApp, null, 2));

// Incializar contexto base
let contexto = {
    session_id: datosWhatsApp.session_id,
    message_text: datosWhatsApp.message_text,
    contact_name: datosWhatsApp.contact_name,
    message_type: datosWhatsApp.message_type,
    timestamp: datosWhatsApp.timestamp,
    token: null,
    paciente_id: null,
    paciente_nombre: null,
    entidad_medica_id: null,
    conversacion_id: null,
    tiene_token: false,
    es_usuario_nuevo: true,
    conversacion_activa: false
};

// Si la respuesta tiene error, asumimos usuario nuevo
if (respuestaConversacion.error) {
    console.log('ℹ️ No hay conversación activa o error:', respuestaConversacion.error);
    return { json: contexto };
}

// Extraer data del wrapper { success: true, data: { ... } }
// O si viene plano (legacy), manejar ambos
const data = respuestaConversacion.data ? respuestaConversacion.data : respuestaConversacion;

// LOGIC UPDATE: Check for ID and PatientID. Token is optional or derived.
const pacienteId = data.pacienteId || data.paciente_id || (data.paciente && data.paciente.id);

if (data.id && pacienteId) {
    // Si hay pacienteId, asumimos que tiene "token" (sesión válida)
    contexto.token = data.token || "legacy-token-placeholder"; 
    
    // USAR IDs COMO STRINGS (CUIDs) - NO CONVERTIR A NUMBER
    contexto.paciente_id = pacienteId;
    contexto.entidad_medica_id = data.entidadMedicaId || data.entidad_medica_id || (data.paciente && data.paciente.entidadMedicaId);
    contexto.conversacion_id = data.id;
    
    contexto.paciente_nombre = data.paciente_nombre || (data.paciente && data.paciente.nombres) || datosWhatsApp.contact_name;
    contexto.tiene_token = true;
    contexto.es_usuario_nuevo = false;
    contexto.conversacion_activa = true;
    contexto.conversacion_estado = data.estado;
    contexto.conversacion_contexto = data.contexto || {};
    
    console.log('✅ Conversación activa encontrada');
    console.log('🔑 Token:', contexto.token);
    console.log('👤 Paciente ID:', contexto.paciente_id);
} else {
    console.log('⚠️ Data incompleta para sesión activa:', { id: data.id, pacienteId });
}

return { json: contexto };"""

            node['parameters']['functionCode'] = new_code
            print(f"Updated functionCode for node: {target_node_name}")
            break
            
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched logic in 01-principal.json")

if __name__ == "__main__":
    if os.path.exists(FILE_PATH):
        fix_workflow_01_context()
    else:
        print(f"File not found: {FILE_PATH}")
