
import os

CONTROLLER_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/backend/src/modules/slots/slots.controller.ts"
SERVICE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/backend/src/modules/slots/slots.service.ts"

def add_logs():
    # 1. Controller Logs
    if os.path.exists(CONTROLLER_PATH):
        with open(CONTROLLER_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Inject log at start of findById
        target = "findById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {"
        log_line = "\n    console.log('🔍 [SlotsController] findById requested:', req.params.id);"
        
        if log_line not in content:
            content = content.replace(target, target + log_line)
            with open(CONTROLLER_PATH, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Added log to SlotsController.findById")

    # 2. Service Logs
    if os.path.exists(SERVICE_PATH):
        with open(SERVICE_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Inject log at start of findById
        target = "async findById(id: string) {"
        log_line = "\n    console.log('🔍 [SlotsService] findById searching for:', id);"
        
        if log_line not in content:
            content = content.replace(target, target + log_line)
            with open(SERVICE_PATH, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Added log to SlotsService.findById")

if __name__ == "__main__":
    add_logs()
