#!/usr/bin/env python3
"""
Script para actualizar flujos N8N con:
1. Nueva URL de ngrok
2. N8N_WEBHOOK_SECRET en CONFIG
3. Header x-webhook-secret en todos los HTTP Requests
"""
import json
import os
import re
from pathlib import Path
from typing import Dict, Any, List

# Configuración
OLD_URL = "https://e5d3dba10ea2.ngrok-free.app"
NEW_URL = "https://5e3708b60e02.ngrok-free.app"
N8N_WEBHOOK_SECRET = "TuSecretoSuperSeguro123"

def actualizar_config_node(node: Dict[str, Any]) -> bool:
    """Actualiza el nodo CONFIG agregando N8N_WEBHOOK_SECRET"""
    if node.get("name") in ["CONFIG", "config"]:
        params = node.get("parameters", {})
        js_code = params.get("jsCode", "")

        # Verificar si ya tiene N8N_WEBHOOK_SECRET
        if "N8N_WEBHOOK_SECRET" in js_code:
            print(f"    ℹ️  CONFIG ya tiene N8N_WEBHOOK_SECRET")
            return False

        # Buscar el objeto CONFIG y agregar el secret
        if "const CONFIG = {" in js_code:
            # Insertar N8N_WEBHOOK_SECRET después de BACKEND_NGROK_URL
            lines = js_code.split('\n')
            new_lines = []
            for line in lines:
                new_lines.append(line)
                if 'NGROK_HEADER_VALUE:' in line:
                    # Agregar N8N_WEBHOOK_SECRET después de NGROK_HEADER_VALUE
                    indent = len(line) - len(line.lstrip())
                    new_lines.append(' ' * indent + f'N8N_WEBHOOK_SECRET: "{N8N_WEBHOOK_SECRET}",')

            node["parameters"]["jsCode"] = '\n'.join(new_lines)
            print(f"    ✅ CONFIG actualizado con N8N_WEBHOOK_SECRET")
            return True

    return False

def actualizar_http_request_node(node: Dict[str, Any]) -> bool:
    """Actualiza nodos HTTP Request agregando header x-webhook-secret"""
    if node.get("type") != "n8n-nodes-base.httpRequest":
        return False

    params = node.get("parameters", {})
    url = params.get("url", "")

    # Endpoints que requieren el header x-webhook-secret
    endpoints_que_requieren_auth = [
        "/api/v1/whatsapp/send",
        "/api/v1/whatsapp/typing",
        "/api/v1/whatsapp/conversation",
        "/api/v1/whatsapp/context",
        "/api/v1/whatsapp/validate-patient",
        "/api/v1/conversaciones/",  # Crear conversación
        "/api/v1/slots/lock",
        "/api/v1/slots/unlock",
        "/api/v1/citas/create",
        "/api/v1/ai-usage/log",
        "/api/v1/ai-usage/can-use"
    ]

    # Verificar si la URL requiere autenticación
    requiere_auth = any(endpoint in url for endpoint in endpoints_que_requieren_auth)

    if not requiere_auth:
        return False

    # Verificar si ya tiene el header
    header_params = params.get("headerParameters", {})
    headers = header_params.get("parameters", [])

    tiene_header = any(
        h.get("name") == "x-webhook-secret"
        for h in headers
    )

    if tiene_header:
        print(f"    ℹ️  Nodo '{node.get('name')}' ya tiene x-webhook-secret")
        return False

    # Agregar el header
    nuevo_header = {
        "name": "x-webhook-secret",
        "value": "={{ $('CONFIG').item.json.N8N_WEBHOOK_SECRET }}"
    }

    headers.append(nuevo_header)

    # Asegurar que la estructura esté correcta
    if "headerParameters" not in params:
        params["headerParameters"] = {}
    params["headerParameters"]["parameters"] = headers
    params["sendHeaders"] = True

    node["parameters"] = params
    print(f"    ✅ Header x-webhook-secret agregado a '{node.get('name')}'")
    return True

