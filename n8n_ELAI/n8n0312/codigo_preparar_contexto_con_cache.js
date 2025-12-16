// ===== PREPARAR CONTEXTO UNIFICADO MEJORADO CON CACHÉ =====

const datosWhatsApp = $('Extraer Datos').first().json;
const datosCache = $('Consultar Caché Diario').first()?.json;
const respuestaConversacion = $('Consultar Conversación Pública').first()?.json;

console.log('=== PREPARAR CONTEXTO MEJORADO (CON CACHÉ) ===');
console.log('📦 Datos Caché:', datosCache ? 'Existe' : 'No existe');
console.log('💾 Datos BD:', respuestaConversacion ? 'Existe' : 'No existe');

// Inicializar contexto base
let contexto = {
    // Datos del mensaje actual
    session_id: datosWhatsApp.session_id,
    message_text: datosWhatsApp.message_text,
    contact_name: datosWhatsApp.contact_name,
    message_type: datosWhatsApp.message_type,
    timestamp: datosWhatsApp.timestamp,

    // Credenciales (inicialmente vacías)
    token: null,
    paciente_id: null,
    paciente_nombre: null,
    entidad_medica_id: null,
    conversacion_id: null,

    // Flags de estado
    tiene_token: false,
    es_usuario_nuevo: true,
    conversacion_activa: false,
    fuente_datos: 'NINGUNA'
};

// ========================================================================
// PRIORIDAD 1: USAR CACHÉ REDIS (más rápido, más reciente)
// ========================================================================
if (datosCache && !datosCache.error && datosCache.paciente_id) {
    console.log('✅ USANDO DATOS DE CACHÉ REDIS');

    try {
        // Si datosCache.paciente_id es string (JSON parseado), convertir
        const cacheData = typeof datosCache === 'string' ? JSON.parse(datosCache) : datosCache;

        contexto.token = cacheData.token;
        contexto.paciente_id = Number(cacheData.paciente_id);
        contexto.entidad_medica_id = Number(cacheData.entidad_medica_id);
        contexto.conversacion_id = cacheData.conversacion_id ? Number(cacheData.conversacion_id) : null;
        contexto.paciente_nombre = cacheData.nombre;
        contexto.documento = cacheData.documento;
        contexto.tiene_token = true;
        contexto.es_usuario_nuevo = false;
        contexto.conversacion_activa = true;
        contexto.fuente_datos = 'CACHE_REDIS';
        contexto.validado_at = cacheData.validado_at;
        contexto.expires_at = cacheData.expires_at;

        console.log('📦 Paciente ID (caché):', contexto.paciente_id, '(tipo:', typeof contexto.paciente_id, ')');
        console.log('🔑 Token (caché):', contexto.token?.substring(0, 20) + '...');
        console.log('⏰ Expira a medianoche:', contexto.expires_at);
    } catch (error) {
        console.error('❌ Error parseando caché:', error.message);
        // Si falla parsear caché, continuar a BD
    }
}

// ========================================================================
// PRIORIDAD 2: Si no hay caché, usar BD
// ========================================================================
if (contexto.fuente_datos === 'NINGUNA' && respuestaConversacion && !respuestaConversacion.error) {
    if (respuestaConversacion.id && respuestaConversacion.token) {
        console.log('✅ USANDO DATOS DE BD (NO HAY CACHÉ)');

        contexto.token = respuestaConversacion.token;

        // Validar antes de convertir a Number
        contexto.paciente_id = respuestaConversacion.paciente_id &&
                               respuestaConversacion.paciente_id !== '0' &&
                               respuestaConversacion.paciente_id !== 0 ?
            Number(respuestaConversacion.paciente_id) : null;

        contexto.entidad_medica_id = respuestaConversacion.entidad_medica_id &&
                                     respuestaConversacion.entidad_medica_id !== '0' &&
                                     respuestaConversacion.entidad_medica_id !== 0 ?
            Number(respuestaConversacion.entidad_medica_id) : null;

        contexto.conversacion_id = respuestaConversacion.id &&
                                   respuestaConversacion.id !== '0' &&
                                   respuestaConversacion.id !== 0 ?
            Number(respuestaConversacion.id) : null;

        contexto.paciente_nombre = respuestaConversacion.paciente_nombre || datosWhatsApp.contact_name;
        contexto.tiene_token = true;
        contexto.es_usuario_nuevo = false;
        contexto.conversacion_activa = true;
        contexto.fuente_datos = 'BD';
        contexto.conversacion_estado = respuestaConversacion.estado;
        contexto.conversacion_contexto = respuestaConversacion.contexto || {};

        console.log('💾 Paciente ID (BD):', contexto.paciente_id, '(tipo:', typeof contexto.paciente_id, ')');
        console.log('🔑 Token (BD):', contexto.token?.substring(0, 20) + '...');
    }
}

// ========================================================================
// PRIORIDAD 3: Usuario nuevo (sin caché ni BD)
// ========================================================================
if (contexto.fuente_datos === 'NINGUNA') {
    console.log('ℹ️ USUARIO NUEVO - Sin caché ni conversación en BD');
}

console.log('=== CONTEXTO FINAL ===');
console.log('Fuente de datos:', contexto.fuente_datos);
console.log('Paciente ID:', contexto.paciente_id);
console.log('Conversación activa:', contexto.conversacion_activa);
console.log('Es usuario nuevo:', contexto.es_usuario_nuevo);

return { json: contexto };
