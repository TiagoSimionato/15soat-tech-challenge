import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartsService } from '../../core/application/parts/parts.service';
import { ResourceService } from '../../core/application/resources/resources.service';
import { RequestedServiceService } from '../../core/application/services/requestedService.service';
import { ServiceOrderService } from '../../core/application/services/serviceOrder.service';
import { ServicesService } from '../../core/application/services/services.service';
import { ServiceOrderClientController } from '../../frameworks/primary/controllers/services/serviceOrderClient.controller';
import { ServiceOrderEmployeeController } from '../../frameworks/primary/controllers/services/serviceOrderEmployee.controller';
import { ServicesController } from '../../frameworks/primary/controllers/services/services.controller';
import { PartsByService } from '../../frameworks/secondary/parts/partsByService.entity';
import { ResourcesByService } from '../../frameworks/secondary/resources/resourcesByService.entity';
import { RequestedService } from '../../frameworks/secondary/services/requestedService.entity';
import { RequestedServicePart } from '../../frameworks/secondary/services/requestedServicePart.entity';
import { ServiceItem } from '../../frameworks/secondary/services/serviceItem.entity';
import { ServiceOrder } from '../../frameworks/secondary/services/serviceOrder.entity';
import { Services } from '../../frameworks/secondary/services/services.entity';
import { STATUS_QUEUE_OPTIONS } from '../../infrastructure/rabbitmq.config';
import { STATUS_QUEUE_CLIENT, StatusClient } from '../httpClient/status.client';
import { StockServiceClient } from '../httpClient/stock.client';

@Module({
  controllers: [ServicesController, ServiceOrderEmployeeController, ServiceOrderClientController],
  imports: [TypeOrmModule.forFeature([Services, ServiceOrder, RequestedService, ServiceItem, ResourcesByService, RequestedServicePart, PartsByService]), HttpModule, ClientsModule.registerAsync([
    {
      name: STATUS_QUEUE_CLIENT,
      useFactory: () => ({
        options: {
          persistent: true,
          queue: process.env.STATUS_QUEUE_NAME,
          queueOptions: STATUS_QUEUE_OPTIONS,
          urls: [process.env.RMQ_URL ?? 'amqp://localhost:5672'],
        },
        transport: Transport.RMQ,
      }),
    },
  ])],
  providers: [ServicesService, ServiceOrderService, ResourceService, RequestedServiceService, PartsService, StockServiceClient, StatusClient],
})
export class ServicesModule { }
