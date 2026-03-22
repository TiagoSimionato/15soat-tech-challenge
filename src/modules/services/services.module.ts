import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from './entities/services.entity';
import { ServicesController } from './controllers/services.controller';
import { ServicesService } from './services/services.service';
import { ServiceOrderService } from './services/serviceOrder.service';
import { ServiceOrderController } from './controllers/serviceOrder.controller';
import { ServiceOrder } from './entities/serviceOrder.entity';

@Module({
  controllers: [ServicesController, ServiceOrderController],
  imports: [TypeOrmModule.forFeature([Services, ServiceOrder])],
  providers: [ServicesService, ServiceOrderService],
})
export class ServicesModule {}
