import Redis from 'ioredis';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface TypingMessage {
  phoneNumber: string;
  recipientId: string;
}

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

const REDIS_CHANNEL = process.env.REDIS_CHANNEL || 'elai:typing-channel';

const WHATSAPP_CONFIG = {
  apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
};

class TypingSubscriber {
  private subscriber: Redis;
  private isRunning: boolean = false;

  constructor() {
    this.subscriber = new Redis(REDIS_CONFIG);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.subscriber.on('connect', () => {
      console.log('[TypingSubscriber] Connected to Redis');
    });

    this.subscriber.on('error', (err) => {
      console.error('[TypingSubscriber] Redis error:', err);
    });

    this.subscriber.on('message', async (channel, message) => {
      if (channel === REDIS_CHANNEL) {
        await this.handleTypingMessage(message);
      }
    });
  }

  private async handleTypingMessage(message: string): Promise<void> {
    try {
      const data: TypingMessage = JSON.parse(message);
      await this.sendTypingIndicator(data.recipientId);
      console.log(`[TypingSubscriber] Typing indicator sent to: ${data.recipientId}`);
    } catch (error) {
      console.error('[TypingSubscriber] Error processing message:', error);
    }
  }

  private async sendTypingIndicator(recipientId: string): Promise<void> {
    if (!WHATSAPP_CONFIG.accessToken || !WHATSAPP_CONFIG.phoneNumberId) {
      console.warn('[TypingSubscriber] WhatsApp credentials not configured');
      return;
    }

    try {
      await axios.post(
        `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientId,
          type: 'reaction',
          reaction: {
            message_id: '',
            emoji: '',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_CONFIG.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      // Silently fail for typing indicators - they're not critical
      if (axios.isAxiosError(error) && error.response?.status !== 400) {
        console.error('[TypingSubscriber] WhatsApp API error:', error.message);
      }
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[TypingSubscriber] Already running');
      return;
    }

    try {
      await this.subscriber.subscribe(REDIS_CHANNEL);
      this.isRunning = true;
      console.log(`[TypingSubscriber] Subscribed to channel: ${REDIS_CHANNEL}`);
      console.log('[TypingSubscriber] Waiting for typing events...');
    } catch (error) {
      console.error('[TypingSubscriber] Failed to subscribe:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.subscriber.unsubscribe(REDIS_CHANNEL);
      await this.subscriber.quit();
      this.isRunning = false;
      console.log('[TypingSubscriber] Stopped');
    } catch (error) {
      console.error('[TypingSubscriber] Error stopping:', error);
    }
  }
}

// Main entry point
const subscriber = new TypingSubscriber();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[TypingSubscriber] Shutting down...');
  await subscriber.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[TypingSubscriber] Shutting down...');
  await subscriber.stop();
  process.exit(0);
});

// Start the subscriber
subscriber.start().catch((error) => {
  console.error('[TypingSubscriber] Fatal error:', error);
  process.exit(1);
});
