import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class CreateWebhookDto {
  @IsIn(['PAYMENT_PIX', 'PAYMENT_CARD', 'WITHDRAWAL'])
  event: 'PAYMENT_PIX' | 'PAYMENT_CARD' | 'WITHDRAWAL';

  @IsString()
  @Matches(/^https:\/\//, {
    message: 'url deve usar HTTPS',
  })
  url: string;

  @IsOptional()
  @IsString()
  secret?: string;
}