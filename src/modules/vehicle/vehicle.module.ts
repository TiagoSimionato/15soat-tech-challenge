import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleService } from '../../core/application/vehicle/vehicle.service';
import { VehicleController } from '../../frameworks/primary/controllers/vehicle/vehicle.controller';
import { Vehicle } from '../../frameworks/secondary/vehicle/vehicle.entity';

@Module({
  controllers: [VehicleController],
  imports: [TypeOrmModule.forFeature([Vehicle])],
  providers: [VehicleService],
})
export class VehiclesModule {}
