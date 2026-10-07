import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type AuthenticatedMerchant = {
  sub: string;
  merchantId: string;
  email: string;
};

export const CurrentMerchant = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedMerchant => {
    const request = context.switchToHttp().getRequest<{
      user: AuthenticatedMerchant;
    }>();

    return request.user;
  },
);