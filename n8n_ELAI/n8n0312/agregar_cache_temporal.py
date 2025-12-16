#!/usr/bin/env python3
"""
Script para agregar caché temporal diario con Redis al workflow principal.

Este script:
1. Lee el workflow principal actual
2. Agrega 3 nodos nuevos (Redis GET, Function TTL, Redis SET)
3. Modifica el nodo "Preparar Contexto" para usar caché
4. Actualiza las conexiones
5. Guarda el workflow modificado
"""

import json
import copy
from datetime import datetime

# Archivo de entrada
INPUT_FILE = "01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-EXPLICITA.json"
OUTPUT_FILE = "01-WORKFLOW-PRINCIPAL-V4-CON-CACHE-TEMPORAL.json"

print("🔄 Iniciando modificación del workflow...")
print(f"📂 Leyendo: {INPUT_FILE}")

# Leer workflow actual
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print(f"✅ Workflow cargado: {workflow['name']}")
print(f"📊 Nodos actuales: {len(workflow['nodes'])}")

# ===========================================================================
# NODO 1: Redis GET - Consultar Caché Diario
# ===========================================================================

nodo_redis_get = {
    "parameters": {
        "operation": "get",
        "key": "={{ 'sophia:session:' + $json.session_id + ':daily-context' }}",
        "options": {}
    },
    "id": "cache-get-daily-context",
    "name": "Consultar Caché Diario",
    "type": "n8n-nodes-base.redis",
    "typeVersion": 1,
    "position": [-1000, -32],
    "credentials": {
        "redis": {
            "id": "kOI8a9sT8AozFYEo",
            "name": "Redis account 2"
        }
    },
    "continueOnFail": True,
    "alwaysOutputData": True,
    "notes": "Consulta caché temporal (válido hasta medianoche). Si existe, evita consultar BD."
}

# ===========================================================================
# NODO 2: Function - Calcular TTL y Preparar Datos para Redis
# ===========================================================================

nodo_calcular_ttl = {
    "parameters": {
        "functionCode": """// ===== CALCULAR TTL HASTA MEDIANOCHE =====

const ahora = new Date();
const medianoche = new Date(ahora);
medianoche.setHours(24, 0, 0, 0); // Próxima medianoche

const ttlSegundos = Math.floor((medianoche - ahora) / 1000);

console.log('=== CÁLCULO TTL CACHÉ DIARIO ===');
console.log('Ahora:', ahora.toISOString());
console.log('Medianoche:', medianoche.toISOString());
console.log('TTL (segundos):', ttlSegundos);
console.log('TTL (horas):', (ttlSegundos / 3600).toFixed(2));

// ===== PREPARAR DATOS PARA REDIS =====

const resultadoValidacion = $json;
const sessionId = $('Preparar Contexto').first().json.session_id;

// Validar que tenemos los datos necesarios
if (!resultadoValidacion.paciente_id) {
    console.error('❌ No hay paciente_id en resultado de validación');
    return {
        json: {
            error: 'NO_PACIENTE_ID',
            ...resultadoValidacion
        }
    };
}

const datosCache = {
    paciente_id: resultadoValidacion.paciente_id,
    nombre: resultadoValidacion.nombre || resultadoValidacion.paciente_nombre,
    entidad_medica_id: resultadoValidacion.entidad_medica_id,
    token: resultadoValidacion.token,
    documento: resultadoValidacion.documento,
    conversacion_id: resultadoValidacion.conversacion_id,
    validado_at: new Date().toISOString(),
    expires_at: medianoche.toISOString()
};

console.log('=== DATOS A GUARDAR EN CACHÉ ===');
console.log(JSON.stringify(datosCache, null, 2));

return {
    json: {
        redis_key: `sophia:session:${sessionId}:daily-context`,
        redis_value: JSON.stringify(datosCache),
        redis_ttl: ttlSegundos,
        ...resultadoValidacion  // Pasar también los datos originales
    }
};"""
    },
    "id": "cache-calc-ttl",
    "name": "Calcular TTL Caché",
    "type": "n8n-nodes-base.function",
    "typeVersion": 1,
    "position": [-200, 400],
    "notes": "Calcula TTL hasta medianoche y prepara datos para guardar en Redis"
}

# ===========================================================================
# NODO 3: Redis SET - Guardar Caché con TTL
# ===========================================================================

