import { StringValue } from 'ms';

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue,
  algorithm: 'HS256' as const,
  issuer: 'elai-backend',
  audience: 'elai-app',
};

export const jwtRefreshConfig = {
  secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret',
  expiresIn: '30d',
};
