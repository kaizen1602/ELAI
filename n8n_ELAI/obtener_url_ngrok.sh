#!/bin/bash

# Script para obtener la URL actual de ngrok

echo "🔍 Obteniendo URL de ngrok..."
echo ""

# Método 1: Desde API de ngrok (puerto 4040)
URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url')

if [ -n "$URL" ] && [ "$URL" != "null" ]; then
    echo "✅ URL actual de ngrok:"
    echo ""
    echo -e "\033[1;32m$URL\033[0m"
    echo ""
    echo "📋 Copiar esta URL e ir a N8n Cloud:"
    echo "   Settings → Environment Variables → BACKEND_NGROK_URL"
    echo "   Actualizar valor: $URL"
    echo ""
    echo "🧪 Para probar:"
    echo "   curl $URL/api/v1/health/ -H \"ngrok-skip-browser-warning: true\""
else
    echo "❌ ngrok no está corriendo o no responde"
    echo ""
    echo "🔧 Solución:"
    echo "   docker-compose up -d ngrok"
    echo "   (desde /Users/kaizen1602/proyectoSophia/sophia)"
fi



