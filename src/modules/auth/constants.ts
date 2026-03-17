import { SetMetadata } from '@nestjs/common';

export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'secret',
};

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
