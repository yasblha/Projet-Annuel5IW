// Simple EventBus wrapper utilisant RabbitMQ (amqplib)
// Permet de publier (fire-and-forget) des événements JSON
// Pour un usage avancé, on pourra ajouter la partie "subscribe" plus tard.
import { Injectable, Logger } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class EventBus {
  private readonly logger = new Logger(EventBus.name);
  private connection?: amqplib.Connection;
  private channel?: amqplib.Channel;
  private readonly url: string = process.env.RABBITMQ_URL || 'amqp://localhost';

  /**
   * Établit la connexion et ouvre un channel si nécessaire (lazy).
   */
  private async getChannel(): Promise<amqplib.Channel> {
    if (this.channel) return this.channel;
    if (!this.connection) {
      this.logger.log(`📡 Connexion à RabbitMQ: ${this.url}`);
      this.connection = await amqplib.connect(this.url);
      this.connection.on('error', (err) => {
        this.logger.error('Erreur connexion RabbitMQ', err);
        this.connection = undefined;
        this.channel = undefined;
      });
    }
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  /**
   * Publie un événement sur un exchange de type "topic".
   * @param routingKey ex: "contract.activated"
   * @param payload Objet sérialisable JSON
   */
  async publish(routingKey: string, payload: any): Promise<void> {
    const channel = await this.getChannel();
    const exchange = 'domain_events';
    await channel.assertExchange(exchange, 'topic', { durable: true });
    const content = Buffer.from(JSON.stringify(payload));
    channel.publish(exchange, routingKey, content, { persistent: true });
    this.logger.debug(`📨 Event publié: ${routingKey}`);
  }
}