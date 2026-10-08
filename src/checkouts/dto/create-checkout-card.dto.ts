import {
  IsInt,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateCheckoutCardDto {
  @IsString()
  @Matches(/^\d{13,19}$/)
  cardNumber: string;

  @IsString()
  cardHolder: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/)
  expiryMonth: string;

  @IsString()
  @Matches(/^\d{4}$/)
  expiryYear: string;

  @IsString()
  @Matches(/^\d{3,4}$/)
  cvv: string;

  @IsInt()
  @Min(1)
  @Max(21)
  installments: number;

  @IsNumber()
  @Min(0)
  feePercent: number;
}