import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RequestedServicesStatus, ServiceOrderStatus } from '../../../common/enums/services/services.enum';
import { ServiceOrderDTO } from '../../../frameworks/primary/dto/services/serviceOrder.model';
import { ServiceOrder } from '../../../frameworks/secondary/services/serviceOrder.entity';
import { User } from '../../../frameworks/secondary/users/users.entity';
import { RequestedServiceService } from './requestedService.service';
import { StatusClient } from '../../../modules/httpClient/status.client';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
    private readonly dataSource: DataSource,
    private readonly requestedServices: RequestedServiceService,
    private readonly statusClient: StatusClient
  ) { }

  async createServiceOrder(serviceOrder: ServiceOrderDTO): Promise<number> {
    const transaction = await this.dataSource.transaction(async (manager) => {
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
          id: serviceOrder.vehicle_id,
        },
      });

      const serviceOrderId: number = (await manager.save(dbServiceOrder)).id;
      await this.requestedServices.createRequestedServiceOrder(manager, serviceOrderId, serviceOrder.services);

      return { serviceOrderId: serviceOrderId };
    });

    if (transaction.serviceOrderId) {
      await this.statusClient.setStatus({
        service_order_number: transaction.serviceOrderId,
        status: RequestedServicesStatus.RECEBIDA,
      });
    }

    return transaction.serviceOrderId;
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
    try {
      await this.statusClient.setStatus({
        service_order_number: id,
        status: RequestedServicesStatus.ENTREGUE,
      });

      const serviceOrder = await this.getOrderDetail(id);
      serviceOrder.vehicle_delivered_at = new Date(vehicleDeliveredAt);
      this.serviceOrderRepository.save(serviceOrder);
  } catch(error) {
    throw new BadRequestException('Service order cannot be delivered');
  }
}
}
