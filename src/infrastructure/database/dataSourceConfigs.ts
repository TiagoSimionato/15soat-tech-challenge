import type { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export const dataSourceConfigs: DataSourceOptions = {
  database: process.env.DB_NAME,
  entities: ['src/frameworks/secondary/**/*.entity{.ts,.js}'],
  host: process.env.DB_HOST,
  migrations: ['src/infrastructure/database/migrations/*{.ts,.js}'],
  migrationsRun: true,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT ?? 5432),
  synchronize: false,
  type: 'postgres',
  username: process.env.DB_USER,
};

export const AppDataSource = new DataSource(dataSourceConfigs);
