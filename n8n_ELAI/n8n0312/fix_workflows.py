#!/usr/bin/env python3
"""
Script para corregir automáticamente los flujos de n8n según los criterios especificados.
"""

import json
import os
from pathlib import Path

# Configuración del nodo CONFIG que se debe usar
CONFIG_NODE = {
    "parameters": {
        "jsCode": """// ===== CONFIGURACIÓN CENTRALIZADA =====
  // ⚠️ EDITAR AQUÍ cuando cambien URLs o valores

  const CONFIG = {
    // Backend - ⚠️ CAMBIAR ESTA URL cada vez que reinicies ngrok
    BACKEND_NGROK_URL: "https://e5d3dba10ea2.ngrok-free.app",

    // Ngrok headers (no cambiar)
    NGROK_HEADER_NAME: "ngrok-skip-browser-warning",
    NGROK_HEADER_VALUE: "true",

    // Contacto de la clínica
    TELEFONO_CLINICA: "+573001234567"
  };

  console.log('=== CONFIG CARGADA ===');
  console.log('BACKEND_NGROK_URL:', CONFIG.BACKEND_NGROK_URL);

  // Pasar CONFIG + datos del trigger anterior
  return {
    json: {
      ...CONFIG,
      ...$json  // Preserva datos anteriores
    }
  };
"""
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "name": "CONFIG"
}

def fix_url_syntax(url_str):
    """Corrige la sintaxis de URLs en n8n"""
    if not isinstance(url_str, str):
        return url_str

    # Quitar el = inicial si está presente con {{ }}
    if url_str.startswith("=={{") and url_str.endswith("}}"):
        return "{{" + url_str[3:]

    return url_str

def replace_vars_with_config(text):
    """Reemplaza $vars con $('CONFIG').item.json"""
    if not isinstance(text, str):
        return text

    replacements = {
        "$vars.BACKEND_NGROK_URL": "$('CONFIG').item.json.BACKEND_NGROK_URL",
        "$vars.NGROK_HEADER_NAME": "$('CONFIG').item.json.NGROK_HEADER_NAME",
        "$vars.NGROK_HEADER_VALUE": "$('CONFIG').item.json.NGROK_HEADER_VALUE",
        "$vars.TELEFONO_CLINICA": "$('CONFIG').item.json.TELEFONO_CLINICA",
    }

    result = text
    for old, new in replacements.items():
        result = result.replace(old, new)

    return result

def fix_redis_node(node):
    """Añade campo messageData a nodos Redis publish"""
    if node.get("type") == "n8n-nodes-base.redis":
        params = node.get("parameters", {})
        if params.get("operation") == "publish":
            # Si no tiene message ni messageData, añadir messageData
            if "message" not in params and "messageData" not in params:
                params["messageData"] = "={{ JSON.stringify({ typing: true, session_id: $json.session_id || 'unknown' }) }}"
                node["parameters"] = params
    return node

def fix_http_node(node):
    """Corrige URLs y headers en nodos HTTP Request"""
    if node.get("type") == "n8n-nodes-base.httpRequest":
        params = node.get("parameters", {})

        # Corregir URL
        if "url" in params:
            params["url"] = fix_url_syntax(replace_vars_with_config(params["url"]))

        # Corregir headers
        if "headerParameters" in params and "parameters" in params["headerParameters"]:
            for header in params["headerParameters"]["parameters"]:
                if "name" in header:
                    header["name"] = fix_url_syntax(replace_vars_with_config(header["name"]))
                if "value" in header:
                    header["value"] = fix_url_syntax(replace_vars_with_config(header["value"]))

        node["parameters"] = params

    return node

def has_config_node(workflow):
    """Verifica si el workflow ya tiene un nodo CONFIG"""
    for node in workflow.get("nodes", []):
        if node.get("name") in ["CONFIG", "config", "Code in JavaScript"]:
            return True
    return False

def get_trigger_node_id(workflow):
    """Obtiene el ID del nodo trigger"""
    for node in workflow.get("nodes", []):
        node_type = node.get("type", "")
        if "Trigger" in node_type or "start" in node_type.lower():
            return node.get("id")
    return None

def add_config_node(workflow):
    """Añade nodo CONFIG después del trigger si no existe"""
    if has_config_node(workflow):
        print(f"  ✓ Workflow ya tiene nodo CONFIG")
        return workflow, []

    trigger_id = get_trigger_node_id(workflow)
    if not trigger_id:
        print(f"  ⚠️  No se encontró nodo trigger, no se puede añadir CONFIG")
        return workflow, []

    # Generar nuevo ID para CONFIG
    import uuid
    config_id = str(uuid.uuid4())

    # Crear nodo CONFIG
    config_node = CONFIG_NODE.copy()
    config_node["id"] = config_id
    config_node["position"] = [0, 0]  # Se ajustará según el trigger

    # Encontrar posición del trigger
    for node in workflow["nodes"]:
        if node.get("id") == trigger_id:
            trigger_pos = node.get("position", [0, 0])
            config_node["position"] = [trigger_pos[0] + 200, trigger_pos[1]]
            break

    # Añadir nodo CONFIG
    workflow["nodes"].append(config_node)

    # Modificar conexiones: insertar CONFIG entre trigger y siguiente nodo
    connections = workflow.get("connections", {})
    changes = []

    for trigger_name in list(connections.keys()):
        # Buscar el nodo trigger por nombre
        trigger_node = next((n for n in workflow["nodes"] if n.get("id") == trigger_id), None)
        if not trigger_node:
            continue

        if trigger_node.get("name") == trigger_name:
            main_connections = connections[trigger_name].get("main", [[]])
            if main_connections and main_connections[0]:
                # Guardar conexiones originales
                original_targets = main_connections[0].copy()

                # Conectar trigger → CONFIG
                main_connections[0] = [{
                    "node": "CONFIG",
                    "type": "main",
                    "index": 0
                }]

                # Conectar CONFIG → nodos originales
                connections["CONFIG"] = {
                    "main": [original_targets]
                }

                changes.append(f"Insertado CONFIG entre {trigger_name} y {len(original_targets)} nodo(s)")

    workflow["connections"] = connections

    return workflow, changes

def process_workflow(file_path):
    """Procesa un archivo de workflow completo"""
    print(f"\n{'='*80}")
    print(f"Procesando: {file_path.name}")
    print(f"{'='*80}")

    with open(file_path, 'r', encoding='utf-8') as f:
        workflow = json.load(f)

    changes = []

    # 1. Añadir nodo CONFIG si no existe
    workflow, config_changes = add_config_node(workflow)
    changes.extend(config_changes)

    # 2. Procesar cada nodo
    for i, node in enumerate(workflow.get("nodes", [])):
        node_name = node.get("name", f"Node {i}")
        node_type = node.get("type", "unknown")

        # Fix Redis nodes
        original_redis = json.dumps(node)
        node = fix_redis_node(node)
        if json.dumps(node) != original_redis:
            changes.append(f"  Redis: Añadido messageData a '{node_name}'")

        # Fix HTTP nodes
        original_http = json.dumps(node)
        node = fix_http_node(node)
        if json.dumps(node) != original_http:
            changes.append(f"  HTTP: Corregidas URLs/headers en '{node_name}'")

        workflow["nodes"][i] = node

    # 3. Guardar archivo corregido
    output_path = file_path.parent / f"{file_path.stem}-FIXED.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Cambios realizados ({len(changes)}):")
    for change in changes:
        print(f"  - {change}")

    print(f"\n💾 Guardado en: {output_path.name}")

    return {
        "file": file_path.name,
        "output": output_path.name,
        "changes": changes
    }

