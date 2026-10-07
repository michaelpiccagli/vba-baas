import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
