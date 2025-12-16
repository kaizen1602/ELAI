
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/backend/src/modules/slots/slots.dto.ts"

def fix_slots_dto():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Target: queryAvailableSlotsSchema
    # We want to change:
    #   agendaId: z.string().cuid('agendaId must be a valid CUID'),
    # to:
    #   agendaId: z.string().cuid().optional(),
    #   entidadMedicaId: z.string().cuid().optional(),
    #   categoria: z.string().optional(),
    
    target_block_start = "export const queryAvailableSlotsSchema = z.object({"
    
    if target_block_start in content:
        # We'll replace the whole block because it's safer than regex replacement on multiline
        old_block = """export const queryAvailableSlotsSchema = z.object({
  agendaId: z.string().cuid('agendaId must be a valid CUID'),
  fecha: z.coerce.date().optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
});"""
        
        new_block = """export const queryAvailableSlotsSchema = z.object({
  agendaId: z.string().cuid('agendaId must be a valid CUID').optional(),
  entidadMedicaId: z.string().cuid().optional(),
  categoria: z.string().optional(),
  fecha: z.coerce.date().optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
});"""
        
        if old_block in content:
            new_content = content.replace(old_block, new_block)
            with open(FILE_PATH, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("Successfully updated queryAvailableSlotsSchema in slots.dto.ts")
        else:
            print("Could not find exact schema block match. Manual inspection required.")
    else:
        print(f"Error: Could not find schema definition in {FILE_PATH}")

if __name__ == "__main__":
    fix_slots_dto()
