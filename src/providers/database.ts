import { DataSource } from 'typeorm';

export const dbProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        database: process.env.DB_NAME,
        entities: [],
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT ?? 5432),
        type: 'postgres',
        username: process.env.DB_USER,
      });
      return dataSource.initialize();
    },
  },
];
