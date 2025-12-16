
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/06-sub-agendar-cita.json"

def fix_workflow_06_debug_msg():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # 1. Update Validar Datos to trim and pass input even on error for debugging
    for node in nodes:
        if node.get('name') == "Validar Datos":
            print("Updating Validar Datos...")
            node['parameters']['functionCode'] = """// ===== VALIDAR DATOS Y AGENDA_ID =====

const slotId = ($json.agenda_id || '').trim(); 
const pacienteId = ($json.paciente_id || '').trim();
const motivoConsulta = $json.motivo_consulta || "Consulta programada";
const sessionId = $json.session_id;
const token = $json.token;

console.log('🔍 N8N Validar Input:', { slotId, pacienteId, motivoConsulta, sessionId, token });

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
    return { json: { ...output, success: false, error: 'ID de cita (slot_id) VACÍO o nulo.' } };
}
if (!pacienteId) {
    return { json: { ...output, success: false, error: 'ID de paciente inválido.' } };
}
if (!token) {
    // Relaxed consistency: Log warning but proceed if possible? No, backend needs token.
    return { json: { ...output, success: false, error: 'Token no disponible.' } };
}

return { json: { ...output, success: true } };"""

    # 2. Update Slot No Disponible message to include ID
    for node in nodes:
        if node.get('name') == "Slot No Disponible":
            print("Updating Slot No Disponible message...")
            assignments = node['parameters'].get('assignments', {}).get('assignments', [])
            for assignment in assignments:
                if assignment['name'] == 'mensaje':
                    # Append debug info
                    assignment['value'] = "El horario seleccionado no está disponible (ID Recibido: {{ $('Validar Datos').first().json.debug_input_slot || 'NULO' }})."

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully injected debug messages into 06-sub-agendar-cita.json")

if __name__ == "__main__":
    fix_workflow_06_debug_msg()
