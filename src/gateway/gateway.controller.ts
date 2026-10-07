import { Body, Controller, Get, Post } from '@nestjs/common';

import { GatewayService } from './gateway.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('fees')
  getFees() {
    return this.gatewayService.getFees();
  }

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.gatewayService.login(data);
  }

  @Post('users')
  createUser(@Body() data: CreateUserDto) {
    return this.gatewayService.createUser(data);
  }

  @Get('wallet')
  getWallet() {
    return this.gatewayService.getWallet();
  }
}
