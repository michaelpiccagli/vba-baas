import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { Checkout } from './entities/checkout.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Merchant } from '../merchants/entities/merchant.entity';

import { GatewayService } from '../gateway/gateway.service';
import { CreateCheckoutPixDto } from './dto/create-checkout-pix.dto';

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
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Lojista não encontrado');
    }

    const checkout = this.checkoutRepository.create({
      amount: data.amount,
      description: data.description ?? null,
      status: 'PENDING',
      externalReference: `CHK-${randomUUID()}`,
      merchant,
    });

    const savedCheckout = await this.checkoutRepository.save(checkout);

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
        document: merchant.document,
      },
      createdAt: savedCheckout.createdAt,
      updatedAt: savedCheckout.updatedAt,
    };
  }

  async createPix(
    checkoutId: string,
    data: CreateCheckoutPixDto,
    merchantId: string,
  ) {
    const checkout = await this.checkoutRepository.findOne({
      where: {
        id: checkoutId,
        merchant: {
          id: merchantId,
        },
      },
      relations: {
        merchant: true,
      },
    });

    if (!checkout) {
      throw new NotFoundException('Checkout não encontrado');
    }

    if (checkout.status !== 'PENDING') {
      throw new BadRequestException(
        'Este checkout não está disponível para pagamento',
      );
    }

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

    checkout.status = pix.status;
    await this.checkoutRepository.save(checkout);

    return pix;
  }
}
