import type { Response } from 'express';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, ParseIntPipe, Post, Query, Res } from '@nestjs/common';
import { Roles } from '../../../../common/enums/auth/roles.enum';
import { RequestedServicesStatus } from '../../../../common/enums/services/services.enum';
import { RequestedServiceService } from '../../../../core/application/services/requestedService.service';
import { ServiceOrderService } from '../../../../core/application/services/serviceOrder.service';
import { RequestedService } from '../../../secondary/services/requestedService.entity';
import { ServiceOrder } from '../../../secondary/services/serviceOrder.entity';
import { CurrentUserId } from '../../decorators/auth/current-user.decorator';
import { RequireRoles } from '../../decorators/auth/role.decorator';
import { ServiceItemDTO } from '../../dto/services/serviceItem.model';
import { DeliverServiceOrderDTO, VehicleArrivedDTO } from '../../dto/services/serviceOrder.model';

@RequireRoles([Roles.ADMIN])
@Controller('services-order')
export class ServiceOrderEmployeeController {
  constructor(
    @Inject()
    private readonly serviceOrderService: ServiceOrderService,
    private readonly requestedServiceS: RequestedServiceService,
  ) { }

  @Get()
  async getOrders(@Res() res: Response) {
    const servicesOrder: null | ServiceOrder[] = await this.serviceOrderService.getOrders();
    return res.status(200).send(servicesOrder);
  }

  @Post('/item')
  async upsertItemOnRequestedService(
    @Body() item: ServiceItemDTO,
    @Res() res: Response,
    @CurrentUserId() employeeId: number,
  ) {
    await this.requestedServiceS.upsertItemOnRequestedService(item, employeeId);
    return res.status(201).send({ message: 'Item vínculado ao serviço com sucesso.' });
  }

  @Get('/requested/ongoing')
  async getOnGoingRequestedServices() {
    const requestedServices: RequestedService[] = await this.requestedServiceS.getOnGoingRequestedServices();
    return requestedServices;
  }

  @Get('/requested/received')
  async getReceivedRequestedService() {
    const requestedServices: RequestedService[] = await this.requestedServiceS.getRequestedServices(RequestedServicesStatus.RECEBIDA);
    return requestedServices;
  }

  @Get('/requested/average-duration')
  async getAverageDuration(
    @Query('serviceId') serviceId: string | undefined,
  ) {
    const id = serviceId ? Number(serviceId) : undefined;
    return await this.requestedServiceS.getAverageServiceDuration(id);
  }

  @Get('/requested/me')
  async getEmployeeRequestedService(
    @CurrentUserId() employeeId: number,
  ) {
    const requestedServices: RequestedService[] = await this.requestedServiceS.getEmployeeRequestedServices(employeeId);
    return requestedServices;
  }

  @Delete('/requested/:requestedServiceId/item/:serviceItemId')
  async deleteRequestedServiceItem(
    @Param('requestedServiceId', ParseIntPipe) requestedServiceId: number,
    @Param('serviceItemId', ParseIntPipe) serviceItemId: number,
    @Res() res: Response,
    @CurrentUserId() employeeId: number,
  ) {
    await this.requestedServiceS.deleteRequestedServiceItem(requestedServiceId, serviceItemId, employeeId);
    return res.status(200).send({ message: 'Item deletado com sucesso.' });
  }

  @Post('/requested/:requestedServiceId/assign')
  @HttpCode(HttpStatus.OK)
  async assignRequestedServiceToEmployee(
    @Param('requestedServiceId', ParseIntPipe) requestedServiceId: number,
    @CurrentUserId() employeeId: number,
  ) {
    await this.requestedServiceS.assignRequestedServiceToEmployee(
      employeeId,
      requestedServiceId,
    );
  }

  @Post('/requested/:requestedServiceId/review')
  @HttpCode(HttpStatus.OK)
  async reviewRequestedService(
    @Param('requestedServiceId', ParseIntPipe) requestedServiceId: number,
    @CurrentUserId() employeeId: number,
  ) {
    await this.requestedServiceS.reviewRequestedService(
      employeeId,
      requestedServiceId,
    );
  }

  @Post('/requested/:requestedServiceId/start')
  @HttpCode(HttpStatus.OK)
  async startRequestedService(
    @Param('requestedServiceId', ParseIntPipe) requestedServiceId: number,
    @CurrentUserId() employeeId: number,
  ) {
    await this.requestedServiceS.startRequestedService(
      employeeId,
      requestedServiceId,
    );
  }

  @Post('/requested/:requestedServiceId/finish')
  @HttpCode(HttpStatus.OK)
  async finishRequestedService(
    @Param('requestedServiceId', ParseIntPipe) requestedServiceId: number,
    @CurrentUserId() employeeId: number,
  ) {
    await this.requestedServiceS.finishRequestedService(
      employeeId,
      requestedServiceId,
    );
  }

  @Post('/:id/deliver')
  @HttpCode(HttpStatus.OK)
  async deliverRequestedService(
    @Param('id', ParseIntPipe) id: number,
    @Body() deliverDto: DeliverServiceOrderDTO,
  ) {
    await this.serviceOrderService.deliverServiceOrder(
      id,
      deliverDto.vehicle_delivered_at,
    );
  }

  @Post('/:id/vehicle-arrived')
  @HttpCode(HttpStatus.OK)
  async setVehicleArrived(
    @Param('id', ParseIntPipe) id: number,
    @Body() arrivedDto: VehicleArrivedDTO,
  ) {
    await this.serviceOrderService.setVehicleArrived(
      id,
      arrivedDto.vehicle_arrived_at,
    );
  }
}
