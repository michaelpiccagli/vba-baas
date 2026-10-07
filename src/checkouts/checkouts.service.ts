import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { Checkout } from './entities/checkout.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Merchant } from '../merchants/entities/merchant.entity';

@Injectable()
export class CheckoutsService {
  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,

    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async create(data: CreateCheckoutDto, merchantId: string) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new Error('Lojista não encontrado');
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
}
