import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { LoginMerchantDto } from './dto/login-merchant.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() data: RegisterMerchantDto) {
    return this.authService.register(data);
  }

  @Post('login')
  login(@Body() data: LoginMerchantDto) {
    return this.authService.login(data);
  }
}