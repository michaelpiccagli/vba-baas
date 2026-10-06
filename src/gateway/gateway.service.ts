import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { FeesResponseDto } from './dto/fees-response.dto';

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
}