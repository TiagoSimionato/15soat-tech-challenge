import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesByService } from '../resources/entities/resourcesByService.entity';
import { Stock } from '../stock/entities/stock.entity';
import { ServiceOrderController } from './controllers/serviceOrder.controller';
import { ServicesController } from './controllers/services.controller';
import { RequestedService } from './entities/requestedService.entity';
import { ServiceItem } from './entities/serviceItem.entity';
import { ServiceOrder } from './entities/serviceOrder.entity';
import { Services } from './entities/services.entity';
import { ServiceOrderService } from './services/serviceOrder.service';
import { ServicesService } from './services/services.service';

@Module({
  controllers: [ServicesController, ServiceOrderController],
  imports: [TypeOrmModule.forFeature([Services, ServiceOrder, RequestedService, ServiceItem, ResourcesByService, Stock])],
  providers: [ServicesService, ServiceOrderService],
})
export class ServicesModule {}
