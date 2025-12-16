import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_simplify_prompt():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    for node in nodes:
        if node.get('name') == "AI Agent":
            print("Found AI Agent. Simplifying prompt...")
            prompt = node['parameters']['text']
            
            # Remove ALL anti-loop rules that are causing problems
            rules_to_remove = [
                "## 🔴 REGLA ANTI-BUCLE (OBLIGATORIA)",
                "## 🚫 REGLA: NO RE-CONSULTAR",
                "## ⛔ MANEJO DE HORARIOS NO DISPONIBLES (CRÍTICO)"
            ]
            
            for rule_header in rules_to_remove:
                if rule_header in prompt:
                    # Find the start of this section
                    start_idx = prompt.find(rule_header)
                    # Find the next ## header (or end of string)
                    next_header_idx = prompt.find("\n## ", start_idx + len(rule_header))
                    
                    if next_header_idx == -1:
                        # This is the last section, remove to end
                        # But check if there's content after that we want to keep
                        # Actually, let's be more surgical - find the next major section
                        next_header_idx = prompt.find("\n\n## ", start_idx + len(rule_header))
                    
                    if next_header_idx > start_idx:
                        # Remove this section
                        prompt = prompt[:start_idx] + prompt[next_header_idx:]
                        print(f"Removed section: {rule_header}")
            
            # Add ONE simple, clear rule instead
            simple_rule = """
## ⚡ REGLA SIMPLE DE AGENDAMIENTO

Cuando el usuario elija una cita de la lista que mostraste:
1. Identifica qué posición eligió (1, 2, 3, 4, o 5)
2. Busca el slot_id correspondiente en tu memoria
3. Llama INMEDIATAMENTE a tool_agendar_cita con ese slot_id

Ejemplos:
- Usuario: "la 1" → Llamas tool_agendar_cita(slot_id=<el CUID de la posición 1>)
- Usuario: "la de las 8:30" → Identificas que es la posición 1 → Llamas tool_agendar_cita(slot_id=<CUID>)
- Usuario: "quiero la primera" → Es la posición 1 → Llamas tool_agendar_cita(slot_id=<CUID>)

NO preguntes nada más. NO vuelvas a listar. AGENDA INMEDIATAMENTE.

"""
            
            # Insert the simple rule right after "REGLAS PRIORITARIAS DE EJECUCIÓN"
            marker = "## ⚠️ REGLAS PRIORITARIAS DE EJECUCIÓN"
            if marker in prompt:
                # Find the end of that section (next ## header)
                marker_idx = prompt.find(marker)
                next_section_idx = prompt.find("\n\n## ", marker_idx + len(marker))
                
                if next_section_idx > marker_idx:
                    # Insert our simple rule before the next section
                    prompt = prompt[:next_section_idx] + "\n" + simple_rule + prompt[next_section_idx:]
                    print("Inserted simple agendamiento rule")
            
            node['parameters']['text'] = prompt
    
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully simplified 01-principal.json prompt")

if __name__ == "__main__":
    fix_workflow_01_simplify_prompt()
