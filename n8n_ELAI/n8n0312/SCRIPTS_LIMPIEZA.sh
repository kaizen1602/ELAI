#!/bin/bash

echo "=========================================="
echo "LIMPIEZA COMPLETA DEL SISTEMA"
echo "=========================================="
echo ""

echo "📦 PASO 1: Limpiando conversaciones y citas..."
docker-compose exec backend python manage.py shell << 'EOF'
from accounts.models import ConversacionWhatsApp, Cita, Slot
from datetime import datetime, timedelta

# Eliminar conversaciones
count_conv = ConversacionWhatsApp.objects.count()
ConversacionWhatsApp.objects.all().delete()
print(f"✅ {count_conv} conversaciones eliminadas")

# Eliminar citas recientes (últimas 24 horas)
citas_recientes = Cita.objects.filter(created_at__gte=datetime.now() - timedelta(days=1))
count_citas = citas_recientes.count()
citas_recientes.delete()
print(f"✅ {count_citas} citas eliminadas")

# Liberar todos los slots
Slot.objects.all().update(disponible=True)
print("✅ Todos los slots marcados como disponibles")
EOF

echo ""
echo "🗄️  PASO 2: Limpiando Redis..."
docker-compose exec redis redis-cli FLUSHALL > /dev/null
echo "✅ Redis limpiado completamente"

echo ""
echo "🔍 PASO 3: Verificando limpieza..."
docker-compose exec backend python manage.py shell << 'EOF'
from accounts.models import ConversacionWhatsApp, Cita

conv_count = ConversacionWhatsApp.objects.count()
citas_count = Cita.objects.count()

print(f"📊 Estado actual:")
print(f"   - Conversaciones: {conv_count}")
print(f"   - Citas: {citas_count}")

if conv_count == 0 and citas_count == 0:
    print("\n✅ ¡Sistema limpio y listo para probar!")
else:
    print("\n⚠️ Advertencia: Aún hay datos en el sistema")
EOF

echo ""
echo "=========================================="
echo "✅ LIMPIEZA COMPLETADA"
echo "=========================================="
echo ""
echo "🚀 Ahora puedes probar el flujo:"
echo "   1. Envía 'hola' por WhatsApp"
echo "   2. Envía tu cédula: 1108252740"
echo "   3. Envía síntomas: 'tengo dolor de cabeza'"
echo "   4. Elige cita: 'quiero la 3'"
echo ""
