#!/usr/bin/env python3
"""
Script para actualizar automáticamente la URL de ngrok en todos los flujos N8N.
Detecta la URL actual de ngrok y actualiza todos los archivos JSON.

Uso:
    python3 update_ngrok_url.py           # Detecta automáticamente
    python3 update_ngrok_url.py URL       # Usa URL específica
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any

# Configuración
N8N_WEBHOOK_SECRET = "TuSecretoSuperSeguro123"
TELEFONO_CLINICA = "(601) 123-4567"


def get_current_ngrok_url() -> Optional[str]:
    """Obtiene la URL actual de ngrok desde la API local."""
    try:
        import urllib.request
        response = urllib.request.urlopen('http://localhost:4040/api/tunnels', timeout=5)
        data = json.loads(response.read().decode())
        tunnels = data.get('tunnels', [])
        for tunnel in tunnels:
            url = tunnel.get('public_url', '')
            if url.startswith('https://'):
                return url
    except Exception as e:
        print(f"  No se pudo obtener URL de ngrok automáticamente: {e}")
    return None


def find_existing_ngrok_urls(content: str) -> List[str]:
    """Encuentra todas las URLs de ngrok existentes en el contenido."""
    pattern = r'https://[a-z0-9]+\.ngrok-free\.app'
    return list(set(re.findall(pattern, content)))


def update_config_node(content: str, new_url: str) -> str:
    """Actualiza el nodo CONFIG con la nueva URL."""
    # Patrón para encontrar BACKEND_NGROK_URL en jsCode
    pattern = r'(BACKEND_NGROK_URL:\s*["\'])https?://[^"\']+(["\'])'
    replacement = f'\\1{new_url}\\2'
    return re.sub(pattern, replacement, content)


def clean_url_spaces(content: str) -> str:
    """Elimina espacios antes de URLs https://."""
    content = re.sub(r'BACKEND_NGROK_URL:\s*"\s+https://', 'BACKEND_NGROK_URL: "https://', content)
    content = re.sub(r'"\s+https://', '"https://', content)
    return content


def update_workflow_file(file_path: Path, new_url: str, old_urls: List[str]) -> Dict[str, Any]:
    """Actualiza un archivo de flujo N8N."""
    result = {
        'file': file_path.name,
        'updated': False,
        'old_urls': [],
        'changes': []
    }

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        content = original_content

        # Encontrar URLs existentes
        existing_urls = find_existing_ngrok_urls(content)

        # Reemplazar URLs antiguas
        for old_url in old_urls + existing_urls:
            if old_url != new_url and old_url in content:
                content = content.replace(old_url, new_url)
                result['old_urls'].append(old_url)
                result['changes'].append(f"URL: {old_url} -> {new_url}")

        # Actualizar CONFIG node específicamente
        content = update_config_node(content, new_url)

        # Limpiar espacios
        content = clean_url_spaces(content)

        # Verificar si hubo cambios
        if content != original_content:
            # Validar JSON
            try:
                data = json.loads(content)
                # Escribir con formato bonito
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                result['updated'] = True
            except json.JSONDecodeError as e:
                result['error'] = f"JSON inválido: {e}"
                return result

    except Exception as e:
        result['error'] = str(e)

    return result


def main():
    base_dir = Path(__file__).parent

    print(f"\n{'='*70}")
    print(f"  ACTUALIZADOR DE FLUJOS N8N - URL NGROK")
    print(f"{'='*70}\n")

    # Obtener nueva URL
    if len(sys.argv) > 1:
        new_url = sys.argv[1].strip()
        print(f"  Usando URL proporcionada: {new_url}")
    else:
        print("  Detectando URL de ngrok...")
        new_url = get_current_ngrok_url()
        if not new_url:
            print("\n  ERROR: No se pudo detectar la URL de ngrok.")
            print("  Asegúrate de que ngrok esté corriendo o proporciona la URL manualmente:")
            print(f"    python3 {sys.argv[0]} https://TU_URL.ngrok-free.app")
            sys.exit(1)
        print(f"  URL detectada: {new_url}")

    # Validar formato de URL
    if not re.match(r'https://[a-z0-9]+\.ngrok-free\.app', new_url):
        print(f"\n  ERROR: URL inválida: {new_url}")
        print("  El formato debe ser: https://XXXXXX.ngrok-free.app")
        sys.exit(1)

    print(f"\n  Configuración:")
    print(f"    Nueva URL: {new_url}")
    print(f"    Directorio: {base_dir}")

    # Buscar archivos JSON (flujos numerados)
    workflow_files = sorted([
        f for f in base_dir.glob("*.json")
        if re.match(r'^\d{2}-.*\.json$', f.name) and f.is_file()
    ])

    print(f"\n  Flujos encontrados: {len(workflow_files)}")
    print(f"\n{'='*70}\n")

    # URLs antiguas conocidas
    known_old_urls = [
        "https://e5d3dba10ea2.ngrok-free.app",
        "https://5e3708b60e02.ngrok-free.app"
    ]

    # Procesar archivos
    updated = 0
    unchanged = 0
    errors = 0

    for wf_file in workflow_files:
        print(f"  Procesando: {wf_file.name}")
        result = update_workflow_file(wf_file, new_url, known_old_urls)

        if result.get('error'):
            print(f"    ERROR: {result['error']}")
            errors += 1
        elif result['updated']:
            print(f"    ACTUALIZADO")
            for change in result['changes']:
                print(f"      - {change}")
            updated += 1
        else:
            print(f"    Sin cambios (ya tiene la URL correcta)")
            unchanged += 1

    print(f"\n{'='*70}")
    print(f"  RESUMEN")
    print(f"{'='*70}")
    print(f"    Actualizados: {updated}")
    print(f"    Sin cambios:  {unchanged}")
    print(f"    Errores:      {errors}")
    print(f"{'='*70}\n")

    if updated > 0:
        print("  LISTO! Los flujos han sido actualizados.")
        print("\n  PRÓXIMOS PASOS:")
        print("    1. Reimporta los flujos en N8N si es necesario")
        print("    2. Activa los workflows")
        print("    3. Prueba con un mensaje de WhatsApp")

    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
