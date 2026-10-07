import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCheckoutDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}