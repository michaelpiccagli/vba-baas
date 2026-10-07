import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Merchant } from '../merchants/entities/merchant.entity';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { LoginMerchantDto } from './dto/login-merchant.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterMerchantDto) {
    const existingMerchant = await this.merchantRepository.findOne({
      where: [
        { email: data.email },
        { document: data.document },
      ],
    });

    if (existingMerchant) {
      throw new ConflictException(
        'Já existe um lojista cadastrado com este e-mail ou documento',
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const merchant = this.merchantRepository.create({
      name: data.name,
      email: data.email,
      document: data.document,
      passwordHash,
    });

    const savedMerchant = await this.merchantRepository.save(merchant);

    return {
      id: savedMerchant.id,
      name: savedMerchant.name,
      email: savedMerchant.email,
      document: savedMerchant.document,
    };
  }

  async login(data: LoginMerchantDto) {
    const merchant = await this.merchantRepository.findOne({
      where: { email: data.email },
    });

    if (!merchant) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      merchant.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: merchant.id,
      merchantId: merchant.id,
      email: merchant.email,
    });

    return {
      accessToken,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
      },
    };
  }
}