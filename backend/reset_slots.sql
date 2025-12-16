-- Script para resetear todos los slots a DISPONIBLE
-- Esto es útil para testing

-- 1. Eliminar todas las citas de prueba
DELETE FROM "Cita" WHERE "createdAt" > '2025-12-09';

-- 2. Resetear todos los slots a DISPONIBLE
UPDATE "Slot" 
SET "estado" = 'DISPONIBLE' 
WHERE "fecha" >= CURRENT_DATE;

-- 3. Eliminar locks de slots
DELETE FROM "SlotLock" WHERE "expiresAt" < NOW();

-- Verificar resultados
SELECT 
  "id",
  "fecha",
  "horaInicio",
  "estado",
  (SELECT COUNT(*) FROM "Cita" WHERE "slotId" = "Slot"."id") as "tiene_cita"
FROM "Slot"
WHERE "fecha" >= CURRENT_DATE
ORDER BY "fecha", "horaInicio"
LIMIT 20;
