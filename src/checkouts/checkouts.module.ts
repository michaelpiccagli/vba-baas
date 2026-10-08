import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Checkout } from './entities/checkout.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { CheckoutsService } from './checkouts.service';
import { CheckoutsController } from './checkouts.controller';
import { AuthModule } from '../auth/auth.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Checkout, Merchant]),
    AuthModule,
    GatewayModule,
  ],
  controllers: [CheckoutsController],
  providers: [CheckoutsService],
  exports: [CheckoutsService, TypeOrmModule],
})
export class CheckoutsModule {}