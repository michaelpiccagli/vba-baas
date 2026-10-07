import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePixDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  payerDocument: string;

  @IsString()
  @IsNotEmpty()
  externalReference: string;
}