import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';

import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { Checkout } from '../checkouts/entities/checkout.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { WebhookEvent } from './entities/webhook-event.entity';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookSubscription)
    private readonly webhookSubscriptionRepository: Repository<WebhookSubscription>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
  ) {}

  async validateSignature(event: string, rawBody: Buffer, signature?: string) {
    const subscription = await this.webhookSubscriptionRepository.findOne({
      where: {
        event,
        active: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!subscription) {
      throw new UnauthorizedException('Webhook não cadastrado');
    }

    if (!subscription.secret) {
      return subscription;
    }

    if (!signature) {
      throw new UnauthorizedException('Assinatura do webhook ausente');
    }

    const expectedSignature = createHmac('sha256', subscription.secret)
      .update(rawBody)
      .digest('hex');

    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }

    return subscription;
  }

  async processWebhook(body: Record<string, unknown>) {
    const id = body.id;
    const status = body.status;

    if (typeof id !== 'string' || typeof status !== 'string') {
      return {
        received: true,
        updated: false,
      };
    }

    const existingEvent = await this.webhookEventRepository.findOne({
      where: {
        gatewayTransactionId: id,
        status,
      },
    });

    if (existingEvent) {
      return {
        received: true,
        updated: false,
        duplicate: true,
      };
    }

    const transaction = await this.transactionRepository.findOne({
      where: {
        gatewayTransactionId: id,
      },
      relations: {
        checkout: true,
      },
    });

    if (!transaction) {
      return {
        received: true,
        updated: false,
      };
    }

    transaction.status = status;

    if (typeof body.denialReason === 'string') {
      transaction.denialReason = body.denialReason;
    }

    await this.transactionRepository.save(transaction);

    if (transaction.checkout) {
      transaction.checkout.status = status;
      await this.checkoutRepository.save(transaction.checkout);
    }

    const webhookEvent = this.webhookEventRepository.create({
      gatewayTransactionId: id,
      status,
      event: 'PAYMENT',
    });

    await this.webhookEventRepository.save(webhookEvent);

    return {
      received: true,
      updated: true,
      duplicate: false,
      transactionId: transaction.id,
      status,
    };
  }
}
