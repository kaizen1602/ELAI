
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_prompt():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    target_node_name = "AI Agent"
    found = False
    
    for node in nodes:
        if node.get('name') == target_node_name:
            found = True
            
            # Update the Prompt
            # Original prompt had: "ESTRUCTURA DE UNA CITA RETORNADA: ... slot_id: ..."
            # We want to emphasize using 'display_text'
            
            old_prompt = node['parameters']['text']
            
            if "display_text" not in old_prompt:
                # Append instruction
                instruction = """
## 🎨 PRESENTACIÓN DE CITAS (IMPORTANTE)
El sistema te devolverá un campo `display_text` para cada cita (ej: "🗓️ Lunes 9 Dic - 08:30 AM | 👨‍⚕️ Dr. Garcia").
**TU TAREA:**
1. Muestra al usuario ÚNICAMENTE ese texto amigable. No muestres IDs.
2. Numéralas ordenadamente (1, 2, 3...).
3. Si el usuario elige "la 1", busca internamente el `slot_id` correspondiente a la opción 1 y usa ese ID para agendar.

Ejemplo de respuesta ideal:
"Tengo estas citas disponibles para Medicina General:
1. 🗓️ Lunes 9 Dic - 08:30 AM | 👨‍⚕️ Dr. Garcia
2. 🗓️ Martes 10 Dic - 09:00 AM | 👨‍⚕️ Dra. Perez
¿Cuál te gustaría reservar?"
"""
                # Insert before "REGLA CRÍTICA" or append
                if "## 🚨 REGLA CRÍTICA" in old_prompt:
                     node['parameters']['text'] = old_prompt.replace("## 🚨 REGLA CRÍTICA", instruction + "\n\n## 🚨 REGLA CRÍTICA")
                elif "## \ud83d\udea8 REGLA CR\u00cdTICA" in old_prompt: # The unicode version in file
                     node['parameters']['text'] = old_prompt.replace("## \ud83d\udea8 REGLA CR\u00cdTICA", instruction + "\n\n## \ud83d\udea8 REGLA CR\u00cdTICA")
                else:
                    node['parameters']['text'] = old_prompt + "\n" + instruction
                
                print("Updated AI Agent prompt with display_text instructions.")
            else:
                 print("Prompt already contains display_text instructions.")
            break
            
    if not found:
        print(f"Error: Node '{target_node_name}' not found.")
        return

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully patched AI Agent Prompt in 01-principal.json")

if __name__ == "__main__":
    fix_workflow_01_prompt()
