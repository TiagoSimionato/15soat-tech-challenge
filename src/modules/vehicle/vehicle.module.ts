import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleController } from './vehicle.controller';
import { Vehicle } from './vehicle.entity';
import { VehicleService } from './vehicle.service';

@Module({
  controllers: [VehicleController],
  imports: [TypeOrmModule.forFeature([Vehicle])],
  providers: [VehicleService],
})
export class VehiclesModule {}
