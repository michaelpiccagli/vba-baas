import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsIn(['PF', 'PJ'])
  personType: 'PF' | 'PJ';

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  tradingName?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  document: string;

  @IsString()
  @Length(8, 8)
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsOptional()
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