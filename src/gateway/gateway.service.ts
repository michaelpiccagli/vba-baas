import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { FeesResponseDto } from './dto/fees-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class GatewayService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.configService.getOrThrow<string>('GATEWAY_BASE_URL');
  }

  async getFees(): Promise<FeesResponseDto> {
    const response = await this.httpService.axiosRef.get<FeesResponseDto>(
      `${this.baseUrl}/fees`,
    );

    return response.data;
  }

  async login(data: LoginDto): Promise<LoginResponseDto> {
    const response = await this.httpService.axiosRef.post<LoginResponseDto>(
      `${this.baseUrl}/auth/login`,
      data,
    );

    return response.data;
  }

  async createUser(data: CreateUserDto) {
    const response = await this.httpService.axiosRef.post(
      `${this.baseUrl}/users`,
      data,
    );

    return response.data;
  }
}