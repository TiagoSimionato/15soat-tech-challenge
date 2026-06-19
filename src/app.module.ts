import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './common/HealthController';
import { dataSourceConfigs } from './configs/dataSourceConfigs';
import { AuthModule } from './modules/auth/auth.module';
import { FallbackModule } from './modules/fallback/fallback.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { ServicesModule } from './modules/services/services.module';
import { StockModule } from './modules/stock/stock.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicle/vehicle.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRoot({
      ...dataSourceConfigs,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/**/migrations/*{.ts,.js}'],
    }),
    UsersModule,
    AuthModule,
    ResourcesModule,
    StockModule,
    VehiclesModule,
    ServicesModule,
    FallbackModule,
  ],
  providers: [],
})
export class AppModule {}
