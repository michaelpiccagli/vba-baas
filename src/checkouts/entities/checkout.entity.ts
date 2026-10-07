import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { Merchant } from '../../merchants/entities/merchant.entity';

@Entity('checkouts')
export class Checkout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  externalReference: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @ManyToOne(() => Merchant, {
    nullable: false,
  })
  merchant: Relation<Merchant>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
