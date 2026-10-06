export class GatewayUserDto {
  id: string;
  personType: string;
  name: string;
  tradingName: string | null;
  email: string;
  document: string;
}

export class LoginResponseDto {
  access_token: string;
  token_type: string;
  codigoCliente: number;
  chaveLoja: string;
  user: GatewayUserDto;
}