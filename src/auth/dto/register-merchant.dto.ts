import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterMerchantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'document deve conter 11 dígitos para CPF ou 14 para CNPJ',
  })
  document: string;

  @IsString()
  @MinLength(8)
  password: string;
}