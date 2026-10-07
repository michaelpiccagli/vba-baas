import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreatePixDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'payerDocument deve conter 11 dígitos para CPF ou 14 para CNPJ',
  })
  payerDocument: string;

  @IsString()
  @IsNotEmpty()
  externalReference: string;
}