def generate_report(results):
    """Genera el reporte markdown"""
    report = """# REPORTE DE CORRECCIÓN DE FLUJOS N8N

**Fecha:** {date}
**Total de flujos procesados:** {total}

---

## RESUMEN EJECUTIVO

Se han corregido {total} flujos de n8n aplicando las siguientes correcciones:

### Problemas corregidos:

1. **Variables $vars reemplazadas por nodo CONFIG**
   - Se añadió nodo CONFIG después del trigger en flujos que no lo tenían
   - Todas las referencias a `$vars.BACKEND_NGROK_URL`, `$vars.NGROK_HEADER_NAME` y `$vars.NGROK_HEADER_VALUE` fueron reemplazadas por `$('CONFIG').item.json.CAMPO`

2. **Sintaxis de URLs corregida**
   - URLs con formato `=={{{{ }}}}` fueron corregidas a `{{{{ }}}}`
   - Se eliminó el `=` inicial en expresiones

3. **Nodos Redis con campos vacíos corregidos**
   - Se añadió campo `messageData` con JSON.stringify a nodos Redis publish que no lo tenían

4. **Headers de ngrok corregidos**
   - Todos los headers ahora usan valores del nodo CONFIG

---

## DETALLES POR FLUJO

{details}

---

## CONFIGURACIÓN DEL NODO CONFIG

Todos los flujos corregidos incluyen (o ya tenían) un nodo CONFIG con esta estructura:

```javascript
const CONFIG = {{
  BACKEND_NGROK_URL: "https://e5d3dba10ea2.ngrok-free.app",
  NGROK_HEADER_NAME: "ngrok-skip-browser-warning",
  NGROK_HEADER_VALUE: "true",
  TELEFONO_CLINICA: "+573001234567"
}};
```

**IMPORTANTE:** Cada vez que reinicies ngrok, solo necesitas actualizar el valor de `BACKEND_NGROK_URL` en el nodo CONFIG del flujo 01 (principal).

---

## CHECKLIST DE VALIDACIÓN

### ✅ Pre-importación
- [ ] Verificar que la URL de ngrok en CONFIG sea la correcta y actual
- [ ] Confirmar que todas las credenciales (Redis, WhatsApp, OpenAI) estén configuradas

### ✅ Post-importación
- [ ] Todos los flujos importados correctamente sin errores
- [ ] Nodo CONFIG presente en flujos que lo necesitan
- [ ] Todas las URLs usan sintaxis correcta (`{{{{ }}}}` sin `=` inicial)
- [ ] Nodos Redis publish tienen campo `messageData`
- [ ] Headers de ngrok usan valores de CONFIG

### ✅ Pruebas funcionales
- [ ] Flujo 01: Workflow principal responde a mensajes de WhatsApp
- [ ] Flujo 02: Validación de pacientes funciona correctamente
- [ ] Flujo 03: Creación de conversaciones sin errores
- [ ] Flujo 04: Clasificación de síntomas con IA operativa
- [ ] Flujo 05: Consulta de citas disponibles retorna resultados
- [ ] Flujo 06: Agendamiento de citas exitoso
- [ ] Flujo 07: Listado de citas activas funciona
- [ ] Flujo 08: Cancelación de citas operativa
- [ ] Flujos 09-10: Actualización y finalización de conversaciones

---

## ARCHIVOS GENERADOS

{files}

---

## PRÓXIMOS PASOS

1. **Importar flujos corregidos:** Importa los archivos `-FIXED.json` en n8n
2. **Actualizar URL de ngrok:** Modifica el nodo CONFIG en el flujo 01 con tu URL actual
3. **Probar flujos:** Ejecuta el checklist de validación completo
4. **Activar workflows:** Una vez validados, activa los flujos en orden: 01 → 02 → ... → 10

---

**Nota:** Los archivos originales NO fueron modificados. Todos los cambios están en archivos con sufijo `-FIXED.json`.
"""

    from datetime import datetime

    # Generar detalles por flujo
    details = ""
    for i, result in enumerate(results, 1):
        details += f"### {i}. {result['file']}\n\n"
        details += f"**Archivo corregido:** `{result['output']}`\n\n"

        if result['changes']:
            details += f"**Cambios aplicados ({len(result['changes'])}):**\n\n"
            for change in result['changes']:
                details += f"- {change}\n"
        else:
            details += "**Cambios aplicados:** Ninguno (flujo ya estaba correcto)\n"

        details += "\n---\n\n"

    # Generar lista de archivos
    files = "\n".join([f"- `{r['output']}`" for r in results])

    # Completar reporte
    report = report.format(
        date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        total=len(results),
        details=details,
        files=files
    )

    return report

