import type { Response } from 'express';
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { CurrentUserId } from '../../auth/decorators/current-user';
import { RequestedService } from '../entities/requestedService.entity';
import { ServiceItem } from '../entities/serviceItem.entity';
import { ServiceOrder } from '../entities/serviceOrder.entity';
import { ServiceOrderDTO } from '../models/serviceOrder.model';
import { RequestedServiceService } from '../services/requestedService.service';
import { ServiceOrderService } from '../services/serviceOrder.service';

@Controller('services-order')
export class ServiceOrderClientController {
  constructor(
    @Inject()
    private readonly serviceOrderService: ServiceOrderService,
    private readonly requestedServiceS: RequestedServiceService,
  ) { }

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

  @Get('/requested/awaiting-approval')
  @HttpCode(HttpStatus.OK)
  async getAwaitingApprovalRequestedServices(
    @CurrentUserId() clientId: number,
  ) {
    return await this.requestedServiceS.listUserAwaitingApprovalRequestedServices(
      clientId,
    );
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

  @Post('/requested/:requestedServiceId/approve')
  @HttpCode(HttpStatus.OK)
  async approveRequestedService(
    @Param('requestedServiceId', ParseIntPipe) requestedServiceId: number,
    @CurrentUserId() clientId: number,
  ) {
    await this.requestedServiceS.approveRequestedService(
      clientId,
      requestedServiceId,
    );
  }

  @Post('/requested/:requestedServiceId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelRequestedService(
    @Param('requestedServiceId', ParseIntPipe) requestedServiceId: number,
    @CurrentUserId() clientId: number,
  ) {
    await this.requestedServiceS.cancelRequestedService(
      clientId,
      requestedServiceId,
    );
  }
}
