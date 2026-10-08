import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Checkout } from '../checkouts/entities/checkout.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookEvent } from './entities/webhook-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebhookSubscription,
       WebhookEvent,
      Transaction,
      Checkout,
    ]),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}