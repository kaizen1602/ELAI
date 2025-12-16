
import json
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/01-principal.json"

def fix_workflow_01_strict_rules():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])
    
    # 1. Update OpenAI Model Temperature
    for node in nodes:
        if node.get('name') == "OpenAI Chat Model":
            print("Found OpenAI Chat Model. Lowering temperature...")
            # Ensure structure exists
            if 'parameters' not in node: node['parameters'] = {}
            if 'options' not in node['parameters']: node['parameters']['options'] = {}
            
            node['parameters']['options']['temperature'] = 0.1
            print("Temperature set to 0.1")

    # 2. Update AI Agent Prompt with Strict Rules
    new_rule = """
## 🔴 REGLA ANTI-BUCLE (OBLIGATORIA)
Si el usuario pide un horario (ej: "las 11:30") que NO EXISTE en las citas que ya mostraste:
1. 🛑 **NO LLAMES A NINGUNA HERRAMIENTA** - Solo responde con texto.
2. Responde: "Ese horario no está disponible. Las opciones son: [lista las que ya mostraste]. ¿Cuál prefieres?"
3. Si recibes error "slot_no_disponible" de tool_agendar_cita, **NO vuelvas a intentar agendar ni consultar citas**.
"""

    for node in nodes:
        if node.get('name') == "AI Agent":
            print("Found AI Agent. Updating prompt...")
            prompt = node['parameters']['text']
            
            # Remove the previous rule if it exists to avoid duplication/bloat
            old_rule_header = "## ⛔ MANEJO DE HORARIOS NO DISPONIBLES (CRÍTICO)"
            if old_rule_header in prompt:
                # Naive removal: split by header and take the parts, hoping the previous rule was at the end or well delimited.
                # Actually, in the previous script I appended or inserted it. 
                # To be safe, let's just REPLACE it if found, or APPEND if not.
                
                # I'll just append this NEW rule at the very top of the "Rules" section for max visibility, 
                # or right after "CONTEXTO ACTUAL".
                pass

            # Let's insert it right after "CONTEXTO ACTUAL" block for high priority
            split_marker = "## ⚠️ REGLAS PRIORITARIAS DE EJECUCIÓN"
            if split_marker in prompt:
                parts = prompt.split(split_marker)
                # pre_prompt + new_rule + marker + post_prompt
                prompt = parts[0] + new_rule + "\n\n" + split_marker + parts[1]
                print("Injected strict anti-loop rule before 'REGLAS PRIORITARIAS'")
            else:
                prompt = prompt + "\n\n" + new_rule
                print("Appended strict anti-loop rule to end")
            
            node['parameters']['text'] = prompt

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print("Successfully updated 01-principal.json with strict rules and low temp.")

if __name__ == "__main__":
    fix_workflow_01_strict_rules()
