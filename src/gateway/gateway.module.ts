import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayAccount } from './entities/gateway-account.entity';

import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([GatewayAccount, Transaction]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
