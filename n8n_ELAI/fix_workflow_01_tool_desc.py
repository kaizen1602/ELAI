import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_tool_description():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "tool_agendar_cita":
            print("Found tool_agendar_cita. Updating description...")
            
            # Make the description SUPER explicit about what parameters to send
            new_description = """EJECUTA INMEDIATAMENTE cuando el usuario elija una cita.

PARÁMETROS REQUERIDOS:
1. slot_id: El CUID completo del slot (ej: "cmiyv55bl0021uv2goya48q4j")
   - Búscalo en tu mapa mental según la posición que el usuario eligió
   - Si usuario dice "la 1", usa el slot_id de la posición 1
   - Si usuario dice "la 2", usa el slot_id de la posición 2
   - NUNCA uses el número de posición como slot_id
   - NUNCA uses la hora como slot_id
   
2. motivo_consulta: Texto descriptivo (default: "Consulta programada")

EJEMPLO DE LLAMADA CORRECTA:
Usuario dice: "quiero la 2"
Tu mapa mental: POSICIÓN 2 = "cl93nsjf0001b6gl3g4pet2k"
Llamas a la herramienta con:
{
  "slot_id": "cl93nsjf0001b6gl3g4pet2k",
  "motivo_consulta": "Consulta programada"
}

EJEMPLO DE LLAMADA INCORRECTA ❌:
{
  "slot_id": "2"  ← MAL! Esto causará error
}

El contexto proveerá automáticamente: paciente_id, session_id, token."""

            node['parameters']['description'] = new_description
            print("Updated tool description with explicit parameter instructions")
    
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 01-principal.json")

if __name__ == "__main__":
    fix_workflow_01_tool_description()
