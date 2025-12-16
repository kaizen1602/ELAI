import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/06-sub-agendar-cita.json"

def add_explicit_debug_to_validar():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "Validar Datos":
            print("Found Validar Datos node. Adding EXPLICIT debug...")
            
            old_code = node['parameters']['functionCode']
            
            # Add SUPER explicit logging at the very start
            new_code = """// ===== VALIDAR DATOS Y AGENDA_ID =====

console.log('🔍🔍🔍 RAW INPUT TO VALIDAR DATOS:', JSON.stringify($json, null, 2));
console.log('🔍 agenda_id value:', $json.agenda_id);
console.log('🔍 agenda_id type:', typeof $json.agenda_id);

const slotId = ($json.agenda_id || '').trim(); 
const pacienteId = ($json.paciente_id || '').trim();
const motivoConsulta = $json.motivo_consulta || "Consulta programada";
const sessionId = $json.session_id;
const token = $json.token;

console.log('🔍 N8N Validar Input:', { slotId, pacienteId, motivoConsulta, sessionId, token });

// Check if we got the DEBUG fallback value
if (slotId === 'DEBUG_NO_SLOT_ID_PROVIDED') {
    console.error('❌❌❌ AI DID NOT PROVIDE slot_id! Using fallback value!');
    return { json: { 
        success: false, 
        error: 'AI no envió slot_id. La herramienta fue llamada sin el parámetro requerido.',
        debug_input_slot: $json.agenda_id,
        paciente_id: pacienteId,
        slot: slotId,
        motivo_consulta: motivoConsulta,
        telefono: sessionId,
        token: token
    }};
}

// Pasamos los datos "raw" para debug incluso si fallan (pero marcamos error)
const output = {
    paciente_id: pacienteId,
    slot: slotId,
    motivo_consulta: motivoConsulta,
    telefono: sessionId,
    token: token,
    debug_input_slot: $json.agenda_id // Lo que vino realmente
};

if (!slotId) {
    console.error('❌ slotId is EMPTY');
    return { json: { ...output, success: false, error: 'ID de cita (slot_id) VACÍO o nulo. Debes usar el slot_id exacto de las citas disponibles.' } };
}

// VALIDAR FORMATO CUID - Los CUIDs tienen 25 caracteres y empiezan con 'c'
const esCUID = slotId.length >= 20 && slotId.startsWith('c');
const esNumerico = /^\\d+$/.test(slotId);

if (!esCUID && !esNumerico) {
    console.error('❌ slotId format is INVALID:', slotId);
    return { json: { ...output, success: false, error: 'El slot_id "' + slotId + '" NO es válido. DEBES usar el slot_id exacto (ej: cmiyv55bl0021uv2goya48q4j) que recibiste de tool_consultar_citas. NO inventes IDs ni uses horarios como ID.' } };
}

if (!pacienteId) {
    console.error('❌ pacienteId is EMPTY');
    return { json: { ...output, success: false, error: 'ID de paciente inválido.' } };
}
if (!token) {
    console.error('❌ token is EMPTY');
    return { json: { ...output, success: false, error: 'Token no disponible.' } };
}

console.log('✅ Validation passed! Proceeding with slot:', slotId);
return { json: { ...output, success: true } };"""
            
            node['parameters']['functionCode'] = new_code
            print("Added SUPER explicit debug logging")

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 06-sub-agendar-cita.json with explicit debug")

if __name__ == "__main__":
    add_explicit_debug_to_validar()
