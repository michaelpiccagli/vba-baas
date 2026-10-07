import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { GatewayService } from './gateway.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreatePixDto } from './dto/create-pix.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentMerchant } from '../auth/current-merchant.decorator';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('fees')
  getFees() {
    return this.gatewayService.getFees();
  }

  @UseGuards(JwtAuthGuard)
  @Post('login')
  login(
    @Body() data: LoginDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.gatewayService.login(data, merchant.merchantId);
  }

  @Post('users')
  createUser(@Body() data: CreateUserDto) {
    return this.gatewayService.createUser(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet')
  getWallet(@CurrentMerchant() merchant: { merchantId: string }) {
    return this.gatewayService.getWallet(merchant.merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  getTransactions(
    @CurrentMerchant() merchant: { merchantId: string },
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.gatewayService.getTransactions(
      merchant.merchantId,
      status,
      type,
      limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('payments/pix')
  createPix(
    @Body() data: CreatePixDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.gatewayService.createPix(data, merchant.merchantId);
  }
}
