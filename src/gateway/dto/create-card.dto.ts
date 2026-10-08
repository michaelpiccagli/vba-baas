import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateCardDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsString()
  @Matches(/^\d{13,19}$/, {
    message: 'cardNumber deve conter apenas números',
  })
  cardNumber: string;

  @IsString()
  cardHolder: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, {
    message: 'expiryMonth deve estar entre 01 e 12',
  })
  expiryMonth: string;

  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'expiryYear deve conter 4 dígitos',
  })
  expiryYear: string;

  @IsString()
  @Matches(/^\d{3,4}$/, {
    message: 'cvv deve conter 3 ou 4 dígitos',
  })
  cvv: string;

  @IsInt()
  @Min(1)
  @Max(21)
  installments: number;

  @IsNumber()
  @Min(0)
  feePercent: number;
}