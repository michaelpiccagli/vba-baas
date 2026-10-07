import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'document deve conter 11 dígitos para CPF ou 14 para CNPJ',
  })
  document: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}