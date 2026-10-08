import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { Checkout } from '../../checkouts/entities/checkout.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gatewayTransactionId: string;

  @Column()
  type: string;

  @Column()
  status: string;

  @Column({ type: 'varchar', nullable: true })
  denialReason: string | null;

  @Column()
  amount: number;

  @Column()
  description: string;

  @Column()
  externalReference: string;

  @Column({ type: 'varchar', nullable: true })
  cardBrand: string | null;

  @Column({ type: 'int', nullable: true })
  installments: number | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  feePercent: number | null;

  @Column({ type: 'int', nullable: true })
  feeAmount: number | null;

  @Column({ type: 'int', nullable: true })
  netAmount: number | null;

  @Column({ type: 'varchar', nullable: true })
  txid: string | null;

  @Column({ type: 'text', nullable: true })
  emv: string | null;

  @ManyToOne(() => Checkout, {
    nullable: true,
  })
  @JoinColumn({ name: 'checkoutId' })
  checkout: Relation<Checkout> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}