export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  databaseUrl?: string;
  smsProvider: string;
  allowMockAuth: boolean;
}

export function validateEnv(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const port = parseInt(process.env.PORT || '3000', 10);
  const databaseUrl = process.env.DATABASE_URL;
  const smsProvider = process.env.SMS_PROVIDER || 'mock';
  const allowMockAuth = process.env.ALLOW_MOCK_AUTH === 'true';

  if (isProduction && smsProvider === 'mock' && !allowMockAuth) {
    throw new Error(
      'CRITICAL: Production startup aborted. SMS_PROVIDER is set to mock without ALLOW_MOCK_AUTH=true. Provide a valid SMS gateway configuration for production.'
    );
  }

  return {
    nodeEnv,
    isProduction,
    port,
    databaseUrl,
    smsProvider,
    allowMockAuth,
  };
}
