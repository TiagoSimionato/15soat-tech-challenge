import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/test/user.entity';

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRoot({
      database: process.env.DB_NAME,
      entities: [User],
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT ?? 5432),
      synchronize: true,
      type: 'postgres',
      username: process.env.DB_USER,
    }),
  ],
  providers: [],
})
export class AppModule {}
