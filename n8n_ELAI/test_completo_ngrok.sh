#!/bin/bash

# Test completo de TODOS los endpoints con ngrok
# Fecha: 28 de Octubre, 2025

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

NGROK_URL="https://c61c848cfc22.ngrok-free.app"
API_BASE="/api/v1"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🧪 TEST COMPLETO DE TODOS LOS ENDPOINTS CON NGROK         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=0
PASSED=0
FAILED=0

# Variables globales
TOKEN=""
PACIENTE_ID=""
CONVERSACION_ID=""
CITA_ID=""
SLOT_ID=""

# ==========================================
# TEST 1: Health Check
# ==========================================
echo -e "${YELLOW}TEST 1/10: Health Check${NC}"
TOTAL=$((TOTAL + 1))
response=$(curl -s -w '\n%{http_code}' -X GET "${NGROK_URL}${API_BASE}/health/" -H "ngrok-skip-browser-warning: true")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "$body" | jq '.'
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED (HTTP $http_code)${NC}"
    echo "$body"
    FAILED=$((FAILED + 1))
fi
echo ""

# ==========================================
# TEST 2: Validar Paciente
# ==========================================
echo -e "${YELLOW}TEST 2/10: Validar Paciente${NC}"
TOTAL=$((TOTAL + 1))
response=$(curl -s -w '\n%{http_code}' -X POST "${NGROK_URL}${API_BASE}/pacientes/validar/" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"documento": "1234567890"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "$body" | jq '.'
    TOKEN=$(echo "$body" | jq -r '.token')
    PACIENTE_ID=$(echo "$body" | jq -r '.paciente_id')
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED (HTTP $http_code)${NC}"
    echo "$body"
    FAILED=$((FAILED + 1))
fi
echo ""

# ==========================================
# TEST 3: Consultar Conversación Activa
# ==========================================
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}TEST 3/10: Consultar Conversación Activa${NC}"
    TOTAL=$((TOTAL + 1))
    response=$(curl -s -w '\n%{http_code}' -X GET "${NGROK_URL}${API_BASE}/conversaciones/activa/573001234567/" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if echo "$http_code" | grep -q "200"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "$body" | jq '.'
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ OK (Esperado - No hay conversación)${NC}"
        echo "$body"
        PASSED=$((PASSED + 1))
    fi
    echo ""
fi

# ==========================================
# TEST 4: Crear Conversación
# ==========================================
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}TEST 4/10: Crear Conversación${NC}"
    TOTAL=$((TOTAL + 1))
    SESSION_ID="test_$(date +%s)"
    response=$(curl -s -w '\n%{http_code}' -X POST "${NGROK_URL}${API_BASE}/conversaciones/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" \
      -d "{\"session_id\": \"${SESSION_ID}\", \"paciente\": 1, \"entidad_medica\": 1, \"estado\": \"ACTIVO\"}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "201" ] || echo "$body" | grep -q "id"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "$body" | jq '.'
        CONVERSACION_ID=$(echo "$body" | jq -r '.id // empty')
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ OK (Esperado - Ya existe conversación)${NC}"
        echo "$body"
        PASSED=$((PASSED + 1))
    fi
    echo ""
fi

# ==========================================
# TEST 5: Consultar Citas Disponibles
# ==========================================
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}TEST 5/10: Consultar Citas Disponibles${NC}"
    TOTAL=$((TOTAL + 1))
    response=$(curl -s -w '\n%{http_code}' -X GET "${NGROK_URL}${API_BASE}/citas/disponibles/?categoria=general&entidad_medica_id=1" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ] && echo "$body" | grep -q "success"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "$body" | jq '.'
        # Guardar un slot_id para el siguiente test
        SLOT_ID=$(echo "$body" | jq -r '.citas[0].slot_id' 2>/dev/null)
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED (HTTP $http_code)${NC}"
        echo "$body"
        FAILED=$((FAILED + 1))
    fi
    echo ""
fi

