import { IsEmail, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'document deve conter CPF ou CNPJ em formato numérico',
  })
  document: string;

  @IsEmail()
  email: string;
}