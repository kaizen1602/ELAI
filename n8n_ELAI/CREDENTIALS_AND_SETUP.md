# 🔐 Credenciales y Configuración para ELAI (n8n + Backend)

Este documento detalla las credenciales y configuraciones necesarias para desplegar los flujos de n8n y conectarlos con el backend de ELAI expuesto vía ngrok.

## 1. Configuración de Variables (Modo Cloud/Web - Manual)

Siguiendo el patrón de tus otros proyectos (n8n0312):

**Se ha agregado un nodo "Code" llamado "CONFIG" al inicio de CADA flujo.**

1.  Importa los flujos `.json` en tu n8n.
2.  Busca el nodo **"CONFIG"** (cerca del inicio, después de extraer datos).
3.  Ábrelo y verás un bloque de código JavaScript. **Edita la constante `CONFIG`**:

    ```javascript
    const CONFIG = {
      // Backend - ⚠️ CAMBIAR ESTA URL cada vez que reinicies ngrok
      BACKEND_NGROK_URL: "https://CAMBIAR_AQUI.ngrok-free.app",

      // ... otras variables
      N8N_WEBHOOK_SECRET: "TuSecreto...",
      TELEFONO_CLINICA: "(601) ..."
    };
    ```
4.  Guarda el flujo.

**Nota:** Debes actualizar este código en cada flujo que utilices.

## 2. Credenciales de Nodos en n8n

Debes crear estas credenciales en el gestor de credenciales de n8n y asignarlas a los nodos correspondientes.

### WhatsApp API (Trigger & Send)
*   **Nombre Credencial**: `WhatsApp account` (o `WhatsApp OAuth account` para el trigger si usas Cloud API con OAuth).
*   **Parámetros**:
    *   `Access Token`: Token permanente o temporal de Meta Developers.
    *   `Business Account ID`: ID de la cuenta de WhatsApp Business.
    *   `Phone Number ID`: ID del número de teléfono.

### OpenAI
*   **Nombre Credencial**: `OpenAi account`.
*   **Parámetros**:
    *   `API Key`: Tu llave de API de OpenAI (sk-...).

### Postgres (Chat Memory)
*   **Nombre Credencial**: `Postgres account`.
*   **Parámetros**:
    *   Host: `postgres` (si usas Docker network) o `localhost`.
    *   User/Password/Database: Credenciales de tu BD ELAI.

## 3. Configuración del Backend (.env)

Asegúrate de que el backend tenga estas variables configuradas en su archivo `.env`:

```env
# Seguridad N8N
N8N_WEBHOOK_SECRET=TuSecretoSuperSeguro123  <-- DEBE COINCIDIR con la variable en n8n

# WhatsApp Credentials
WHATSAPP_VERIFY_TOKEN=elai_verify_token_123 <-- Para verificar el webhook (Trigger)
WHATSAPP_APP_SECRET=xxxxxxxxxxxxxx          <-- Para validar firmas de mensajes entrantes
WHATSAPP_API_TOKEN=xxxxxxxxxxxxxx           <-- Para enviar mensajes de respuesta
```

## 4. Endpoints y Autenticación

Los flujos han sido optimizados para usar dos tipos de autenticación:

1.  **Endpoints de Sistema (`X-Webhook-Secret`)**:
    *   Usados para validar pacientes, crear conversaciones y gestionar contexto.
    *   Requieren el header `X-Webhook-Secret: {{ $vars.N8N_WEBHOOK_SECRET }}`.
    *   Endpoints:
        *   `GET /api/v1/whatsapp/conversations/:sessionId`
        *   `POST /api/v1/whatsapp/validate-patient`
        *   `POST /api/v1/whatsapp/conversation`
        *   `PUT /api/v1/whatsapp/context`

2.  **Endpoints de Usuario (`Authorization: Bearer Token`)**:
    *   Usados para consultar y agendar citas en nombre del paciente.
    *   Requieren el token JWT obtenido durante la validación del paciente.
    *   Endpoints:
        *   `/api/v1/slots/...`
        *   `/api/v1/citas/...`

## 5. Pasos para Despliegue con ngrok

1.  **Iniciar Backend**: Asegúrate que el backend tenga los cambios recientes y esté corriendo (`npm run dev`).
2.  **Iniciar ngrok**:
    ```bash
    ngrok http 3000
    ```
3.  **Copiar URL**: Copia la URL HTTPS generada (ej: `https://abcd-123.ngrok-free.app`).
4.  **Configurar n8n**:
    *   Ve a Variables y actualiza `BACKEND_NGROK_URL` con la nueva URL.
    *   Asegúrate de que `N8N_WEBHOOK_SECRET` coincida con el del backend.
5.  **Configurar WhatsApp (Meta)**:
    *   En el App Dashboard de Meta, configura el Webhook URL a:
        `https://[tu-instancia-n8n]/webhook/tu-webhook-id`
    *   (El flujo principal usa el nodo `WhatsApp Trigger` que genera su propia URL).
