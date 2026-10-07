import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginMerchantDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}