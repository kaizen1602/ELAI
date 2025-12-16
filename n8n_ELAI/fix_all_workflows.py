
import json
import os

WORKFLOW_DIR = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI"

# 1. Standard CONFIG Code
CONFIG_CODE = r"""// ===== CONFIGURACIÓN CENTRALIZADA =====
// ⚠️ EDITAR AQUÍ cuando cambien URLs o valores

// Si hay input previo (trigger -> extraer datos), lo tomamos. Si no, objeto vacio.
let datosExtraidos = {};
try {
    datosExtraidos = $input.first().json;
} catch(e) {}

const CONFIG = {
  // Backend - ⚠️ CAMBIAR ESTA URL cada vez que reinicies ngrok
  BACKEND_NGROK_URL: "https://5e3708b60e02.ngrok-free.app",

  // Ngrok headers (no cambiar)
  NGROK_HEADER_NAME: "ngrok-skip-browser-warning",
  NGROK_HEADER_VALUE: "true",

  // Secreto Webhook
  N8N_WEBHOOK_SECRET: "TuSecretoSuperSeguro123",

  // Contacto de la clínica
  TELEFONO_CLINICA: "(601) 123-4567"
};

// Limpiar URL por espacios extra
if (CONFIG.BACKEND_NGROK_URL) CONFIG.BACKEND_NGROK_URL = CONFIG.BACKEND_NGROK_URL.trim();

console.log('=== CONFIG CARGADA ===');
console.log('BACKEND_NGROK_URL:', CONFIG.BACKEND_NGROK_URL);

// Pasar CONFIG + datos anteriores
return {
  json: {
    ...CONFIG,
    ...datosExtraidos
  }
};
"""

