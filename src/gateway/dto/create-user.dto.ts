import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsIn(['PF', 'PJ'])
  personType: 'PF' | 'PJ';

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  tradingName?: string;

  @IsEmail()
  email: string;

  @Matches(/^\d{11}$/, {
    message: 'phone deve conter 11 dígitos',
  })
  phone: string;

  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'document deve conter 11 dígitos para CPF ou 14 para CNPJ',
  })
  document: string;

  @Matches(/^\d{8}$/, {
    message: 'zipCode deve conter 8 dígitos',
  })
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @Length(2, 2)
  state: string;
}