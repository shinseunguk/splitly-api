export interface AppConfig {
  appPort: number;
  nodeEnv: 'development' | 'production' | 'test';
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
  };
  corsOrigins: string[];
}

const parseBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true' || value === '1';
};

const parseOrigins = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
};

export const loadConfiguration = (): AppConfig => {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as AppConfig['nodeEnv'];
  return {
    appPort: Number(process.env.APP_PORT ?? 3000),
    nodeEnv,
    db: {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'splitly',
      password: process.env.DB_PASSWORD ?? 'splitly',
      database: process.env.DB_NAME ?? 'splitly',
      synchronize: nodeEnv !== 'production' && parseBool(process.env.TYPEORM_SYNC, true),
    },
    corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  };
};
