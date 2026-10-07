import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { GatewayAccount } from '../../gateway/entities/gateway-account.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  document: string;

  @Column()
  passwordHash: string;

  @OneToOne(() => GatewayAccount, (gatewayAccount) => gatewayAccount.merchant)
  gatewayAccount: Relation<GatewayAccount>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}