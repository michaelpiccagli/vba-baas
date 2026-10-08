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

import { Merchant } from '../../merchants/entities/merchant.entity';

@Entity('webhook_subscriptions')
export class WebhookSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  gatewayWebhookId: string;

  @Column()
  event: string;

  @Column()
  url: string;

  @Column({ type: 'varchar', nullable: true })
secret: string | null;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Merchant, { nullable: false })
  @JoinColumn({ name: 'merchantId' })
  merchant: Relation<Merchant>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}