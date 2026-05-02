import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly requestedServices: RequestedServiceService,
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
      await this.requestedServices.createRequestedServiceOrder(manager, serviceOrderId, serviceOrder.services);
    });
  }

  async getOrders(): Promise<null | ServiceOrder[]> {
    return await this.serviceOrderRepository.find({ relations: ['vehicle', 'user', 'requestedServices'] });
  }

  async getClientOrders(clientId: number): Promise<ServiceOrder[]> {
    return await this.serviceOrderRepository.find({
      relations: ['vehicle', 'user', 'requestedServices'],
      where: { user: { id: clientId } },
    });
  }

  async getOrderDetail(id: number): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findOne({ relations: ['vehicle', 'user', 'requestedServices'], where: { id } });

    if (!serviceOrder)
      throw new NotFoundException('Service Order not found');

    return serviceOrder;
  }

  async setVehicleArrived(id: number, vehicleArrivedAt: string) {
    const serviceOrder = await this.getOrderDetail(id);

    serviceOrder.vehicle_arrived_at = new Date(vehicleArrivedAt);
    await this.serviceOrderRepository.save(serviceOrder);
  }

  async deliverServiceOrder(id: number, vehicleDeliveredAt: string) {
    const serviceOrder = await this.getOrderDetail(id);

    const allValidStatus = serviceOrder.requestedServices.every(requestedService =>
      requestedService.status === RequestedServicesStatus.FINALIZADA || requestedService.status === RequestedServicesStatus.CANCELADO);
    const anyFinished = serviceOrder.requestedServices.some(requestedService =>
      requestedService.status === RequestedServicesStatus.FINALIZADA);
    const canDeliver = anyFinished && allValidStatus;

    if (!canDeliver)
      throw new BadRequestException('Service order cannot be delivered');

    serviceOrder.vehicle_delivered_at = new Date(vehicleDeliveredAt);
    serviceOrder.status = ServiceOrderStatus.ENTREGUE;
    serviceOrder.requestedServices.forEach((requestedService) => {
      if (requestedService.status === RequestedServicesStatus.FINALIZADA) {
        requestedService.status = RequestedServicesStatus.ENTREGUE;
      }
    });
    this.serviceOrderRepository.save(serviceOrder);
  }
}
