import { Body, Controller, Headers, Param, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('lera-box/:event')
  async receiveWebhook(
    @Param('event') event: string,
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-lera-box-signature') signature: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    if (!request.rawBody) {
      throw new Error('Raw body não disponível');
    }

    await this.webhooksService.validateSignature(
      event,
      request.rawBody,
      signature,
    );

    return this.webhooksService.processWebhook(body);
  }
}
