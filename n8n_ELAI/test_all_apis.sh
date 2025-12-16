#!/bin/bash

# Script para probar todas las APIs del backend
# Fecha: 28 de Octubre, 2025

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
NGROK_URL="https://c61c848cfc22.ngrok-free.app"
TOKEN=""
PACIENTE_ID=""
CONVERSACION_ID=""
CITA_ID=""

echo "=========================================="
echo "🧪 TESTING ALL BACKEND APIs"
echo "=========================================="
echo ""

# TEST 1: Health Check
echo "✅ TEST 1: Health Check"
response=$(curl -s -X GET "${NGROK_URL}/api/v1/health/" \
  -H "ngrok-skip-browser-warning: true")

if echo "$response" | grep -q "status"; then
    echo -e "${GREEN}✓ API Response: ${response}${NC}"
else
    echo -e "${RED}✗ Error en Health Check${NC}"
fi
echo ""

# TEST 2: Validar Paciente
echo "✅ TEST 2: Validar Paciente"
response=$(curl -s -X POST "${NGROK_URL}/api/v1/pacientes/validar/" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"documento": "1234567890"}')

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Validación exitosa${NC}"
    echo "$response" | jq '.'
    TOKEN=$(echo "$response" | jq -r '.token')
    PACIENTE_ID=$(echo "$response" | jq -r '.paciente_id')
    echo -e "${YELLOW}Token: ${TOKEN:0:50}...${NC}"
    echo -e "${YELLOW}Paciente ID: ${PACIENTE_ID}${NC}"
else
    echo -e "${RED}✗ Error en Validación${NC}"
    echo "$response"
fi
echo ""

# TEST 3: Crear Conversación
if [ -n "$TOKEN" ]; then
    echo "✅ TEST 3: Crear Conversación"
    
    # Intentar buscar conversación existente primero
    response=$(curl -s -X GET "${NGROK_URL}/api/v1/conversaciones/" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" | jq '.results[0] // empty')
    
    if [ -n "$response" ] && [ "$response" != "null" ]; then
        CONVERSACION_ID=$(echo "$response" | jq -r '.id')
        echo -e "${GREEN}✓ Conversación existente encontrada: ID=${CONVERSACION_ID}${NC}"
    else
        # Crear nueva
        response=$(curl -s -X POST "${NGROK_URL}/api/v1/conversaciones/" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer ${TOKEN}" \
          -H "ngrok-skip-browser-warning: true" \
          -d '{
            "session_id": "test_session_' $(date +%s) '",
            "paciente": 1,
            "entidad_medica": 1,
            "estado": "ACTIVO"
          }')
        
        if echo "$response" | grep -q "id"; then
            echo -e "${GREEN}✓ Nueva conversación creada${NC}"
            CONVERSACION_ID=$(echo "$response" | jq -r '.id')
        else
            echo -e "${YELLOW}⚠ ${response}${NC}"
        fi
    fi
fi
echo ""

# TEST 4: Consultar Conversación Activa
if [ -n "$TOKEN" ]; then
    echo "✅ TEST 4: Consultar Conversación Activa"
    response=$(curl -s -X GET "${NGROK_URL}/api/v1/conversaciones/activa/573001234567/" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true")
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
fi
echo ""

# TEST 5: Consultar Citas Disponibles
if [ -n "$TOKEN" ]; then
    echo "✅ TEST 5: Consultar Citas Disponibles"
    response=$(curl -s -X GET "${NGROK_URL}/api/v1/citas/disponibles/?categoria=general&entidad_medica_id=1" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true")
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
fi
echo ""

# TEST 6: Agendar Cita
if [ -n "$TOKEN" ]; then
    echo "✅ TEST 6: Agendar Cita"
    response=$(curl -s -X POST "${NGROK_URL}/api/v1/citas/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" \
      -d '{
        "paciente_id": 1,
        "slot": 1,
        "motivo_consulta": "Test desde script",
        "telefono": "573001234567"
      }')
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q "cita_id"; then
        CITA_ID=$(echo "$response" | jq -r '.cita_id')
    fi
fi
echo ""

# TEST 7: Listar Citas Activas
if [ -n "$TOKEN" ]; then
    echo "✅ TEST 7: Listar Citas Activas"
    response=$(curl -s -X GET "${NGROK_URL}/api/v1/citas/paciente/1/activas/" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true")
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
fi
echo ""

# TEST 8: Cancelar Cita
if [ -n "$TOKEN" ] && [ -n "$CITA_ID" ]; then
    echo "✅ TEST 8: Cancelar Cita"
    response=$(curl -s -X POST "${NGROK_URL}/api/v1/citas/${CITA_ID}/cancelar/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" \
      -d '{"paciente_id": 1}')
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
fi
echo ""

# TEST 9: Actualizar Contexto
if [ -n "$TOKEN" ] && [ -n "$CONVERSACION_ID" ]; then
    echo "✅ TEST 9: Actualizar Contexto"
    response=$(curl -s -X PUT "${NGROK_URL}/api/v1/conversaciones/${CONVERSACION_ID}/actualizar-contexto/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" \
      -d '{
        "contexto": "{\"estado_flujo\":\"TESTING\",\"test\":true}"
      }')
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
fi
echo ""

# TEST 10: Finalizar Conversación
if [ -n "$TOKEN" ] && [ -n "$CONVERSACION_ID" ]; then
    echo "✅ TEST 10: Finalizar Conversación"
    response=$(curl -s -X PUT "${NGROK_URL}/api/v1/conversaciones/${CONVERSACION_ID}/finalizar/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" \
      -d '{"motivo_cierre": "TEST"}')
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
fi

echo ""
echo "=========================================="
echo "✅ TESTS COMPLETADOS"
echo "=========================================="



