#!/bin/bash

# Crear carpeta de respaldo
mkdir -p versiones_antiguas

# Archivos a CONSERVAR (versiones finales funcionales)
CONSERVAR=(
  "01-WORKFLOW-PRINCIPAL-ESCALABLE-V3-DECISION-EXPLICITA.json"
  "02-SUB-VALIDAR-PACIENTE-V2-OPTIMIZED-FINAL.json"
  "03-SUB-CREAR-CONVERSACION-2-CORREGIDO.json"
  "04-SUB-CLASIFICAR-SINTOMAS-V3-FIXED-2.json"
  "05-Consultar_citas-CORREGIDO.json"
  "06-SUB-AGENDAR-CITA-OPTIMIZED-FINAL.json"
  "07-SUB-LISTAR-CITAS-ACTIVAS-CORREGIDO-5-CORREGIDO.json"
  "08-SUB-CONFIRMAR-CANCELACION-CORREGIDO-4-CORREGIDO.json"
  "09-SUB-ACTUALIZAR-CONTEXTO-CONVERSACION-2-CORREGIDO.json"
  "10-SUB-FINALIZAR-CONVERSACION-2-CORREGIDO.json"
  "FLUJO_CORREGIDO.json"
)

# Mover todos los JSON a la carpeta de respaldo
mv *.json versiones_antiguas/ 2>/dev/null

# Restaurar solo los archivos a conservar
for archivo in "${CONSERVAR[@]}"; do
  if [ -f "versiones_antiguas/$archivo" ]; then
    mv "versiones_antiguas/$archivo" .
    echo "✅ Conservado: $archivo"
  else
    echo "⚠️  No encontrado: $archivo"
  fi
done

echo ""
echo "📊 Resumen:"
echo "  - Archivos conservados: $(ls -1 *.json 2>/dev/null | wc -l)"
echo "  - Archivos movidos a versiones_antiguas: $(ls -1 versiones_antiguas/*.json 2>/dev/null | wc -l)"
echo ""
echo "✅ Limpieza completada"
