// src/ormconfig.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'blog',
  entities: ['src/**/*.entity.ts'], // uniquement TS pour ts-node
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
