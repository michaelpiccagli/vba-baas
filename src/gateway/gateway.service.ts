import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { FeesResponseDto } from './dto/fees-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CreateUserDto } from './dto/create-user.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GatewayAccount } from './entities/gateway-account.entity';

import { CreatePixDto } from './dto/create-pix.dto';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class GatewayService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
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

  async login(data: LoginDto) {
    const response = await this.httpService.axiosRef.post<LoginResponseDto>(
      `${this.baseUrl}/auth/login`,
      data,
    );

    const loginResponse = response.data;

    let account = await this.gatewayAccountRepository.findOne({
      where: { gatewayUserId: loginResponse.user.id },
    });

    if (!account) {
      account = this.gatewayAccountRepository.create();
    }

    account.gatewayUserId = loginResponse.user.id;
    account.personType = loginResponse.user.personType;
    account.name = loginResponse.user.name;
    account.tradingName = loginResponse.user.tradingName;
    account.email = loginResponse.user.email;
    account.document = loginResponse.user.document;
    account.codigoCliente = loginResponse.codigoCliente;
    account.chaveLoja = loginResponse.chaveLoja;
    account.accessToken = loginResponse.access_token;
    account.tokenType = loginResponse.token_type;

    await this.gatewayAccountRepository.save(account);

    return {
      message: 'Login realizado com sucesso',
      user: {
        id: loginResponse.user.id,
        personType: loginResponse.user.personType,
        name: loginResponse.user.name,
        tradingName: loginResponse.user.tradingName,
        email: loginResponse.user.email,
      },
    };
  }

  async createUser(data: CreateUserDto) {
    const response = await this.httpService.axiosRef.post(
      `${this.baseUrl}/users`,
      data,
    );

    return response.data;
  }

  async getWallet() {
    const accounts = await this.gatewayAccountRepository.find({
      order: { updatedAt: 'DESC' },
      take: 1,
    });

    const account = accounts[0];

    if (!account) {
      throw new Error('Nenhuma conta do gateway encontrada.');
    }

    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/wallet`,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      },
    );

    return response.data;
  }

  async getTransactions(status?: string, type?: string, limit?: string) {
    const accounts = await this.gatewayAccountRepository.find({
      order: { updatedAt: 'DESC' },
      take: 1,
    });

    const account = accounts[0];

    if (!account) {
      throw new Error('Nenhuma conta do gateway encontrada.');
    }

    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/wallet/transactions`,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
        params: {
          status,
          type,
          limit,
        },
      },
    );

    return response.data;
  }
  async createPix(data: CreatePixDto) {
    const accounts = await this.gatewayAccountRepository.find({
      order: { updatedAt: 'DESC' },
      take: 1,
    });

    const account = accounts[0];

    if (!account) {
      throw new Error('Nenhuma conta do gateway encontrada.');
    }

    const response = await this.httpService.axiosRef.post(
      `${this.baseUrl}/payments/pix`,
      data,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      },
    );

    const pix = response.data;

    const transaction = this.transactionRepository.create({
      gatewayTransactionId: pix.id,
      type: pix.type,
      status: pix.status,
      denialReason: pix.denialReason,
      amount: pix.amount,
      description: pix.description,
      externalReference: pix.externalReference,
      txid: pix.txid,
      emv: pix.emv,
    });

    await this.transactionRepository.save(transaction);

    return {
      id: pix.id,
      type: pix.type,
      status: pix.status,
      denialReason: pix.denialReason,
      amount: pix.amount,
      amountFormatted: pix.amountFormatted,
      description: pix.description,
      message: pix.message,
      externalReference: pix.externalReference,
      txid: pix.txid,
      emv: pix.emv,
      qrCodeBase64: pix.qrCodeBase64,
      copyPaste: pix.copyPaste,
      createdAt: pix.createdAt,
    };
  }
}