# 2. Specific Node Fixes (JS Code)
NODE_FIXES = {
    "01-principal.json": {
        "Preparar Contexto": r"""// ===== PREPARAR CONTEXTO UNIFICADO PARA EL AI AGENT (MEJORADO) =====

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

if (data.id && data.token) {
    contexto.token = data.token;
    
    // USAR IDs COMO STRINGS (CUIDs) - NO CONVERTIR A NUMBER
    contexto.paciente_id = data.pacienteId || data.paciente_id; // CamelCase en backend nuevo
    contexto.entidad_medica_id = data.entidadMedicaId || data.entidad_medica_id;
    contexto.conversacion_id = data.id;
    
    contexto.paciente_nombre = data.paciente_nombre || datosWhatsApp.contact_name;
    contexto.tiene_token = true;
    contexto.es_usuario_nuevo = false;
    contexto.conversacion_activa = true;
    contexto.conversacion_estado = data.estado;
    contexto.conversacion_contexto = data.contexto || {};
    
    console.log('✅ Conversación activa encontrada');
    console.log('🔑 Token:', contexto.token?.substring(0, 5) + '...');
    console.log('👤 Paciente ID:', contexto.paciente_id);
}

return { json: contexto };"""
    },
    "03-sub-crear-conversacion.json": {
        "Preparar Datos": r"""try {
    // Obtener datos del trigger
    let inputData = $input.all()[0]?.json || $json || {};
    
    console.log('=== DATOS RECIBIDOS ===');
    console.log(JSON.stringify(inputData, null, 2));
    
    let sessionId = inputData.session_id;
    let pacienteId = inputData.paciente_id; // String (CUID)
    let entidadMedicaId = inputData.entidad_medica_id; // String (CUID)
    let token = inputData.token;
    
    // Validación mínima
    if (!sessionId || !pacienteId || !entidadMedicaId || !token) {
        throw new Error('Faltan datos requeridos');
    }
    
    // Contexto inicial
    const contextoInicial = {
        estado_flujo: "ESPERANDO_SINTOMAS",
        fecha_inicio: new Date().toISOString(),
        ultimo_mensaje: new Date().toISOString()
    };
    
    return {
        json: {
            session_id: sessionId,
            paciente_id: pacienteId,
            entidad_medica_id: entidadMedicaId,
            estado: "ACTIVO",
            contexto: JSON.stringify(contextoInicial),
            token: token
        }
    };
} catch (error) {
    console.error('ERROR:', error.message);
    throw error;
}""",
        "Formatear Respuesta": r"""
        // No es Function Node, es SET Node. Pero el script maneja 'functionCode'.
        // Para SET nodes, no podemos cambiar jsonBody facilmente aqui sin logica compleja.
        // Omitiremos SET nodes en este array y los arreglaremos por lógica generica si posible.
        // WAIT: File 03 uses SET node "Formatear Respuesta". 
        // Logic fix needed: Change 'type: "number"' to 'type: "string"' in the JSON structure manually?
        // Let's rely on generic fix for `type: "number"` -> `type: "string"` for keys ending in `_id`.
        """
    },
    "04-sub-clasificar-sintomas.json": {
        "Preparar Prompt Clasificación": r"""// ===== PREPARAR PROMPT PARA CLASIFICACIÓN IA =====

const sintomas = ($json.sintomas || "").trim();
const pacienteId = $json.paciente_id; // String CUID

console.log('=== CLASIFICAR SÍNTOMAS ===');
console.log('Síntomas:', sintomas);
console.log('Paciente ID:', pacienteId);

if (!sintomas || sintomas.length === 0) {
    throw new Error('❌ No se proporcionaron síntomas para clasificar');
}

if (!pacienteId) {
    throw new Error('❌ ID de paciente inválido');
}

const prompt = `Eres un asistente médico experto.
Clasifica estos síntomas: "${sintomas}"
Categorías: general, citologia, odontologia.
Responde JSON: { "categoria": "...", "confianza": 0.9, "razon": "..." }`;

return {
    json: {
        prompt: prompt,
        sintomas_originales: sintomas,
        paciente_id: pacienteId
    }
};"""
    },
    "05-sub-consultar-citas.json": {
        "Validar y Preparar": r"""// Validar inputs
const categoria = ($json.categoria || "").toLowerCase().trim();
const entidadMedicaId = $json.entidad_medica_id; // String CUID
const token = $json.token;
const page = Number($json.page || 1);

if (!categoria) { throw new Error('No se proporcionó categoría'); }
if (!entidadMedicaId) { throw new Error('No se proporcionó entidad_medica_id válido'); }
if (!token) { throw new Error('Token JWT es requerido'); }

return { json: { categoria, entidad_medica_id: entidadMedicaId, token, page } };""",
        "Formatear Citas": r"""// ===== FORMATEAR CITAS =====

const response = $json;
const page = Number($('Validar y Preparar').first().json.page || 1);
const pageSize = 10;

// Extraer arreglo de data wrapper
let citasArray = [];
if (response.citas && Array.isArray(response.citas)) citasArray = response.citas;
else if (response.data && Array.isArray(response.data)) citasArray = response.data;
else if (Array.isArray(response)) citasArray = response;

// Mapear normalizadas
const normalizadas = citasArray
  .map((cita) => ({
    slot_id: cita.id ?? cita.slot_id, // Cuidado con ID vs SlotID
    fecha: cita.fecha ?? cita.fecha_formateada,
    hora: cita.hora ?? cita.hora_cita,
    medico: cita.medico_nombre ?? cita.medico,
    especialidad: cita.especialidad_nombre ?? cita.especialidad,
    disponible: cita.disponible !== false
  }))
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
    },
    "06-sub-agendar-cita.json": {
        "Validar Datos": r"""// ===== VALIDAR DATOS Y AGENDA_ID =====

const slotId = $json.agenda_id; // String/Int (ID del slot)
const pacienteId = $json.paciente_id; // String CUID
const motivoConsulta = $json.motivo_consulta || "Consulta programada";
const sessionId = $json.session_id;
const token = $json.token;

if (!slotId) {
    return { json: { success: false, error: 'ID de cita inválido' } };
}
if (!pacienteId) {
    return { json: { success: false, error: 'ID de paciente inválido' } };
}
if (!token) {
    return { json: { success: false, error: 'Token no disponible' } };
}

return {
    json: {
        paciente_id: pacienteId,
        slot: slotId,
        motivo_consulta: motivoConsulta,
        telefono: sessionId,
        token: token
    }
};""",
         "Formatear Respuesta": r"""// ===== FORMATEAR RESPUESTA =====
const response = $json;
const data = response.data ? response.data : response;

if (response.error || !data) {
     return {
        json: {
            success: false,
            mensaje: response.error?.message || 'Error al agendar',
            error_tipo: 'backend_error'
        }
    };
}

return {
    json: {
        success: true,
        cita_id: data.id,
        mensaje: 'Cita agendada exitosamente',
        detalles: data
    }
};"""
    },
    "07-sub-listar-citas-activas.json": {
        "Validar Input": r"""// Validar que el paciente_id sea válido
const pacienteId = $json.paciente_id; // String CUID
const token = $json.token;

if (!pacienteId) {
    return { json: { success: false, mensaje: "ID de paciente inválido", citas: [] } };
}
if (!token) {
    return { json: { success: false, mensaje: "Token JWT es requerido", citas: [] } };
}

return { json: { paciente_id: pacienteId, token: token, validated: true } };"""
    },
    "08-sub-confirmar-cancelacion.json": {
        "Validar Inputs": r"""// Validar inputs
const citaId = $json.cita_id; // ID Cita (puede ser string o int)
const pacienteId = $json.paciente_id; // CUID
const token = $json.token;

if (!citaId) {
    return { json: { success: false, mensaje: "ID de cita inválido", valid: false } };
}
if (!pacienteId) {
    return { json: { success: false, mensaje: "ID de paciente inválido", valid: false } };
}
if (!token) {
    return { json: { success: false, mensaje: "Token JWT requerido", valid: false } };
}

return { json: { cita_id: citaId, paciente_id: pacienteId, token: token, valid: true } };"""
    },
    "09-sub-actualizar-contexto.json": {
        "Preparar Contexto": r"""// Preparar contexto actualizado
const conversacionId = $json.conversacion_id; // CUID
const token = $json.token;

if (!conversacionId) {
    throw new Error('conversacion_id inválido');
}

return {
    json: {
        conversacion_id: conversacionId,
        sintomas_reportados: $json.sintomas_reportados || "",
        categoria_identificada: $json.categoria_identificada || "",
        flujo_actual: $json.estado_flujo || "",
        token: token
    }
};"""
    },
    "10-sub-finalizar-conversacion.json": {
        "Validar y Log": r"""// Validar y preparar datos
const conversacionId = $json.conversacion_id; // CUID String
const token = $json.token;
const motivoCierre = $json.motivo_cierre || 'COMPLETADO';

if (!conversacionId) {
    throw new Error('conversacion_id inválido');
}

return {
    json: {
        conversacion_id: conversacionId,
        token: token,
        motivo_cierre: motivoCierre
    }
};"""
    }
}

def process_workflow(file_path, file_name):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changed = False

    # 1. Fix Headers (Remove x-webhook-secret)
    for node in data.get('nodes', []):
        if node.get('type') == 'n8n-nodes-base.httpRequest':
            header_params = node.get('parameters', {}).get('headerParameters', {}).get('parameters', [])
            new_params = [
                p for p in header_params 
                if p.get('name', '').lower() != 'x-webhook-secret'
            ]
            if len(new_params) != len(header_params):
                node['parameters']['headerParameters']['parameters'] = new_params
                changed = True

    # 2. Update CONFIG Node
    for node in data.get('nodes', []):
        if node.get('name') == 'CONFIG' or node.get('name') == 'CONFIGURACION':
            # Identify by checking if it has some config-like code/params
            if 'jsCode' in node.get('parameters', {}):
                node['parameters']['jsCode'] = CONFIG_CODE
                changed = True

    # 3. Apply Specific JS Logic Fixes
    if file_name in NODE_FIXES:
        fixes = NODE_FIXES[file_name]
        for node in data.get('nodes', []):
            node_name = node.get('name')
            if node_name in fixes:
                # Replace jsCode (Code Node) or functionCode (Function Node)
                if 'functionCode' in node.get('parameters', {}):
                    node['parameters']['functionCode'] = fixes[node_name]
                    changed = True
                elif 'jsCode' in node.get('parameters', {}):
                    node['parameters']['jsCode'] = fixes[node_name]
                    changed = True

    # 4. Generic Type Fix (Number -> String for IDs) in Input Mocking (Parameters)
    for node in data.get('nodes', []):
        inputs = node.get('parameters', {}).get('workflowInputs', {}).get('values', [])
        for inp in inputs:
            if inp.get('name', '').endswith('_id') and inp.get('type') == 'number':
                inp['type'] = 'string'
                changed = True

    # 5. Generic Type Fix in Set Node Assignments
    for node in data.get('nodes', []):
        if node.get('type') == 'n8n-nodes-base.set':
            assignments = node.get('parameters', {}).get('assignments', {}).get('assignments', [])
            for asn in assignments:
                if asn.get('name', '').endswith('_id') and asn.get('type') == 'number':
                    asn['type'] = 'string'
                    changed = True

    if changed:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Fixed: {file_name}")
    else:
        print(f"No changes needed: {file_name}")

def main():
    files = [f for f in os.listdir(WORKFLOW_DIR) if f.endswith('.json')]
    for file_name in files:
        if file_name == "02-sub-validar-paciente.json":
            continue # Skip as it's already fixed manually
        
        process_workflow(os.path.join(WORKFLOW_DIR, file_name), file_name)

if __name__ == "__main__":
    main()
