import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  txid: string | null;

  @Column({ type: 'text', nullable: true })
  emv: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}