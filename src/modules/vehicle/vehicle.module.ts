import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleController } from '../../frameworks/primary/controllers/vehicle/vehicle.controller';
import { Vehicle } from '../../frameworks/secondary/vehicle/vehicle.entity';
import { VehicleService } from '../../core/application/vehicle/vehicle.service';

@Module({
  controllers: [VehicleController],
  imports: [TypeOrmModule.forFeature([Vehicle])],
  providers: [VehicleService],
})
export class VehiclesModule {}