nodo_redis_set = {
    "parameters": {
        "operation": "set",
        "key": "={{ $json.redis_key }}",
        "value": "={{ $json.redis_value }}",
        "expire": True,
        "ttl": "={{ $json.redis_ttl }}",
        "options": {}
    },
    "id": "cache-set-daily-context",
    "name": "Guardar Caché Diario",
    "type": "n8n-nodes-base.redis",
    "typeVersion": 1,
    "position": [0, 400],
    "credentials": {
        "redis": {
            "id": "kOI8a9sT8AozFYEo",
            "name": "Redis account 2"
        }
    },
    "notes": "Guarda contexto en Redis con TTL hasta medianoche (auto-limpieza)"
}

# ===========================================================================
# MODIFICAR NODO "Preparar Contexto" para usar caché
# ===========================================================================

codigo_preparar_contexto_mejorado = """// ===== PREPARAR CONTEXTO UNIFICADO MEJORADO CON CACHÉ =====

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
"""

# Buscar y modificar el nodo "Preparar Contexto"
for node in workflow['nodes']:
    if node.get('name') == 'Preparar Contexto':
        print("✏️  Modificando nodo 'Preparar Contexto'...")
        node['parameters']['functionCode'] = codigo_preparar_contexto_mejorado
        node['notes'] = "Unifica datos de WhatsApp + Caché Redis + BD (prioriza caché)"
        break

# ===========================================================================
# Agregar los nuevos nodos al workflow
# ===========================================================================

workflow['nodes'].extend([nodo_redis_get, nodo_calcular_ttl, nodo_redis_set])

print(f"✅ Agregados 3 nodos nuevos")
print(f"📊 Total nodos ahora: {len(workflow['nodes'])}")

# ===========================================================================
# ACTUALIZAR CONEXIONES
# ===========================================================================

print("🔗 Actualizando conexiones...")

# Buscar índices de nodos importantes
idx_config = None
idx_consultar_conv = None
idx_preparar_ctx = None
idx_tool_validar = None

for i, node in enumerate(workflow['nodes']):
    if node.get('name') == 'config':
        idx_config = i
    elif node.get('name') == 'Consultar Conversación Pública':
        idx_consultar_conv = i
    elif node.get('name') == 'Preparar Contexto':
        idx_preparar_ctx = i
    elif node.get('name') == 'tool_validar_paciente':
        idx_tool_validar = i

# Actualizar conexiones
if 'connections' not in workflow:
    workflow['connections'] = {}

# CONFIG → Consultar Caché Diario
workflow['connections']['config'] = {
    "main": [[{
        "node": "Consultar Caché Diario",
        "type": "main",
        "index": 0
    }]]
}

# Consultar Caché Diario → Consultar Conversación Pública
workflow['connections']['Consultar Caché Diario'] = {
    "main": [[{
        "node": "Consultar Conversación Pública",
        "type": "main",
        "index": 0
    }]]
}

# tool_validar_paciente → Calcular TTL Caché
if 'tool_validar_paciente' in workflow['connections']:
    # Mantener conexiones existentes y agregar nueva
    existing = workflow['connections']['tool_validar_paciente'].get('ai_tool', [])
    workflow['connections']['tool_validar_paciente'] = {
        "ai_tool": existing,
        "main": [[{
            "node": "Calcular TTL Caché",
            "type": "main",
            "index": 0
        }]]
    }
else:
    workflow['connections']['tool_validar_paciente'] = {
        "main": [[{
            "node": "Calcular TTL Caché",
            "type": "main",
            "index": 0
        }]]
    }

# Calcular TTL Caché → Guardar Caché Diario
workflow['connections']['Calcular TTL Caché'] = {
    "main": [[{
        "node": "Guardar Caché Diario",
        "type": "main",
        "index": 0
    }]]
}

print("✅ Conexiones actualizadas")

# ===========================================================================
# GUARDAR WORKFLOW MODIFICADO
# ===========================================================================

# Actualizar metadata
workflow['versionId'] = f"cache-temporal-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
workflow['name'] = "01-WORKFLOW-PRINCIPAL-V4-CON-CACHE-TEMPORAL"

print(f"💾 Guardando workflow modificado: {OUTPUT_FILE}")

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, ensure_ascii=False, indent=2)

print(f"✅ Workflow guardado exitosamente")
print(f"\n📊 RESUMEN:")
print(f"  - Nodos agregados: 3 (Redis GET, Function TTL, Redis SET)")
print(f"  - Nodos modificados: 1 (Preparar Contexto)")
print(f"  - Total nodos: {len(workflow['nodes'])}")
print(f"  - Archivo de salida: {OUTPUT_FILE}")
print(f"\n🚀 Próximo paso: Importar {OUTPUT_FILE} en n8n")
print(f"\n📖 Documentación: SOLUCION-CACHE-TEMPORAL-DIARIO.md")
