-- Add indexes for better query performance

-- Pacientes indexes
CREATE INDEX IF NOT EXISTS "pacientes_numeroDocumento_idx" ON "pacientes"("numeroDocumento");
CREATE INDEX IF NOT EXISTS "pacientes_entidadMedicaId_activo_idx" ON "pacientes"("entidadMedicaId", "activo");
CREATE INDEX IF NOT EXISTS "pacientes_email_idx" ON "pacientes"("email");

-- Medicos indexes
CREATE INDEX IF NOT EXISTS "medicos_entidadMedicaId_activo_idx" ON "medicos"("entidadMedicaId", "activo");
CREATE INDEX IF NOT EXISTS "medicos_especialidadId_idx" ON "medicos"("especialidadId");

-- Agendas indexes
CREATE INDEX IF NOT EXISTS "agendas_medicoId_activa_idx" ON "agendas"("medicoId", "activa");
CREATE INDEX IF NOT EXISTS "agendas_entidadMedicaId_activa_idx" ON "agendas"("entidadMedicaId", "activa");

-- Slots indexes
CREATE INDEX IF NOT EXISTS "slots_agendaId_fecha_estado_idx" ON "slots"("agendaId", "fecha", "estado");
CREATE INDEX IF NOT EXISTS "slots_fecha_estado_idx" ON "slots"("fecha", "estado");

-- Citas indexes
CREATE INDEX IF NOT EXISTS "citas_pacienteId_estado_idx" ON "citas"("pacienteId", "estado");
CREATE INDEX IF NOT EXISTS "citas_estado_createdAt_idx" ON "citas"("estado", "createdAt");

-- Conversaciones indexes
CREATE INDEX IF NOT EXISTS "conversaciones_entidadMedicaId_estado_idx" ON "conversaciones"("entidadMedicaId", "estado");
CREATE INDEX IF NOT EXISTS "conversaciones_pacienteId_idx" ON "conversaciones"("pacienteId");

-- Mensajes indexes
CREATE INDEX IF NOT EXISTS "mensajes_conversacionId_createdAt_idx" ON "mensajes"("conversacionId", "createdAt");
