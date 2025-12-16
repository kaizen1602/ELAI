#!/usr/bin/env python3
"""
Script para corregir TODOS los flujos n8n automáticamente
Reemplaza $env.BACKEND_URL por CONFIG y añade nodo CONFIG
"""

import json
import os
from pathlib import Path

# URL de ngrok actual
NGROK_URL = "https://e5d3dba10ea2.ngrok-free.app"

# Template del nodo CONFIG
CONFIG_NODE = {
    "parameters": {
        "jsCode": f'''const CONFIG = {{
  BACKEND_NGROK_URL: "{NGROK_URL}",
  NGROK_HEADER_NAME: "ngrok-skip-browser-warning",
  NGROK_HEADER_VALUE: "true",
  TELEFONO_CLINICA: "+573001234567"
}};

console.log('=== CONFIG CARGADA ===');
console.log('BACKEND_NGROK_URL:', CONFIG.BACKEND_NGROK_URL);

return {{
  json: {{
    ...CONFIG,
    ...$json
  }}
}};'''
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [0, 0],  # Se ajustará dinámicamente
    "id": "config-node-" + "generated",
    "name": "CONFIG"
}

def corregir_url_http(url_str):
    """Corrige URLs de HTTP nodes"""
    if not url_str:
        return url_str

    # Si usa $env.BACKEND_URL, reemplazar
    if "$env.BACKEND_URL" in url_str or "$env.WHATSAPP_API_URL" in url_str:
        # Extraer la ruta después de BACKEND_URL
        if "$env.BACKEND_URL" in url_str:
            parts = url_str.split("$env.BACKEND_URL")
            if len(parts) > 1:
                ruta = parts[1].strip('"}/')
                # Limpiar la ruta
                ruta = ruta.replace('{{', '').replace('}}', '').strip()
                return f"={{{{ $('CONFIG').item.json.BACKEND_NGROK_URL + '{ruta}' }}}}"

    # Si ya usa ={{ pero tiene =={{
    if url_str.startswith("={{"):
        url_str = url_str[1:]  # Quitar el = extra

    return url_str

def corregir_nodo_http(node):
    """Corrige un nodo HTTP Request"""
    if node.get("type") != "n8n-nodes-base.httpRequest":
        return False

    params = node.get("parameters", {})
    cambios = False

    # Corregir URL
    if "url" in params:
        url_original = params["url"]
        url_nueva = corregir_url_http(url_original)
        if url_original != url_nueva:
            params["url"] = url_nueva
            cambios = True
            print(f"  ✅ URL corregida en nodo '{node['name']}'")

    # Corregir authentication
    if params.get("authentication") == "predefinedCredentialType":
        params["authentication"] = "none"
        cambios = True

    # Añadir headers necesarios si faltan
    headers = params.get("headerParameters", {}).get("parameters", [])
    header_names = [h["name"] for h in headers]

    # Asegurar que tiene Authorization si necesita token
    if "Authorization" not in header_names:
        headers.append({
            "name": "Authorization",
            "value": "={{ 'Bearer ' + $('CONFIG').first().json.token }}"
        })
        cambios = True

    # Asegurar que tiene ngrok header
    if "ngrok-skip-browser-warning" not in header_names:
        headers.append({
            "name": "ngrok-skip-browser-warning",
            "value": "true"
        })
        cambios = True

    if "headerParameters" not in params:
        params["headerParameters"] = {}
    params["headerParameters"]["parameters"] = headers

    return cambios

def corregir_nodo_redis(node):
    """Corrige un nodo Redis"""
    if node.get("type") != "n8n-nodes-base.redis":
        return False

    params = node.get("parameters", {})

    # Si es operación publish y no tiene messageData
    if params.get("operation") == "publish" and "messageData" not in params:
        # Determinar el tipo de mensaje por el nombre del nodo
        nombre = node.get("name", "").lower()

        if "start" in nombre or "typing" in nombre:
            params["messageData"] = "={{ JSON.stringify({ action: 'start', session_id: $json.session_id || $('CONFIG').first().json.session_id, timestamp: Date.now() }) }}"
        else:
            params["messageData"] = "={{ JSON.stringify({ action: 'stop', session_id: $json.session_id || $('CONFIG').first().json.session_id, timestamp: Date.now() }) }}"

        print(f"  ✅ messageData añadido a Redis '{node['name']}'")
        return True

    return False

def añadir_nodo_config(workflow):
    """Añade nodo CONFIG si no existe"""
    nodes = workflow.get("nodes", [])

    # Verificar si ya tiene CONFIG
    for node in nodes:
        if node.get("name") == "CONFIG" or node.get("type") == "n8n-nodes-base.code":
            return False

    # Buscar el trigger node (primer nodo)
    trigger_node = None
    for node in nodes:
        if "trigger" in node.get("type", "").lower() or "start" in node.get("name", "").lower():
            trigger_node = node
            break

    if not trigger_node:
        return False

    # Crear CONFIG node
    config_node = CONFIG_NODE.copy()
    config_node["id"] = f"config-{workflow.get('id', 'unknown')}"

    # Posicionar CONFIG entre trigger y siguiente nodo
    trigger_pos = trigger_node.get("position", [0, 0])
    config_node["position"] = [trigger_pos[0] + 200, trigger_pos[1]]

    # Añadir al workflow
    nodes.insert(1, config_node)

    # Actualizar conexiones
    connections = workflow.get("connections", {})
    trigger_name = trigger_node.get("name")

    if trigger_name in connections:
        # Guardar conexión original del trigger
        conexion_original = connections[trigger_name]["main"][0][0]

        # Trigger → CONFIG
        connections[trigger_name] = {
            "main": [[{
                "node": "CONFIG",
                "type": "main",
                "index": 0
            }]]
        }

        # CONFIG → siguiente nodo original
        connections["CONFIG"] = {
            "main": [[conexion_original]]
        }

    print(f"  ✅ Nodo CONFIG añadido")
    return True

def corregir_flujo(filepath):
    """Corrige un flujo JSON"""
    print(f"\n📄 Procesando: {filepath.name}")

    with open(filepath, 'r', encoding='utf-8') as f:
        workflow = json.load(f)

    cambios = False

    # Añadir CONFIG si es necesario
    if añadir_nodo_config(workflow):
        cambios = True

    # Corregir todos los nodos
    for node in workflow.get("nodes", []):
        if corregir_nodo_http(node):
            cambios = True
        if corregir_nodo_redis(node):
            cambios = True

    if cambios:
        # Guardar archivo corregido
        output_path = filepath.parent / f"{filepath.stem}-CORREGIDO.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(workflow, f, indent=2, ensure_ascii=False)
        print(f"  💾 Guardado: {output_path.name}")
        return True
    else:
        print(f"  ℹ️  No necesita correcciones")
        return False

def main():
    """Procesar todos los flujos"""
    directorio = Path(__file__).parent
    archivos_json = sorted(directorio.glob("*.json"))

    # Excluir archivos ya corregidos
    archivos_json = [f for f in archivos_json if not f.stem.endswith("-CORREGIDO")]

    print("🚀 CORRECCIÓN MASIVA DE FLUJOS N8N")
    print(f"📁 Directorio: {directorio}")
    print(f"📊 Total archivos: {len(archivos_json)}\n")

    corregidos = 0
    for filepath in archivos_json:
        if corregir_flujo(filepath):
            corregidos += 1

    print(f"\n✅ COMPLETADO: {corregidos}/{len(archivos_json)} flujos corregidos")
    print(f"📁 Archivos generados: {directorio}/*-CORREGIDO.json")

if __name__ == "__main__":
    main()
