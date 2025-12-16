#!/bin/bash

# ============================================
# 🧪 TEST COMPLETO DE TODAS LAS APIs DEL BACKEND
# ============================================
# Fecha: 28 de Octubre, 2025
# Backend: Django REST API
# Túnel: ngrok
# ============================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
NGROK_URL="https://c61c848cfc22.ngrok-free.app"
API_BASE="/api/v1"

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🧪 TEST COMPLETO DE TODAS LAS APIs DEL BACKEND           ║${NC}"
echo -e "${BLUE}║   Backend: Django REST API                                ║${NC}"
echo -e "${BLUE}║   URL: ${NGROK_URL}${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Variable global para almacenar datos
TOKEN=""
PACIENTE_ID=""
CONVERSACION_ID=""
CITA_ID=""

# Función para hacer test
test_api() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local headers=$4
    local body=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}TEST ${TOTAL_TESTS}: ${test_name}${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Construir comando curl
    local curl_cmd="curl -s -w '\n%{http_code}'"
    curl_cmd="$curl_cmd -X ${method}"
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd -H '$headers'"
    fi
    
    if [ -n "$body" ]; then
        curl_cmd="$curl_cmd -d '$body'"
    fi
    
    curl_cmd="$curl_cmd '${NGROK_URL}${endpoint}'"
    
    # Ejecutar y capturar respuesta
    local response=$(eval $curl_cmd)
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | sed '$d')
    
    # Verificar respuesta
    if echo "$http_code" | grep -qE "^(200|201)$"; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        echo -e "${GREEN}Respuesta:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Extraer datos si aplica
        if echo "$test_name" | grep -q "Validar Paciente"; then
            TOKEN=$(echo "$response_body" | jq -r '.token' 2>/dev/null)
            PACIENTE_ID=$(echo "$response_body" | jq -r '.paciente_id' 2>/dev/null)
        fi
        
        if echo "$test_name" | grep -q "Crear Conversación"; then
            CONVERSACION_ID=$(echo "$response_body" | jq -r '.id' 2>/dev/null)
        fi
        
        if echo "$test_name" | grep -q "Agendar Cita"; then
            CITA_ID=$(echo "$response_body" | jq -r '.cita_id' 2>/dev/null)
        fi
        
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo -e "${RED}Error:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# ============================================
# INICIO DE TESTS
# ============================================

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          TEST 1: Health Check${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
test_api "Health Check" "GET" "${API_BASE}/health/" "ngrok-skip-browser-warning: true"
echo ""

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          TEST 2: Validar Paciente${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
test_api "Validar Paciente" "POST" "${API_BASE}/pacientes/validar/" "Content-Type: application/json; ngrok-skip-browser-warning: true" '{"documento": "1234567890"}'
echo ""

if [ -z "$TOKEN" ]; then
    echo -e "${RED}⚠️  No se obtuvo el token JWT. Los siguientes tests fallarán.${NC}"
    echo ""
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          TEST 3: Crear Conversación${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
SESSION_ID="test_$(date +%s)"
test_api "Crear Conversación" "POST" "${API_BASE}/conversaciones/" "Content-Type: application/json; Authorization: Bearer ${TOKEN}; ngrok-skip-browser-warning: true" "{\"session_id\": \"${SESSION_ID}\", \"paciente\": 1, \"entidad_medica\": 1, \"estado\": \"ACTIVO\"}"
echo ""

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          TEST 4: Consultar Conversación Activa${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
test_api "Consultar Conversación Activa" "GET" "${API_BASE}/conversaciones/activa/573001234567/" "Authorization: Bearer ${TOKEN}; ngrok-skip-browser-warning: true"
echo ""

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          TEST 5: Consultar Citas Disponibles${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
test_api "Consultar Citas Disponibles" "GET" "${API_BASE}/citas/disponibles/?categoria=general&entidad_medica_id=1" "Authorization: Bearer ${TOKEN}; ngrok-skip-browser-warning: true"
echo ""

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          TEST 6: Listar Citas Activas${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
test_api "Listar Citas Activas" "GET" "${API_BASE}/citas/paciente/1/activas/" "Authorization: Bearer ${TOKEN}; ngrok-skip-browser-warning: true"
echo ""

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          TEST 7: Agendar Cita${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
test_api "Agendar Cita" "POST" "${API_BASE}/citas/" "Content-Type: application/json; Authorization: Bearer ${TOKEN}; ngrok-skip-browser-warning: true" '{"paciente": 1, "slot": 1, "motivo_consulta": "Test desde script", "telefono": "573001234567"}'
echo ""

if [ -n "$CITA_ID" ]; then
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}          TEST 8: Cancelar Cita${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    test_api "Cancelar Cita" "POST" "${API_BASE}/citas/${CITA_ID}/cancelar/" "Content-Type: application/json; Authorization: Bearer ${TOKEN}; ngrok-skip-browser-warning: true" '{"paciente_id": 1}'
    echo ""
fi

if [ -n "$CONVERSACION_ID" ]; then
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}          TEST 9: Actualizar Contexto${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    test_api "Actualizar Contexto" "PUT" "${API_BASE}/conversaciones/${CONVERSACION_ID}/actualizar-contexto/" "Content-Type: application/json; Authorization: Bearer ${TOKEN}; ngrok-skip-browser-warning: true" '{"contexto": "{\"estado_flujo\":\"TESTING\",\"test\":true}"}'
    echo ""
    
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}          TEST 10: Finalizar Conversación${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    test_api "Finalizar Conversación" "PUT" "${API_BASE}/conversaciones/${CONVERSACION_ID}/finalizar/" "Content-Type: application/json; Authorization: Bearer ${TOKEN}; ngrok-skip-browser-warning: true" '{"motivo_cierre": "TEST"}'
    echo ""
fi

# ============================================
# RESUMEN FINAL
# ============================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    📊 RESUMEN FINAL                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Total de Tests:${NC} ${TOTAL_TESTS}"
echo -e "${GREEN}✓ Exitosos:${NC} ${PASSED_TESTS}"
echo -e "${RED}✗ Fallidos:${NC} ${FAILED_TESTS}"
echo ""

# Calcular porcentaje
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
    echo -e "${BLUE}Tasa de Éxito:${NC} ${SUCCESS_RATE}%"
fi

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ ¡TODOS LOS TESTS PASARON EXITOSAMENTE! 🎉                ║${NC}"
    echo -e "${GREEN}║  El backend está funcionando correctamente                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  HAY TESTS FALLIDOS                                      ║${NC}"
    echo -e "${RED}║  Revisa el reporte anterior para ver detalles              ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo -e "${YELLOW}Ver reporte completo en: REPORTE_PRUEBAS_APIS.md${NC}"
echo ""

exit $FAILED_TESTS