def limpiar_espacios_url(contenido: str) -> str:
    """Elimina espacios en blanco antes de URLs https://"""
    # Eliminar espacios antes de https:// en valores de strings
    contenido = re.sub(r':\s+"(\s+https://)', r': "\1', contenido)
    contenido = re.sub(r'BACKEND_NGROK_URL:\s+"\s+https://', r'BACKEND_NGROK_URL: "https://', contenido)
    contenido = re.sub(r'"\s+https://', r'"https://', contenido)
    return contenido

def actualizar_archivo(archivo_path: Path) -> bool:
    """Actualiza un archivo JSON de N8N"""
    try:
        # Leer archivo
        with open(archivo_path, 'r', encoding='utf-8') as f:
            contenido = f.read()

        # Reemplazar URL vieja por nueva
        contenido_nuevo = contenido.replace(OLD_URL, NEW_URL)

        # Limpiar espacios en URLs
        contenido_nuevo = limpiar_espacios_url(contenido_nuevo)

        # Parsear JSON
        try:
            data = json.loads(contenido_nuevo)
        except json.JSONDecodeError as e:
            print(f"  ❌ Error parseando JSON: {e}")
            return False

        # Actualizar nodos
        cambios_config = 0
        cambios_headers = 0

        if "nodes" in data:
            for node in data["nodes"]:
                if actualizar_config_node(node):
                    cambios_config += 1
                if actualizar_http_request_node(node):
                    cambios_headers += 1

        # Si hubo cambios, escribir archivo
        if contenido != contenido_nuevo or cambios_config > 0 or cambios_headers > 0:
            with open(archivo_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print(f"\n  ✅ ACTUALIZADO: {archivo_path.name}")
            if OLD_URL in contenido:
                print(f"     - URL actualizada: {OLD_URL} → {NEW_URL}")
            if cambios_config > 0:
                print(f"     - CONFIG actualizado con N8N_WEBHOOK_SECRET")
            if cambios_headers > 0:
                print(f"     - {cambios_headers} nodo(s) con header x-webhook-secret agregado")
            return True
        else:
            print(f"\n  ℹ️  Sin cambios: {archivo_path.name}")
            return False

    except Exception as e:
        print(f"\n  ❌ Error procesando {archivo_path.name}: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    base_dir = Path(__file__).parent

    print(f"\n{'='*70}")
    print(f"🔧 ACTUALIZADOR DE FLUJOS N8N")
    print(f"{'='*70}\n")
    print(f"Configuración:")
    print(f"  URL VIEJA: {OLD_URL}")
    print(f"  URL NUEVA: {NEW_URL}")
    print(f"  SECRET:    {N8N_WEBHOOK_SECRET}")
    print(f"  Directorio: {base_dir}\n")

    # Buscar archivos JSON principales (excluir versiones antiguas)
    archivos = [
        f for f in base_dir.glob("*.json")
        if not f.name.startswith(".") and f.is_file()
    ]

    # Filtrar solo los flujos principales (números del 01 al 10)
    archivos_principales = [
        f for f in archivos
        if re.match(r'^\d{2}-.*\.json$', f.name)
    ]

    print(f"Archivos encontrados: {len(archivos_principales)}\n")
    print(f"{'='*70}\n")

    actualizados = 0
    sin_cambios = 0
    errores = 0

    for archivo in sorted(archivos_principales):
        print(f"📄 Procesando: {archivo.name}")
        resultado = actualizar_archivo(archivo)
        if resultado is True:
            actualizados += 1
        elif resultado is False:
            sin_cambios += 1
        else:
            errores += 1

    print(f"\n{'='*70}")
    print(f"📊 RESUMEN")
    print(f"{'='*70}")
    print(f"✅ Archivos actualizados: {actualizados}")
    print(f"ℹ️  Sin cambios: {sin_cambios}")
    print(f"❌ Errores: {errores}")
    print(f"{'='*70}\n")

    if actualizados > 0:
        print(f"✅ ¡LISTO! Los flujos han sido actualizados.")
        print(f"\n📝 PRÓXIMOS PASOS:")
        print(f"   1. Revisa los archivos actualizados")
        print(f"   2. Importa los flujos en N8N (si es necesario)")
        print(f"   3. Prueba los endpoints\n")
    else:
        print(f"ℹ️  No se requirieron cambios en los flujos.\n")

if __name__ == "__main__":
    main()
