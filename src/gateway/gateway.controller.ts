import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { GatewayService } from './gateway.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreatePixDto } from './dto/create-pix.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentMerchant } from '../auth/current-merchant.decorator';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @UseGuards(JwtAuthGuard)
  @Post('payments/card')
  createCard(
    @Body() data: CreateCardDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.gatewayService.createCard(data, merchant.merchantId);
  }

  @Get('fees')
  getFees(@Query('brand') brand?: string) {
    return this.gatewayService.getFees(brand);
  }

  @UseGuards(JwtAuthGuard)
  @Post('login')
  login(
    @Body() data: LoginDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.gatewayService.login(data, merchant.merchantId);
  }

  @Post('auth/reset-password')
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.gatewayService.resetPassword(data);
  }

  @Post('users')
  createUser(@Body() data: CreateUserDto) {
    return this.gatewayService.createUser(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/me')
  getCurrentUser(@CurrentMerchant() merchant: { merchantId: string }) {
    return this.gatewayService.getCurrentUser(merchant.merchantId);
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

  @UseGuards(JwtAuthGuard)
  @Get('payments/:id')
  getPaymentById(
    @Param('id') id: string,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.gatewayService.getPaymentById(id, merchant.merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('webhooks')
  createWebhook(
    @Body() data: CreateWebhookDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.gatewayService.createWebhook(data, merchant.merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('webhooks')
  getWebhooks(@CurrentMerchant() merchant: { merchantId: string }) {
    return this.gatewayService.getWebhooks(merchant.merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('webhooks/:id')
  deleteWebhook(
    @Param('id') id: string,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.gatewayService.deleteWebhook(id, merchant.merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdrawals')
  createWithdrawal(
    @Body() data: CreateWithdrawalDto,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.gatewayService.createWithdrawal(data, merchant.merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('withdrawals/:id')
  getWithdrawalById(
    @Param('id') id: string,
    @CurrentMerchant() merchant: { merchantId: string },
  ) {
    return this.gatewayService.getWithdrawalById(id, merchant.merchantId);
  }
}
