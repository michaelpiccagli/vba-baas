import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Merchant } from '../../merchants/entities/merchant.entity';

@Entity('gateway_accounts')
export class GatewayAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gatewayUserId: string;

  @Column()
  personType: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  tradingName: string | null;

  @Column()
  email: string;

  @Column()
  document: string;

  @Column()
  codigoCliente: number;

  @Column()
  chaveLoja: string;

  @Column({ type: 'text' })
  accessToken: string;

  @Column()
  tokenType: string;

  @OneToOne(() => Merchant, (merchant) => merchant.gatewayAccount, {
    nullable: true,
  })
  @JoinColumn()
  merchant: Relation<Merchant> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
