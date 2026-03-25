import type { Response } from 'express';
import { Body, Controller, Delete, Get, Inject, Param, Post, Res } from '@nestjs/common';
import { RequireRoles } from 'src/modules/auth/decorators/role.decorator';
import { Roles } from 'src/modules/auth/enums/roles.enum';
import { RequestedService } from '../entities/requestedService.entity';
import { ServiceItem } from '../entities/serviceItem.entity';
import { ServiceOrder } from '../entities/serviceOrder.entity';
import { ServiceItemDTO } from '../models/serviceItem.model';
import { ServiceOrderDTO } from '../models/serviceOrder.model';
import { RequestedServiceService } from '../services/requestedService.service';
import { ServiceOrderService } from '../services/serviceOrder.service';

@Controller('services_order')
export class ServiceOrderController {
  constructor(
    @Inject()
    private serviceOrderService: ServiceOrderService,
    private requestedServiceS: RequestedServiceService,
  ) { }

  @RequireRoles([Roles.ADMIN])
  @Get()
  async getOrders(@Res() res: Response) {
    try {
      const servicesOrder: null | ServiceOrder[] = await this.serviceOrderService.getOrders();
      return res.status(200).send(servicesOrder);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Post()
  async createServiceOrder(@Body() order: ServiceOrderDTO, @Res() res: Response) {
    try {
      await this.serviceOrderService.createServiceOrder(order);
      return res.status(201).send({ message: 'Ordem de serviço criada com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @RequireRoles([Roles.ADMIN])
  @Post('/item')
  async upsertItemOnRequestedService(@Body() item: ServiceItemDTO, @Res() res: Response) {
    try {
      await this.requestedServiceS.upsertItemOnRequestedService(item);
      return res.status(201).send({ message: 'Item vínculado ao serviço com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get('/requested/:id')
  async getRequestedServiceDetail(@Param() requestedServiceId, @Res() res: Response) {
    try {
      const requestedService: null | RequestedService = await this.requestedServiceS.getRequestedServiceDetail(requestedServiceId.id);
      return res.status(200).send(requestedService);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get('/requested/:id/items')
  async getServiceItemsByRequestedServiceId(@Param() requestedServiceId, @Res() res: Response) {
    try {
      const items: null | ServiceItem[] = await this.requestedServiceS.getServiceItemsByRequestedServiceId(requestedServiceId.id);
      return res.status(200).send(items);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @Get('/:id')
  async getOrderDetail(@Param() serviceOrderId, @Res() res: Response) {
    try {
      const serviceOrder: null | ServiceOrder = await this.serviceOrderService.getOrderDetail(serviceOrderId.id);
      return res.status(200).send(serviceOrder);
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }

  @RequireRoles([Roles.ADMIN])
  @Delete('/requested/:requestedServiceId/item/:serviceItemId')
  async deleteRequestedServiceItem(@Param() requestedServiceId, @Param() serviceItemId, @Res() res: Response) {
    try {
      await this.requestedServiceS.deleteRequestedServiceItem(requestedServiceId.requestedServiceId, serviceItemId.serviceItemId);
      return res.status(200).send({ message: 'Item deletado com sucesso.' });
    }
    catch (error) {
      return res.status(500).send({ message: error });
    }
  }
}
