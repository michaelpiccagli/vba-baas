import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { GatewayService } from '../gateway/gateway.service';
import { Merchant } from '../merchants/entities/merchant.entity';

import { CreateCheckoutCardDto } from './dto/create-checkout-card.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateCheckoutPixDto } from './dto/create-checkout-pix.dto';
import { Checkout } from './entities/checkout.entity';

@Injectable()
export class CheckoutsService {
  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,

    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    private readonly gatewayService: GatewayService,
  ) {}

  async create(data: CreateCheckoutDto, merchantId: string) {
    const merchant = await this.merchantRepository.findOne({
      where: {
        id: merchantId,
      },
    });

    if (!merchant) {
      throw new NotFoundException('Lojista não encontrado');
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const checkout = this.checkoutRepository.create({
      amount: data.amount,
      description: data.description ?? null,
      status: 'PENDING',
      externalReference: `CHK-${randomUUID()}`,
      expiresAt,
      merchant,
    });

    const savedCheckout =
      await this.checkoutRepository.save(checkout);

    return {
      id: savedCheckout.id,
      externalReference: savedCheckout.externalReference,
      amount: savedCheckout.amount,
      status: savedCheckout.status,
      description: savedCheckout.description,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
      },
      createdAt: savedCheckout.createdAt,
      updatedAt: savedCheckout.updatedAt,
      expiresAt: savedCheckout.expiresAt,
    };
  }

  /**
   * Endpoint público utilizado quando o cliente
   * abre o link de checkout.
   *
   * Não expomos dados sensíveis do lojista.
   */
  async getPublicCheckout(checkoutId: string) {
    const checkout = await this.checkoutRepository.findOne({
      where: {
        id: checkoutId,
      },
      relations: {
        merchant: true,
      },
    });

    if (!checkout) {
      throw new NotFoundException('Checkout não encontrado');
    }

    if (
      checkout.status === 'PENDING' &&
      checkout.expiresAt <= new Date()
    ) {
      checkout.status = 'EXPIRED';

      await this.checkoutRepository.save(checkout);
    }

    return {
      id: checkout.id,
      externalReference: checkout.externalReference,
      amount: checkout.amount,
      description: checkout.description,
      status: checkout.status,
      expiresAt: checkout.expiresAt,
      merchant: {
        name: checkout.merchant.name,
      },
    };
  }

  async createPix(
    checkoutId: string,
    data: CreateCheckoutPixDto,
  ) {
    const checkout =
      await this.getAvailableCheckout(checkoutId);

    const merchantId = checkout.merchant.id;

    const pix = await this.gatewayService.createPix(
      {
        amount: checkout.amount,
        description: checkout.description ?? undefined,
        payerDocument: data.payerDocument,
        externalReference: checkout.externalReference,
      },
      merchantId,
      checkout,
    );

    await this.updateCheckoutStatus(
      checkout,
      pix.status,
    );

    return pix;
  }

  async createCard(
    checkoutId: string,
    data: CreateCheckoutCardDto,
  ) {
    const checkout =
      await this.getAvailableCheckout(checkoutId);

    const merchantId = checkout.merchant.id;

    const card = await this.gatewayService.createCard(
      {
        amount: checkout.amount,
        description: checkout.description ?? undefined,
        externalReference: checkout.externalReference,
        cardNumber: data.cardNumber,
        cardHolder: data.cardHolder,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv,
        installments: data.installments,
        feePercent: data.feePercent,
      },
      merchantId,
      checkout,
    );

    await this.updateCheckoutStatus(
      checkout,
      card.status,
    );

    return card;
  }

  /**
   * Busca e valida um checkout antes do pagamento.
   *
   * Como o pagamento é público, o merchantId não vem
   * mais do JWT. O lojista é obtido pela relação
   * armazenada no próprio checkout.
   */
  private async getAvailableCheckout(
    checkoutId: string,
  ): Promise<Checkout> {
    const checkout = await this.checkoutRepository.findOne({
      where: {
        id: checkoutId,
      },
      relations: {
        merchant: true,
      },
    });

    if (!checkout) {
      throw new NotFoundException(
        'Checkout não encontrado',
      );
    }

    if (checkout.expiresAt <= new Date()) {
      checkout.status = 'EXPIRED';

      await this.checkoutRepository.save(checkout);

      throw new BadRequestException(
        'Checkout expirado',
      );
    }

    if (checkout.status !== 'PENDING') {
      throw new BadRequestException(
        'Este checkout não está disponível para pagamento',
      );
    }

    return checkout;
  }

  private async updateCheckoutStatus(
    checkout: Checkout,
    status: string,
  ): Promise<void> {
    checkout.status = status;

    await this.checkoutRepository.save(checkout);
  }
}