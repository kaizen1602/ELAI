
import json
import os
import uuid

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/n8n_ELAI/06-sub-agendar-cita.json"

def force_new_workflow_06():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Change ID to a brand new random UUID
    new_id = str(uuid.uuid4())
    data['id'] = new_id
    
    # 2. Change Name to be distinct
    data['name'] = "06-SUB-AGENDAR-CITA-FINAL-CLEAN"
    
    # 3. Ensure connections are clean (Redundant check, but good for safety)
    connections = data.get('connections', {})
    if 'When Executed by Another Workflow' in connections:
         connections['When Executed by Another Workflow'] = {
            "main": [
                [
                    {
                        "node": "CONFIG",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        }
    
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"Generated NEW Workflow 06 with ID: {new_id}")
    print("Name updated to: 06-SUB-AGENDAR-CITA-FINAL-CLEAN")

if __name__ == "__main__":
    force_new_workflow_06()
