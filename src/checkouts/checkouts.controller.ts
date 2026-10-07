import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CheckoutsService } from './checkouts.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentMerchant } from '../auth/current-merchant.decorator';

@Controller('checkouts')
export class CheckoutsController {
  constructor(
    private readonly checkoutsService: CheckoutsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() data: CreateCheckoutDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.checkoutsService.create(
      data,
      merchant.merchantId,
    );
  }
}