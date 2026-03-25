import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ServiceOrder } from '../entities/serviceOrder.entity';
import { ServiceOrderStatus } from '../enums/services.types';
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
      const dbServiceOrder = manager.create(ServiceOrder, {
        budget: 0,
        cost: 0,
        status: ServiceOrderStatus.PENDING,
        user: {
          id: serviceOrder.user_id,
        },
        vehicle: {
          id: serviceOrder.vehicle_id,
        },
      });

      const serviceOrderId: number = (await manager.save(dbServiceOrder)).id;
      await this.requestedServiceS.createRequestedServiceOrder(manager, serviceOrderId, serviceOrder.services);
    });
  }

  async getOrders(): Promise<null | ServiceOrder[]> {
    return await this.serviceOrderRepository.find({ relations: ['vehicle', 'user', 'requestedService'] });
  }

  async getOrderDetail(id: number): Promise<null | ServiceOrder> {
    return await this.serviceOrderRepository.findOne({ relations: ['vehicle', 'user', 'requestedService'], where: { id } });
  }
}
