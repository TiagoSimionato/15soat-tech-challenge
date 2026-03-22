import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleController } from './controllers/vehicle.controller';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './services/vehicle.service';

@Module({
  controllers: [VehicleController],
  imports: [TypeOrmModule.forFeature([Vehicle])],
  providers: [VehicleService],
})
export class VehiclesModule {}
