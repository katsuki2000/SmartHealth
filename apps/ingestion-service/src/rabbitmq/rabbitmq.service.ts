import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  AmqpConnectionManager,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: AmqpConnectionManager | null = null;
  private channel: ChannelWrapper | null = null;
  private readonly exchange: string;
  private readonly url: string;
  private isReady = false;

  constructor() {
    this.url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    this.exchange = process.env.RABBITMQ_EXCHANGE || 'smarthealth.events';
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.connection = connect([this.url], {
        heartbeatIntervalInSeconds: 5,
        reconnectTimeInSeconds: 5,
      });

      this.connection.on('connect', () => {
        this.logger.log('✅ RabbitMQ connected successfully');
        this.isReady = true;
      });

      this.connection.on('disconnect', (err: any) => {
        this.isReady = false;
        this.logger.warn(
          `⚠️  RabbitMQ disconnected: ${err?.err?.message || 'unknown'}`,
        );
      });

      this.channel = this.connection.createChannel({
        json: true,
        setup: async (ch: Channel) => {
          await ch.assertExchange(this.exchange, 'topic', { durable: true });
          this.logger.log(`📌 Exchange "${this.exchange}" asserted`);
        },
      });

      await this.channel.waitForConnect();
    } catch (error) {
      this.logger.warn(
        `⚠️  RabbitMQ not available at startup (${error.message}). ` +
          'Events will be skipped until connection is restored.',
      );
    }
  }

  private async disconnect() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('🔌 RabbitMQ connection closed');
    } catch (error) {
      this.logger.warn(`Could not close RabbitMQ connection: ${error.message}`);
    }
  }

  async publish(routingKey: string, payload: object): Promise<void> {
    if (!this.isReady || !this.channel) {
      this.logger.warn(
        `[SKIP] RabbitMQ not ready — event "${routingKey}" not published`,
      );
      return;
    }

    try {
      await this.channel.publish(this.exchange, routingKey, payload, {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
        appId: 'smarthealth-ingestion-service',
      });
      this.logger.log(
        `📤 Event published: [${this.exchange}] → "${routingKey}"`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish "${routingKey}": ${error.message}`,
      );
    }
  }
}
