import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { ServiceOrder } from '../entities/serviceOrder.entity';
import { RequestedServicesStatus, ServiceOrderStatus } from '../enums/services.types';
import { ServiceOrderDTO } from '../models/serviceOrder.model';
import { RequestedServiceService } from './requestedService.service';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
    private readonly dataSource: DataSource,
    private readonly requestedServiceS: RequestedServiceService,
  ) { }

  async createServiceOrder(serviceOrder: ServiceOrderDTO) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { document: serviceOrder.userDocument } });

      if (!user)
        throw new BadRequestException('No user with provided document');

      const dbServiceOrder = manager.create(ServiceOrder, {
        budget: 0,
        cost: 0,
        status: ServiceOrderStatus.PENDENTE,
        user: {
          id: user.id,
        },
        vehicle: {
          id: serviceOrder.vehicleId,
        },
      });

      const serviceOrderId: number = (await manager.save(dbServiceOrder)).id;
      await this.requestedServiceS.createRequestedServiceOrder(manager, serviceOrderId, serviceOrder.services);
    });
  }

  async getOrders(): Promise<null | ServiceOrder[]> {
    return await this.serviceOrderRepository.find({ relations: ['vehicle', 'user', 'requestedServices'] });
  }

  async getOrderDetail(id: number): Promise<null | ServiceOrder> {
    return await this.serviceOrderRepository.findOne({ relations: ['vehicle', 'user', 'requestedServices'], where: { id } });
  }

  async deliverServiceOrder(id: number) {
    const serviceOrder = await this.serviceOrderRepository.findOne({ relations: ['requestedServices'], where: { id } });

    if (!serviceOrder)
      throw new BadRequestException('Service order not found');

    const allValidStatus = serviceOrder.requestedServices.every(requestedService =>
      requestedService.status === RequestedServicesStatus.FINALIZADA || requestedService.status === RequestedServicesStatus.CANCELADO);
    const anyFinished = serviceOrder.requestedServices.some(requestedService =>
      requestedService.status === RequestedServicesStatus.FINALIZADA);
    const canDeliver = anyFinished && allValidStatus;

    if (!canDeliver)
      throw new BadRequestException('Service order cannot be delivered');

    serviceOrder.status = ServiceOrderStatus.ENTREGUE;
    serviceOrder.requestedServices.forEach((requestedService) => {
      if (requestedService.status === RequestedServicesStatus.FINALIZADA) {
        requestedService.status = RequestedServicesStatus.ENTREGUE;
      }
    });
    this.serviceOrderRepository.save(serviceOrder);
  }
}
