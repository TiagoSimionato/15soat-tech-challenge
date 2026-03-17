import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfigs } from './configs/dataSourceConfigs';

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRoot({
      ...dataSourceConfigs,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/**/migrations/*{.ts,.js}'],
    }),
  ],
  providers: [],
})
export class AppModule {}