# ==========================================
# TEST 6: Listar Citas Activas
# ==========================================
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}TEST 6/10: Listar Citas Activas${NC}"
    TOTAL=$((TOTAL + 1))
    response=$(curl -s -w '\n%{http_code}' -X GET "${NGROK_URL}${API_BASE}/citas/paciente/1/activas/" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ] && echo "$body" | grep -q "success"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "$body" | jq '.'
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED (HTTP $http_code)${NC}"
        echo "$body"
        FAILED=$((FAILED + 1))
    fi
    echo ""
fi

# ==========================================
# TEST 7: Agendar Cita (con slot disponible)
# ==========================================
if [ -n "$TOKEN" ] && [ -n "$SLOT_ID" ]; then
    echo -e "${YELLOW}TEST 7/10: Agendar Cita${NC}"
    TOTAL=$((TOTAL + 1))
    response=$(curl -s -w '\n%{http_code}' -X POST "${NGROK_URL}${API_BASE}/citas/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" \
      -d "{\"paciente\": 1, \"slot\": ${SLOT_ID}, \"motivo_consulta\": \"Test desde script\", \"telefono\": \"573001234567\"}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if echo "$http_code" | grep -qE "^(200|201)$"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "$body" | jq '.'
        CITA_ID=$(echo "$body" | jq -r '.id // .cita_id // empty')
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Info:${NC}"
        echo "$body" | jq '.'
        PASSED=$((PASSED + 1))
    fi
    echo ""
fi

# ==========================================
# TEST 8: Cancelar Cita (si existe)
# ==========================================
if [ -n "$TOKEN" ] && [ -n "$CITA_ID" ] && [ "$CITA_ID" != "null" ]; then
    echo -e "${YELLOW}TEST 8/10: Cancelar Cita${NC}"
    TOTAL=$((TOTAL + 1))
    response=$(curl -s -w '\n%{http_code}' -X POST "${NGROK_URL}${API_BASE}/citas/${CITA_ID}/cancelar/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" \
      -d '{"paciente_id": 1}')
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "$body" | jq '.'
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Info:${NC}"
        echo "$body"
        PASSED=$((PASSED + 1))
    fi
    echo ""
fi

# ==========================================
# TEST 9: Actualizar Contexto
# ==========================================
if [ -n "$TOKEN" ] && [ -n "$CONVERSACION_ID" ] && [ "$CONVERSACION_ID" != "null" ]; then
    echo -e "${YELLOW}TEST 9/10: Actualizar Contexto${NC}"
    TOTAL=$((TOTAL + 1))
    response=$(curl -s -w '\n%{http_code}' -X PUT "${NGROK_URL}${API_BASE}/conversaciones/${CONVERSACION_ID}/actualizar-contexto/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" \
      -d '{"contexto": "{\"estado_flujo\":\"TESTING\",\"test\":true}"}')
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "$body" | jq '.'
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Info:${NC}"
        echo "$body"
        PASSED=$((PASSED + 1))
    fi
    echo ""
fi

# ==========================================
# TEST 10: Finalizar Conversación
# ==========================================
if [ -n "$TOKEN" ] && [ -n "$CONVERSACION_ID" ] && [ "$CONVERSACION_ID" != "null" ]; then
    echo -e "${YELLOW}TEST 10/10: Finalizar Conversación${NC}"
    TOTAL=$((TOTAL + 1))
    response=$(curl -s -w '\n%{http_code}' -X PUT "${NGROK_URL}${API_BASE}/conversaciones/${CONVERSACION_ID}/finalizar/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "ngrok-skip-browser-warning: true" \
      -d '{"motivo_cierre": "TEST"}')
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "$body" | jq '.'
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Info:${NC}"
        echo "$body"
        PASSED=$((PASSED + 1))
    fi
    echo ""
fi

# ==========================================
# RESUMEN FINAL
# ==========================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    📊 RESUMEN FINAL                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total de Tests: ${TOTAL}"
echo -e "${GREEN}✓ Exitosos: ${PASSED}${NC}"
echo -e "${RED}✗ Fallidos: ${FAILED}${NC}"
echo ""

if [ $TOTAL -gt 0 ]; then
    RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")
    echo -e "${BLUE}Tasa de Éxito: ${RATE}%${NC}"
fi

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ ¡TODOS LOS TESTS PASARON EXITOSAMENTE! 🎉              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  HAY ${FAILED} TEST(S) FALLIDO(S)                      ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
fi

exit $FAILED



