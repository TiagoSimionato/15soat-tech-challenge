import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { ServiceOrder } from '../entities/serviceOrder.entity';
import { ServiceOrderDTO } from '../models/serviceOrder.model';
import { ServiceOrderStatus } from '../enums/services.types';

@Injectable()
export class ServiceOrderService {
    constructor(
        @InjectRepository(ServiceOrder)
        private readonly serviceOrderRepository: Repository<ServiceOrder>,
    ) { }

    async createServiceOrder(serviceOrder: ServiceOrderDTO) {
        const dbServiceOrder = this.serviceOrderRepository.create({
            budget: serviceOrder.budget,
            status: ServiceOrderStatus.PENDING,
            user: {
                id: serviceOrder.user_id
            },
            vehicle: {
                id: serviceOrder.vehicle_id
            }
        });
        await this.serviceOrderRepository.save(dbServiceOrder);
    }

    /*   async listServices(): Promise<Services[]> {
        return await this.serviceOrderRepository.find();
      }
    
      async listOneService(id: number): Promise<null | Services> {
        return await this.serviceOrderRepository.findOneBy({
          id,
        });
      }
    
      async updateService(id: number, service: ServicesDTO): Promise<UpdateResult> {
        return await this.serviceOrderRepository.update({ id }, service);
      }
    
      async deleteService(id: number): Promise<DeleteResult> {
        return await this.serviceOrderRepository.delete({ id });
      } */
}
