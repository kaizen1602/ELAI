#!/usr/bin/env python3
"""
Script para corregir el flujo principal de n8n
- Añade nodo de detección de cédula
- Mejora el prompt del Agent
- Corrige las conexiones
"""

import json
import sys

def main():
    # Leer el workflow
    with open('01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-U.V.json', 'r', encoding='utf-8') as f:
        workflow = json.load(f)

    print("=== CORRIGIENDO WORKFLOW PRINCIPAL ===\n")

    # 1. Añadir nodo de detección de documento
    print("1. Añadiendo nodo 'Detectar Documento'...")

    detector_node = {
        "parameters": {
            "jsCode": """// ===== DETECTOR INTELIGENTE DE DOCUMENTO =====
const messageText = $json.message_text || "";
const esUsuarioNuevo = $json.es_usuario_nuevo;
const conversacionActiva = $json.conversacion_activa;
const pacienteId = $json.paciente_id;

console.log('=== DETECTOR DE DOCUMENTO ===');
console.log('Mensaje:', messageText);
console.log('Es usuario nuevo:', esUsuarioNuevo);
console.log('Conversación activa:', conversacionActiva);
console.log('Paciente ID:', pacienteId);

// Patrones de detección de cédula
const patterns = [
    // Solo números (8-15 dígitos)
    /^\\s*(\\d{8,15})\\s*$/,
    // Con palabras clave
    /(?:cc|cedula|cédula|documento|identificación|identificacion|número de cédula|numero de cedula|mi cc|mi cedula|mi cédula|mi documento)\\s*:?\\s*(?:es)?\\s*(\\d{8,15})/i,
    // Frases naturales
    /(?:mi|el|mi número|numero)\\s+(?:de)?\\s*(?:cc|cedula|cédula|documento|identificación)\\s+(?:es)?\\s*:?\\s*(\\d{8,15})/i
];

let documentoDetectado = null;
let esDocumento = false;

// Intentar extraer documento
for (const pattern of patterns) {
    const match = messageText.match(pattern);
    if (match) {
        // El documento puede estar en match[1] o match[0]
        documentoDetectado = match[1] || match[0];
        // Limpiar: solo dígitos
        documentoDetectado = documentoDetectado.replace(/\\D/g, '');
        if (documentoDetectado.length >= 8 && documentoDetectado.length <= 15) {
            esDocumento = true;
            break;
        } else {
            documentoDetectado = null;
        }
    }
}

// Determinar la acción
let accion = 'AGENT_NORMAL';  // Por defecto, ir al agent

if (esUsuarioNuevo && !conversacionActiva && !pacienteId) {
    // Usuario nuevo sin documento
    if (esDocumento && documentoDetectado) {
        // Detectamos documento → validar directamente
        accion = 'VALIDAR_DIRECTO';
    } else if (messageText.toLowerCase().includes('hola') ||
               messageText.toLowerCase().includes('buenas') ||
               messageText.toLowerCase().includes('buen día') ||
               messageText.toLowerCase().includes('buenos dias')) {
        // Saludo inicial → pedir documento
        accion = 'PEDIR_DOCUMENTO';
    } else {
        // Cualquier otro mensaje de usuario nuevo → pedir documento
        accion = 'PEDIR_DOCUMENTO';
    }
} else if (pacienteId && conversacionActiva) {
    // Usuario registrado → procesar mensaje normalmente
    accion = 'AGENT_NORMAL';
}

console.log('Documento detectado:', documentoDetectado);
console.log('Es documento:', esDocumento);
console.log('Acción:', accion);

return {
    json: {
        ...$json,
        documento_detectado: documentoDetectado,
        es_documento: esDocumento,
        accion: accion,
        // Modificar el mensaje si es documento para que el agent lo procese mejor
        message_text_original: messageText,
        message_text: esDocumento ? documentoDetectado : messageText
    }
};"""
        },
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [-672, -256],
        "id": "detector-documento-id",
        "name": "Detectar Documento"
    }

    # 2. Añadir nodo IF para dirigir el flujo
    print("2. Añadiendo nodo 'Decisión de Flujo'...")

    decision_node = {
        "parameters": {
            "conditions": {
                "options": {
                    "caseSensitive": false,
                    "leftValue": "",
                    "typeValidation": "loose"
                },
                "conditions": [
                    {
                        "id": "validar-directo",
                        "leftValue": "={{ $json.accion }}",
                        "rightValue": "VALIDAR_DIRECTO",
                        "operator": {
                            "type": "string",
                            "operation": "equals"
                        }
                    }
                ],
                "combinator": "and"
            },
            "options": {}
        },
        "id": "decision-flujo-id",
        "name": "¿Validar Directo?",
        "type": "n8n-nodes-base.if",
        "typeVersion": 2,
        "position": [-496, -256]
    }

    # 3. Añadir nodo de respuesta para pedir documento
    print("3. Añadiendo nodo 'Pedir Documento'...")

    pedir_doc_node = {
        "parameters": {
            "operation": "sendText",
            "chatId": "={{ $json.session_id }}",
            "text": "¡Hola! 👋 Soy Sophia, tu asistente médica.\\n\\nPara ayudarte a agendar una cita, necesito que me proporciones tu número de cédula 🆔",
            "additionalFields": {}
        },
        "id": "pedir-documento-id",
        "name": "Pedir Documento",
        "type": "n8n-nodes-base.whatsApp",
        "typeVersion": 1,
        "position": [-496, -128],
        "credentials": {
            "whatsAppTriggerApi": {
                "id": "4eTRV2nzHw6C5COc",
                "name": "WhatsApp OAuth account 2"
            }
        }
    }

    # 4. Modificar conexiones
    print("4. Modificando conexiones del flujo...")

    # Buscar el nodo "Preparar Contexto"
    preparar_contexto_idx = None
    for idx, node in enumerate(workflow['nodes']):
        if node['name'] == 'Preparar Contexto':
            preparar_contexto_idx = idx
            break

    if preparar_contexto_idx is not None:
        # Añadir los nuevos nodos después de "Preparar Contexto"
        workflow['nodes'].insert(preparar_contexto_idx + 1, detector_node)
        workflow['nodes'].insert(preparar_contexto_idx + 2, decision_node)
        workflow['nodes'].insert(preparar_contexto_idx + 3, pedir_doc_node)

        # Actualizar conexiones
        # "Preparar Contexto" → "Detectar Documento"
        if 'Preparar Contexto' not in workflow['connections']:
            workflow['connections']['Preparar Contexto'] = {"main": [[]]}

        workflow['connections']['Preparar Contexto']['main'][0] = [
            {
                "node": "Detectar Documento",
                "type": "main",
                "index": 0
            }
        ]

        # "Detectar Documento" → "Decisión de Flujo"
        workflow['connections']['Detectar Documento'] = {
            "main": [[{
                "node": "¿Validar Directo?",
                "type": "main",
                "index": 0
            }]]
        }

        # "Decisión de Flujo" → TRUE: "tool_validar_paciente", FALSE: Check acción
        workflow['connections']['¿Validar Directo?'] = {
            "main": [
                [{
                    "node": "Ejecutar Validación Directa",
                    "type": "main",
                    "index": 0
                }],
                [{
                    "node": "Siguiente Decisión",
                    "type": "main",
                    "index": 0
                }]
            ]
        }

    # 5. Añadir nodo para ejecutar validación directa
    print("5. Añadiendo nodo 'Ejecutar Validación Directa'...")

    ejecutar_validacion_node = {
        "parameters": {
            "workflowId": {
                "__rl": true,
                "value": "1B0BC7UVqfah4n2a",
                "mode": "list",
                "cachedResultUrl": "/workflow/1B0BC7UVqfah4n2a",
                "cachedResultName": "02-SUB-VALIDAR-PACIENTE-V3-CON-CACHE"
            },
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "query": "={{ $json.documento_detectado }}",
                    "session_id": "={{ $json.session_id }}"
                }
            }
        },
        "id": "ejecutar-validacion-id",
        "name": "Ejecutar Validación Directa",
        "type": "n8n-nodes-base.executeWorkflow",
        "typeVersion": 1.1,
        "position": [-320, -352]
    }

    workflow['nodes'].append(ejecutar_validacion_node)

    # 6. Añadir nodo "Siguiente Decisión" para pedir documento
    print("6. Añadiendo nodo 'Siguiente Decisión'...")

    siguiente_decision_node = {
        "parameters": {
            "conditions": {
                "options": {
                    "caseSensitive": false
                },
                "conditions": [
                    {
                        "id": "pedir-doc",
                        "leftValue": "={{ $json.accion }}",
                        "rightValue": "PEDIR_DOCUMENTO",
                        "operator": {
                            "type": "string",
                            "operation": "equals"
                        }
                    }
                ]
            }
        },
        "id": "siguiente-decision-id",
        "name": "Siguiente Decisión",
        "type": "n8n-nodes-base.if",
        "typeVersion": 2,
        "position": [-320, -192]
    }

    workflow['nodes'].append(siguiente_decision_node)

    workflow['connections']['Siguiente Decisión'] = {
        "main": [
            [{
                "node": "Pedir Documento",
                "type": "main",
                "index": 0
            }],
            [{
                "node": "AI Agent",
                "type": "main",
                "index": 0
            }]
        ]
    }

    # Conexión desde "Ejecutar Validación Directa" a respuesta
    workflow['connections']['Ejecutar Validación Directa'] = {
        "main": [[{
            "node": "Responder Usuario",
            "type": "main",
            "index": 0
        }]]
    }

    # 7. Guardar el workflow modificado
    print("7. Guardando cambios...")

    output_file = '01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-U.V-FIXED.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2, ensure_ascii=False)

    print(f"\\n✅ Workflow corregido guardado en: {output_file}")
    print("\\n=== CAMBIOS APLICADOS ===")
    print("1. ✓ Añadido nodo 'Detectar Documento' para extraer cédula automáticamente")
    print("2. ✓ Añadido nodo '¿Validar Directo?' para dirigir el flujo")
    print("3. ✓ Añadido nodo 'Pedir Documento' para responder automáticamente")
    print("4. ✓ Añadido nodo 'Ejecutar Validación Directa' sin pasar por el Agent")
    print("5. ✓ Modificadas las conexiones del flujo")
    print("\\n📋 PRÓXIMOS PASOS:")
    print("1. Importar el archivo corregido en n8n")
    print("2. Verificar que todas las credenciales estén configuradas")
    print("3. Activar el workflow")
    print("4. Probar con un mensaje de WhatsApp")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
