export class FeeDto {
  id: string;
  brand: string;
  installments: number;
  feePercent: number;
  feePercentFormatted: string;
}

export class FeesResponseDto {
  total: number;
  fees: FeeDto[];
}