
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/05-sub-consultar-citas.json"

def fix_workflow_05_format():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    target_node_name = "Formatear Citas"
    found = False
    
    for node in nodes:
        if node.get('name') == target_node_name:
            found = True
            
            # New Code logic to handle the specific backend structure
            new_code = """// ===== FORMATEAR CITAS =====

const response = $json;
const page = Number($('Validar y Preparar').first().json.page || 1);
const pageSize = 10;

// Extraer arreglo de data wrapper
let citasArray = [];
if (response.citas && Array.isArray(response.citas)) citasArray = response.citas;
else if (response.data && Array.isArray(response.data)) citasArray = response.data;
else if (Array.isArray(response)) citasArray = response;

// Helper para formato de fecha
const formatFecha = (fechaStr, horaStr) => {
    try {
        const d = new Date(fechaStr);
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const diaNombre = dias[d.getDay()];
        const mesNombre = meses[d.getMonth()];
        const diaNum = d.getDate();
        
        return `${diaNombre} ${diaNum} ${mesNombre}`;
    } catch(e) { return fechaStr; }
};

// Mapear normalizadas
const normalizadas = citasArray
  .map((cita) => {
    // Traverse nested structure safely
    const agenda = cita.agenda || {};
    const medicoInfo = agenda.medico || {};
    const userInfo = medicoInfo.user || {};
    const espInfo = medicoInfo.especialidad || {};
    
    const medicoNombre = userInfo.username || cita.medico_nombre || "Dr. Asignado";
    const especialidad = espInfo.nombre || cita.especialidad_nombre || "General";
    
    const fechaFmt = formatFecha(cita.fecha, cita.horaInicio);
    const horaFmt = cita.horaInicio || "00:00";
    
    const display = `🗓️ ${fechaFmt} - ⏰ ${horaFmt} | 👨‍⚕️ ${medicoNombre}`;

    return {
        slot_id: cita.id,
        fecha: fechaFmt,
        hora: horaFmt,
        medico: medicoNombre,
        especialidad: especialidad,
        display_text: display, // Campo amigable para el bot
        disponible: cita.estado === 'DISPONIBLE'
    };
  })
  .filter((c) => c.disponible === true && c.slot_id);

const total = normalizadas.length;
const start = (page - 1) * pageSize;
const pagina = normalizadas.slice(start, start + pageSize);

return { 
    json: { 
        success: true, 
        citas: pagina, 
        total_citas: total, 
        page, 
        has_more: (start + pageSize) < total 
    } 
};"""
            
            node['parameters']['functionCode'] = new_code
            print("Updated functionCode in Formatear Citas node.")
            break
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched Formatear Citas in 05-sub-consultar-citas.json")

if __name__ == "__main__":
    fix_workflow_05_format()
