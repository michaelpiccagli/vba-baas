import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('webhook_events')
@Unique(['gatewayTransactionId', 'status'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gatewayTransactionId: string;

  @Column()
  status: string;

  @Column()
  event: string;

  @CreateDateColumn()
  createdAt: Date;
}