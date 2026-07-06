import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from '../../frameworks/secondary/resources/resources.entity';
import { ResourcesByService } from '../../frameworks/secondary/resources/resourcesByService.entity';
import { ResourceService } from '../../core/application/resources/resources.service';
import { Stock } from '../../frameworks/secondary/stock/stock.entity';
import { StockService } from '../../core/application/stock/stock.service';
import { ServiceOrderClientController } from '../../frameworks/primary/controllers/services/serviceOrderClient.controller';
import { ServiceOrderEmployeeController } from '../../frameworks/primary/controllers/services/serviceOrderEmployee.controller';
import { ServicesController } from '../../frameworks/primary/controllers/services/services.controller';
import { RequestedService } from '../../frameworks/secondary/services/requestedService.entity';
import { ServiceItem } from '../../frameworks/secondary/services/serviceItem.entity';
import { ServiceOrder } from '../../frameworks/secondary/services/serviceOrder.entity';
import { Services } from '../../frameworks/secondary/services/services.entity';
import { RequestedServiceService } from '../../core/application/services/requestedService.service';
import { ServiceOrderService } from '../../core/application/services/serviceOrder.service';
import { ServicesService } from '../../core/application/services/services.service';

@Module({
  controllers: [ServicesController, ServiceOrderEmployeeController, ServiceOrderClientController],
  imports: [TypeOrmModule.forFeature([Services, ServiceOrder, RequestedService, ServiceItem, ResourcesByService, Stock, Resource])],
  providers: [ServicesService, ServiceOrderService, StockService, ResourceService, RequestedServiceService],
})
export class ServicesModule {}
