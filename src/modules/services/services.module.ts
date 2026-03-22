import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrderController } from './controllers/serviceOrder.controller';
import { ServicesController } from './controllers/services.controller';
import { ServiceOrder } from './entities/serviceOrder.entity';
import { Services } from './entities/services.entity';
import { ServiceOrderService } from './services/serviceOrder.service';
import { ServicesService } from './services/services.service';

@Module({
  controllers: [ServicesController, ServiceOrderController],
  imports: [TypeOrmModule.forFeature([Services, ServiceOrder])],
  providers: [ServicesService, ServiceOrderService],
})
export class ServicesModule {}
