import { Matches } from 'class-validator';

export class CreateCheckoutPixDto {
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'payerDocument deve conter 11 dígitos para CPF ou 14 para CNPJ',
  })
  payerDocument: string;
}