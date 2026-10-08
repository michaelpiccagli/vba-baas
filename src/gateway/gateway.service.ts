import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Checkout } from '../checkouts/entities/checkout.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { WebhookSubscription } from '../webhooks/entities/webhook-subscription.entity';

import { CreateCardDto } from './dto/create-card.dto';
import { CreatePixDto } from './dto/create-pix.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { FeesResponseDto } from './dto/fees-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { GatewayAccount } from './entities/gateway-account.entity';

@Injectable()
export class GatewayService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    @InjectRepository(WebhookSubscription)
    private readonly webhookSubscriptionRepository: Repository<WebhookSubscription>,
  ) {}

  private detectCardBrand(
    cardNumber: string,
  ): 'VISA' | 'MASTERCARD' | 'ELO' {
    const number = cardNumber.replace(/\D/g, '');

    if (
      /^(401178|401179|431274|438935|451416|457393|457631|504175|5067|509|627780|636297|636368|650|6516|6550)/.test(
        number,
      )
    ) {
      return 'ELO';
    }

    if (/^4/.test(number)) {
      return 'VISA';
    }

    if (/^(5[1-5]|2[2-7])/.test(number)) {
      return 'MASTERCARD';
    }

    throw new BadRequestException('Bandeira do cartão não suportada');
  }

  private get baseUrl(): string {
    return this.configService.getOrThrow<string>('GATEWAY_BASE_URL');
  }

  async getFees(brand?: string): Promise<FeesResponseDto> {
    const response =
      await this.httpService.axiosRef.get<FeesResponseDto>(
        `${this.baseUrl}/fees`,
        {
          params: {
            brand,
          },
        },
      );

    return response.data;
  }

  async login(data: LoginDto, merchantId: string) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new UnauthorizedException('Lojista não encontrado');
    }

    const response =
      await this.httpService.axiosRef.post<LoginResponseDto>(
        `${this.baseUrl}/auth/login`,
        data,
      );

    const loginResponse = response.data;

    let account = await this.gatewayAccountRepository.findOne({
      where: {
        gatewayUserId: loginResponse.user.id,
      },
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
    account.merchant = merchant;

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

  async getCurrentUser(merchantId: string) {
    const account = await this.getGatewayAccount(merchantId);

    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/users/me`,
      {
        headers: this.getAuthHeaders(account.accessToken),
      },
    );

    const user = response.data;

    return {
      id: user.id,
      personType: user.personType,
      name: user.name,
      tradingName: user.tradingName ?? null,
      email: user.email,
      phone: user.phone,
      document: user.document
        ? `${user.document.slice(0, 3)}.***.***-${user.document.slice(-2)}`
        : null,
      address: {
        zipCode: user.address?.zipCode,
        address: user.address?.address,
        number: user.address?.number,
        complement: user.address?.complement ?? null,
        neighborhood: user.address?.neighborhood,
        city: user.address?.city,
        state: user.address?.state,
      },
    };
  }

  async resetPassword(data: ResetPasswordDto) {
    const response = await this.httpService.axiosRef.post(
      `${this.baseUrl}/auth/reset-password`,
      data,
    );

    return {
      message: response.data.message,
      email: response.data.email,
    };
  }

  async getWallet(merchantId: string) {
    const account = await this.getGatewayAccount(merchantId);

    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/wallet`,
      {
        headers: this.getAuthHeaders(account.accessToken),
      },
    );

    return response.data;
  }

  async getTransactions(
    merchantId: string,
    status?: string,
    type?: string,
    limit?: string,
  ) {
    const account = await this.getGatewayAccount(merchantId);

    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/wallet/transactions`,
      {
        headers: this.getAuthHeaders(account.accessToken),
        params: {
          status,
          type,
          limit,
        },
      },
    );

    return response.data;
  }

  async createPix(
    data: CreatePixDto,
    merchantId: string,
    checkout?: Checkout,
  ) {
    const account = await this.getGatewayAccount(merchantId);

    const response = await this.httpService.axiosRef.post(
      `${this.baseUrl}/payments/pix`,
      data,
      {
        headers: this.getAuthHeaders(account.accessToken),
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
      checkout: checkout ?? null,
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

  async createCard(
    data: CreateCardDto,
    merchantId: string,
    checkout?: Checkout,
  ) {
    const account = await this.getGatewayAccount(merchantId);

    const brand = this.detectCardBrand(data.cardNumber);

    const feesResponse = await this.getFees(brand);

    const matchingFee = feesResponse.fees.find(
      (fee: {
        brand: string;
        installments: number;
        feePercent: number;
      }) =>
        fee.brand === brand &&
        fee.installments === data.installments &&
        fee.feePercent === data.feePercent,
    );

    if (!matchingFee) {
      throw new BadRequestException(
        `feePercent inválido para ${brand} em ${data.installments} parcela(s)`,
      );
    }

    const response = await this.httpService.axiosRef.post(
      `${this.baseUrl}/payments/card`,
      data,
      {
        headers: this.getAuthHeaders(account.accessToken),
      },
    );

    const card = response.data;

    const transaction = this.transactionRepository.create({
      gatewayTransactionId: card.id,
      type: card.type,
      status: card.status,
      denialReason: card.denialReason ?? null,
      amount: card.amount,
      description: card.description ?? null,
      externalReference:
        card.externalReference ?? data.externalReference ?? null,
      txid: null,
      emv: null,
      checkout: checkout ?? null,
    });

    await this.transactionRepository.save(transaction);

    return {
      id: card.id,
      type: card.type,
      status: card.status,
      denialReason: card.denialReason ?? null,
      amount: card.amount,
      amountFormatted: card.amountFormatted,
      description: card.description,
      message: card.message,
      externalReference: card.externalReference,
      createdAt: card.createdAt,
      card: {
        brand: card.metadata?.cardBrand,
        last4: card.metadata?.cardLast4,
        holder: card.metadata?.cardHolder,
        installments: card.metadata?.installments,
      },
      fee: card.fee,
    };
  }

  async getPaymentById(
    paymentId: string,
    merchantId: string,
  ) {
    const account = await this.getGatewayAccount(merchantId);

    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/payments/${paymentId}`,
      {
        headers: this.getAuthHeaders(account.accessToken),
      },
    );

    const payment = response.data;

    return {
      id: payment.id,
      type: payment.type,
      status: payment.status,
      denialReason: payment.denialReason ?? null,
      amount: payment.amount,
      amountFormatted: payment.amountFormatted,
      description: payment.description,
      message: payment.message,
      externalReference:
        payment.metadata?.externalReference ?? null,
      createdAt: payment.createdAt,
      card:
        payment.type === 'CREDIT_CARD'
          ? {
              brand: payment.metadata?.cardBrand,
              last4: payment.metadata?.cardLast4,
              holder: payment.metadata?.cardHolder,
              installments: payment.metadata?.installments,
              feePercent: payment.metadata?.feePercent,
            }
          : undefined,
    };
  }

  async createWebhook(
    data: CreateWebhookDto,
    merchantId: string,
  ) {
    const account = await this.getGatewayAccount(merchantId);

    if (!account.merchant) {
      throw new UnauthorizedException(
        'Conta do gateway não vinculada ao lojista',
      );
    }

    const response = await this.httpService.axiosRef.post(
      `${this.baseUrl}/webhooks`,
      data,
      {
        headers: this.getAuthHeaders(account.accessToken),
      },
    );

    const webhook = response.data;

    const subscription =
      this.webhookSubscriptionRepository.create({
        gatewayWebhookId: webhook.id,
        event: webhook.event,
        url: webhook.url,
        secret: data.secret ?? null,
        active: webhook.active,
        merchant: account.merchant,
      });

    await this.webhookSubscriptionRepository.save(
      subscription,
    );

    return webhook;
  }

  async getWebhooks(merchantId: string) {
    const account = await this.getGatewayAccount(merchantId);

    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/webhooks`,
      {
        headers: this.getAuthHeaders(account.accessToken),
      },
    );

    return response.data;
  }

  async deleteWebhook(
    webhookId: string,
    merchantId: string,
  ) {
    const account = await this.getGatewayAccount(merchantId);

    const response = await this.httpService.axiosRef.delete(
      `${this.baseUrl}/webhooks/${webhookId}`,
      {
        headers: this.getAuthHeaders(account.accessToken),
      },
    );

    return response.data;
  }

  async createWithdrawal(
    data: CreateWithdrawalDto,
    merchantId: string,
  ) {
    const account = await this.getGatewayAccount(merchantId);

    const response = await this.httpService.axiosRef.post(
      `${this.baseUrl}/withdrawals`,
      data,
      {
        headers: this.getAuthHeaders(account.accessToken),
      },
    );

    const withdrawal = response.data;

    const transaction = this.transactionRepository.create({
      gatewayTransactionId: withdrawal.id,
      type: withdrawal.type,
      status: withdrawal.status,
      denialReason: withdrawal.denialReason ?? null,
      amount: withdrawal.amount,
      description: withdrawal.description ?? null,
      externalReference:
        withdrawal.externalReference ??
        data.externalReference ??
        null,
      txid: null,
      emv: null,
      checkout: null,
    });

    await this.transactionRepository.save(transaction);

    return {
      id: withdrawal.id,
      type: withdrawal.type,
      status: withdrawal.status,
      denialReason: withdrawal.denialReason ?? null,
      amount: withdrawal.amount,
      amountFormatted: withdrawal.amountFormatted,
      description: withdrawal.description,
      message: withdrawal.message,
      externalReference: withdrawal.externalReference,
      createdAt: withdrawal.createdAt,
    };
  }

  async getWithdrawalById(
    withdrawalId: string,
    merchantId: string,
  ) {
    const account = await this.getGatewayAccount(merchantId);

    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/withdrawals/${withdrawalId}`,
      {
        headers: this.getAuthHeaders(account.accessToken),
      },
    );

    const withdrawal = response.data;

    return {
      id: withdrawal.id,
      type: withdrawal.type,
      status: withdrawal.status,
      denialReason: withdrawal.denialReason ?? null,
      amount: withdrawal.amount,
      amountFormatted: withdrawal.amountFormatted,
      description: withdrawal.description,
      message: withdrawal.message,
      externalReference: withdrawal.externalReference,
      createdAt: withdrawal.createdAt,
    };
  }

  private async getGatewayAccount(
    merchantId: string,
  ): Promise<GatewayAccount> {
    const account =
      await this.gatewayAccountRepository.findOne({
        where: {
          merchant: {
            id: merchantId,
          },
        },
        relations: {
          merchant: true,
        },
      });

    if (!account) {
      throw new UnauthorizedException(
        'Conta do gateway não encontrada',
      );
    }

    return account;
  }

  private getAuthHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }
}