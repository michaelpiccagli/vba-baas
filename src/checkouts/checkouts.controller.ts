import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CheckoutsService } from './checkouts.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateCheckoutPixDto } from './dto/create-checkout-pix.dto';
import { CreateCheckoutCardDto } from './dto/create-checkout-card.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentMerchant } from '../auth/current-merchant.decorator';

@Controller('checkouts')
export class CheckoutsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}

  // O lojista precisa estar autenticado para criar um checkout.
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() data: CreateCheckoutDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.checkoutsService.create(data, merchant.merchantId);
  }

  // Público: usado pelo cliente ao abrir o link de checkout.
  @Get(':id')
  getCheckout(@Param('id') id: string) {
    return this.checkoutsService.getPublicCheckout(id);
  }

  // Público: o cliente paga o checkout via Pix.
  @Post(':id/pix')
  createPix(
    @Param('id') id: string,
    @Body() data: CreateCheckoutPixDto,
  ) {
    return this.checkoutsService.createPix(id, data);
  }

  // Público: o cliente paga o checkout via cartão.
  @Post(':id/card')
  createCard(
    @Param('id') checkoutId: string,
    @Body() data: CreateCheckoutCardDto,
  ) {
    return this.checkoutsService.createCard(checkoutId, data);
  }
}