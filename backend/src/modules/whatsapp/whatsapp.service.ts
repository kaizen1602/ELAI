import axios from 'axios';
import { prisma } from '../../config/database';
import { pubSubService } from '../../config/redis';
import { logger } from '../../utils/logger';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

export class WhatsAppService {
  /**
   * Send text message via WhatsApp
   */
  async sendMessage(to: string, message: string) {
    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`WhatsApp message sent to ${to}`);
      return response.data;
    } catch (error: any) {
      logger.error('WhatsApp send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send typing indicator (via Redis Pub/Sub)
   */
  async sendTypingIndicator(to: string) {
    await pubSubService.publish(process.env.REDIS_TYPING_CHANNEL || 'elai:typing-channel', {
      to,
      action: 'typing',
    });
  }

  /**
   * Webhook verification (for WhatsApp setup)
   */
  verifyWebhook(mode: string, token: string, challenge: string) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '';

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }

    return null;
  }

  /**
   * Handle incoming webhook (messages from users)
   */
  async handleWebhook(body: any) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from;
        const text = message.text?.body || '';
        const messageId = message.id;

        logger.info(`Received message from ${from}: ${text}`);

        // Save message to database
        await this.saveIncomingMessage(from, text, messageId);

        return { from, text, messageId };
      }

      return null;
    } catch (error) {
      logger.error('WhatsApp webhook handle error:', error);
      throw error;
    }
  }

  /**
   * Save incoming message
   */
  private async saveIncomingMessage(sessionId: string, contenido: string, messageId: string) {
    // Find or create conversation
    const conversacion = await prisma.conversacion.findUnique({
      where: { sessionId },
    });

    if (!conversacion) {
      // For now, we can't determine entidadMedicaId from webhook
      // This should be handled by N8N workflow
      logger.warn(`Conversation not found for session ${sessionId}`);
      return;
    }

    // Save message
    await prisma.mensaje.create({
      data: {
        conversacionId: conversacion.id,
        tipo: 'TEXTO',
        direccion: 'ENTRANTE',
        contenido,
        metadata: { messageId },
      },
    });

    // Update conversation
    await prisma.conversacion.update({
      where: { id: conversacion.id },
      data: { ultimoMensaje: new Date() },
    });
  }

  /**
   * Create or update conversation (for N8N)
   * Also reactivates finalized conversations
   */
  async createOrUpdateConversation(data: {
    sessionId: string;
    entidadMedicaId: string;
    pacienteId?: string;
    context?: object;
  }) {
    const existing = await prisma.conversacion.findUnique({
      where: { sessionId: data.sessionId },
    });

    if (existing) {
      // Reactivate if finalized or cancelled
      const shouldReactivate = existing.estado === 'FINALIZADA' || existing.estado === 'CANCELADA';

      return await prisma.conversacion.update({
        where: { id: existing.id },
        data: {
          pacienteId: data.pacienteId || existing.pacienteId,
          contexto: data.context ?? existing.contexto ?? {},
          ultimoMensaje: new Date(),
          estado: shouldReactivate ? 'ACTIVA' : existing.estado,
        },
      });
    }

    return await prisma.conversacion.create({
      data: {
        sessionId: data.sessionId,
        entidadMedicaId: data.entidadMedicaId,
        pacienteId: data.pacienteId,
        contexto: data.context || {},
        estado: 'ACTIVA',
      },
    });
  }

  /**
   * Update conversation context
   */
  async updateContext(sessionId: string, context: object) {
    return await prisma.conversacion.update({
      where: { sessionId },
      data: { contexto: context },
    });
  }

  /**
   * Validate patient exists (for N8N)
   */
  /**
   * Validate patient exists (for N8N)
   */
  async validatePatient(data: { telefono?: string; entidadMedicaId?: string; documento?: string }) {
    const whereClause: any = { activo: true };

    if (data.documento) {
      whereClause.numeroDocumento = data.documento;
      // If entity ID is provided, scope it. If not, search globally (or however business logic requires)
      // For now, assuming document is unique enough or we want a global search if entity is missing
      if (data.entidadMedicaId) {
        whereClause.entidadMedicaId = data.entidadMedicaId;
      }
    } else if (data.telefono && data.entidadMedicaId) {
      whereClause.telefono = data.telefono;
      whereClause.entidadMedicaId = data.entidadMedicaId;
    } else {
      // If neither document nor complete phone/entity pair provided, return false
      return { exists: false, paciente: null };
    }

    const paciente = await prisma.paciente.findFirst({
      where: whereClause,
    });

    return paciente
      ? { exists: true, paciente }
      : { exists: false, paciente: null };
  }

  /**
   * Get conversations for entity
   */
  async getConversations(entidadMedicaId: string, options: { page?: number; limit?: number } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.conversacion.findMany({
        where: { entidadMedicaId },
        include: {
          paciente: { select: { id: true, nombres: true, apellidos: true, telefono: true } },
          _count: { select: { mensajes: true } },
        },
        orderBy: { ultimoMensaje: 'desc' },
        skip,
        take: limit,
      }),
      prisma.conversacion.count({ where: { entidadMedicaId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get conversation by session ID
   */
  async getConversationBySession(sessionId: string) {
    return await prisma.conversacion.findUnique({
      where: { sessionId },
      include: {
        paciente: true,
        mensajes: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
  }
}

export const whatsappService = new WhatsAppService();
