import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../users/entities/users.entity';
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
      const user = await manager.findOne(User, { where: { document: serviceOrder.userDocument } });

      if (!user)
        throw new BadRequestException('No user with provided document');

      const dbServiceOrder = manager.create(ServiceOrder, {
        budget: 0,
        cost: 0,
        status: ServiceOrderStatus.PENDING,
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
    return await this.serviceOrderRepository.find({ relations: ['vehicle', 'user', 'requestedService'] });
  }

  async getOrderDetail(id: number): Promise<null | ServiceOrder> {
    return await this.serviceOrderRepository.findOne({ relations: ['vehicle', 'user', 'requestedService'], where: { id } });
  }
}
