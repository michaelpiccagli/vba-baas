import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';

import { CheckoutsService } from './checkouts.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateCheckoutPixDto } from './dto/create-checkout-pix.dto';
import { CreateCheckoutCardDto } from './dto/create-checkout-card.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentMerchant } from '../auth/current-merchant.decorator';

@Controller('checkouts')
export class CheckoutsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() data: CreateCheckoutDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.checkoutsService.create(data, merchant.merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pix')
  createPix(
    @Param('id') id: string,
    @Body() data: CreateCheckoutPixDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.checkoutsService.createPix(id, data, merchant.merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/card')
  createCard(
    @Param('id') checkoutId: string,
    @Body() data: CreateCheckoutCardDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.checkoutsService.createCard(
      checkoutId,
      data,
      merchant.merchantId,
    );
  }
}
