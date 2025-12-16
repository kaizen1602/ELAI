import { Request, Response } from 'express';
import { whatsappService } from './whatsapp.service';
import {
  sendMessageSchema,
  sendTypingSchema,
  createConversationSchema,
  updateContextSchema,
  queryConversationsSchema,
  validatePatientSchema,
} from './whatsapp.dto';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthenticatedRequest } from '../../types';

export class WhatsAppController {
  /**
   * @route GET /api/v1/whatsapp/webhook
   * @desc WhatsApp webhook verification
   * @access Public
   */
  verifyWebhook = (req: Request, res: Response) => {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    const result = whatsappService.verifyWebhook(mode, token, challenge);

    if (result) {
      res.status(200).send(result);
    } else {
      res.status(403).json({
        success: false,
        error: 'Webhook verification failed',
      });
    }
  };

  /**
   * @route POST /api/v1/whatsapp/webhook
   * @desc Handle incoming WhatsApp messages
   * @access Public (from WhatsApp)
   */
  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    // Always respond 200 quickly to avoid retries
    res.status(200).send('OK');

    // Process webhook asynchronously
    try {
      await whatsappService.handleWebhook(req.body);
    } catch (error) {
      // Log error but don't fail the response
      console.error('Webhook processing error:', error);
    }
  });

  /**
   * @route POST /api/v1/whatsapp/send
   * @desc Send WhatsApp message (N8N)
   * @access N8N Secret (validated by middleware)
   */
  sendMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = sendMessageSchema.parse(req.body);
    const result = await whatsappService.sendMessage(validated.to, validated.message);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Message sent successfully',
    });
  });

  /**
   * @route POST /api/v1/whatsapp/typing
   * @desc Send typing indicator (N8N)
   * @access N8N Secret (validated by middleware)
   */
  sendTyping = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = sendTypingSchema.parse(req.body);
    await whatsappService.sendTypingIndicator(validated.to);

    res.status(200).json({
      success: true,
      message: 'Typing indicator sent',
    });
  });

  /**
   * @route POST /api/v1/whatsapp/conversation
   * @desc Create or update conversation (N8N)
   * @access N8N Secret (validated by middleware)
   */
  createConversation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = createConversationSchema.parse(req.body);
    const conversation = await whatsappService.createOrUpdateConversation(validated);

    res.status(200).json({
      success: true,
      data: conversation,
    });
  });

  /**
   * @route PUT /api/v1/whatsapp/context
   * @desc Update conversation context (N8N)
   * @access N8N Secret (validated by middleware)
   */
  updateContext = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = updateContextSchema.parse(req.body);
    const conversation = await whatsappService.updateContext(validated.sessionId, validated.context);

    res.status(200).json({
      success: true,
      data: conversation,
      message: 'Context updated successfully',
    });
  });

  /**
   * @route POST /api/v1/whatsapp/validate-patient
   * @desc Validate patient by document (N8N)
   * @access N8N Secret (validated by middleware)
   */
  validatePatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = validatePatientSchema.parse(req.body);
    const result = await whatsappService.validatePatient(validated);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * @route GET /api/v1/whatsapp/conversations
   * @desc Get all conversations
   * @access Private
   */
  getConversations = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const validated = queryConversationsSchema.parse(req.query);
    const result = await whatsappService.getConversations(validated.entidadMedicaId, {
      page: validated.page,
      limit: validated.limit,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * @route GET /api/v1/whatsapp/conversations/:sessionId
   * @desc Get conversation by session ID
   * @access Private
   */
  getConversation = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const conversation = await whatsappService.getConversationBySession(req.params.sessionId);

    res.status(200).json({
      success: true,
      data: conversation,
    });
  });
}

export const whatsappController = new WhatsAppController();
