
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/backend/src/modules/slots/slots.routes.ts"

def fix_slots_routes_v2():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already patched
    if "router.get('/:id/bot'" in content:
        print("slots.routes.ts already contains /:id/bot route.")
        return

    # Logic: Insert the new route AFTER the available-bot route we added previously
    # Or just before "router.use(authenticate);" 
    
    insert_marker = "router.use(authenticate);"
    
    new_route_code = """
router.get('/:id/bot', validateN8NWebhook, slotsController.findById);
"""
    
    if insert_marker in content:
        # We find the last convenience place. 
        # Ideally, we put it alongside the other bot route.
        # But safely, inserting before authentication middleware works.
        
        new_content = content.replace(insert_marker, new_route_code + insert_marker)
        
        with open(FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print("Successfully added /:id/bot route to slots.routes.ts")
    else:
        print(f"Error: Could not find insert marker '{insert_marker}' in {FILE_PATH}")

if __name__ == "__main__":
    fix_slots_routes_v2()
