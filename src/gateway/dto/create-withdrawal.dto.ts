import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateWithdrawalDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  pixKey: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsString()
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'document deve conter CPF ou CNPJ válido em formato numérico',
  })
  document: string;
}