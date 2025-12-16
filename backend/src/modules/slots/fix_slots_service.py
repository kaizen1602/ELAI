
import os

FILE_PATH = "/Users/kaizen1602/FeriaSoftware/ELAI/backend/src/modules/slots/slots.service.ts"

def fix_slots_service():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Target: getAvailableSlots method
    # We will replace the beginning of the method to handle filters
    
    target_start = "async getAvailableSlots(query: QueryAvailableSlotsDTO) {"
    
    # New logic:
    # Handle agendaId (optional)
    # Handle entidadMedicaId (optional)
    # Handle categoria (optional, -> agenda.medico.especialidad.nombre contains)
    
    old_logic_snippet = """    const { agendaId, fecha, fechaInicio, fechaFin } = query;

    const where: any = {
      agendaId,
      estado: 'DISPONIBLE',
    };"""

    new_logic_snippet = """    const { agendaId, entidadMedicaId, categoria, fecha, fechaInicio, fechaFin } = query;

    const where: any = {
      estado: 'DISPONIBLE',
    };

    if (agendaId) {
      where.agendaId = agendaId;
    } else if (entidadMedicaId) {
      // Filter filtering by Entity and optionally Category
      where.agenda = {
        entidadMedicaId,
        activa: true
      };

      if (categoria) {
        where.agenda.medico = {
            especialidad: {
                nombre: { contains: categoria, mode: 'insensitive' }
            }
        };
      }
    }"""
    
    if old_logic_snippet in content:
        new_content = content.replace(old_logic_snippet, new_logic_snippet)
        with open(FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully patched getAvailableSlots logic instructions slots.service.ts")
    else:
        print("Could not find exact logic snippet. Manual patch required.")
        # Debug print
        # print(content[content.find("getAvailableSlots"):content.find("return await prisma")])

if __name__ == "__main__":
    fix_slots_service()
