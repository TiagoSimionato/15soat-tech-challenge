import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from '../resources/entities/resources.entity';
import { ResourcesByService } from '../resources/entities/resourcesByService.entity';
import { ResourceService } from '../resources/services/resources.service';
import { Stock } from '../stock/entities/stock.entity';
import { StockService } from '../stock/services/stock.service';
import { ServiceOrderClientController } from './controllers/serviceOrderClient.controller';
import { ServiceOrderEmployeeController } from './controllers/serviceOrderEmployee.controller';
import { ServicesController } from './controllers/services.controller';
import { RequestedService } from './entities/requestedService.entity';
import { ServiceItem } from './entities/serviceItem.entity';
import { ServiceOrder } from './entities/serviceOrder.entity';
import { Services } from './entities/services.entity';
import { RequestedServiceService } from './services/requestedService.service';
import { ServiceOrderService } from './services/serviceOrder.service';
import { ServicesService } from './services/services.service';

@Module({
  controllers: [ServicesController, ServiceOrderClientController, ServiceOrderEmployeeController],
  imports: [TypeOrmModule.forFeature([Services, ServiceOrder, RequestedService, ServiceItem, ResourcesByService, Stock, Resource])],
  providers: [ServicesService, ServiceOrderService, StockService, ResourceService, RequestedServiceService],
})
export class ServicesModule {}
