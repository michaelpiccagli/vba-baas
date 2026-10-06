import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { GatewayService } from './gateway.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}