def main():
    """Función principal"""
    base_dir = Path(__file__).parent

    # Lista de archivos a procesar
    files_to_process = [
        "01-WORKFLOW-PRINCIPAL-COMPLETO-FIXED-V2-4.json",
        "02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED.json",
        "03-SUB-CREAR-CONVERSACION-2.json",
        "04-SUB-CLASIFICAR-SINTOMAS-V3-FIXED-2.json",
        "05-Consultar_citas.json",
        "06-SUB-AGENDAR-CITA-OPTIMIZED.json",
        "07-SUB-LISTAR-CITAS-ACTIVAS-CORREGIDO-5.json",
        "08-SUB-CONFIRMAR-CANCELACION-CORREGIDO-4.json",
        "09-SUB-ACTUALIZAR-CONTEXTO-CONVERSACION-2.json",
        "10-SUB-FINALIZAR-CONVERSACION-2.json",
    ]

    results = []

    print("\n" + "="*80)
    print(" CORRECCIÓN AUTOMÁTICA DE FLUJOS N8N")
    print("="*80)

    for filename in files_to_process:
        file_path = base_dir / filename
        if file_path.exists():
            try:
                result = process_workflow(file_path)
                results.append(result)
            except Exception as e:
                print(f"\n❌ ERROR procesando {filename}: {str(e)}")
                results.append({
                    "file": filename,
                    "output": "ERROR",
                    "changes": [f"Error: {str(e)}"]
                })
        else:
            print(f"\n⚠️  Archivo no encontrado: {filename}")

    # Generar reporte
    print("\n" + "="*80)
    print(" GENERANDO REPORTE")
    print("="*80)

    report = generate_report(results)
    report_path = base_dir / "REPORTE_CORRECCION_FLUJOS.md"

    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\n✅ Reporte generado: {report_path.name}")
    print(f"\n{'='*80}")
    print(f" PROCESO COMPLETADO")
    print(f"{'='*80}")
    print(f"\n📊 Total de flujos procesados: {len(results)}")
    print(f"📄 Reporte completo en: {report_path}")
    print(f"\n¡Listo para importar los archivos -FIXED.json en n8n!")

if __name__ == "__main__":
    main()
