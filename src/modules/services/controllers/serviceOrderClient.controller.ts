import type { Response } from 'express';
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { CurrentUserId } from '../../auth/decorators/current-user.decorator';
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
    const serviceOrderId = await this.serviceOrderService.createServiceOrder(order);
    return res.status(201).send({ id: serviceOrderId, message: 'Ordem de serviço criada com sucesso.' });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getClientOrders(@CurrentUserId() clientId: number) {
    return await this.serviceOrderService.getClientOrders(clientId);
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
  async getRequestedServiceDetail(@Param('id', ParseIntPipe) requestedServiceId: number, @Res() res: Response) {
    const requestedService: RequestedService = await this.requestedServiceS.getRequestedService(requestedServiceId);
    return res.status(200).send(requestedService);
  }

  @Get('/requested/:id/items')
  async getServiceItemsByRequestedServiceId(@Param('id', ParseIntPipe) requestedServiceId: number, @Res() res: Response) {
    const items: null | ServiceItem[] = await this.requestedServiceS.getServiceItemsByRequestedServiceId(requestedServiceId);
    return res.status(200).send(items);
  }

  @Get('/:id')
  async getOrderDetail(@Param('id', ParseIntPipe) serviceOrderId: number, @Res() res: Response) {
    const serviceOrder: ServiceOrder = await this.serviceOrderService.getOrderDetail(serviceOrderId);
    return res.status(200).send(serviceOrder);
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
