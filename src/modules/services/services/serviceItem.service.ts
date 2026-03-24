import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceItem } from '../entities/serviceItem.entity';
import { ServiceItemDTO } from '../models/serviceItem.model';

@Injectable()
export class ServiceItemService {
  constructor(
    @InjectRepository(ServiceItem)
    private readonly serviceItemRepository: Repository<ServiceItem>,
  ) { }

  async upsertItemOnRequestedService(serviceItem: ServiceItemDTO) {
    await this.serviceItemRepository.upsert({
      amount: serviceItem.amount,
      requestedService: {
        id: serviceItem.requested_service_id,
      },
      stock: {
        id: serviceItem.stock_id,
      },
    }, ['stock.id', 'requestedService.id']);
  }
}
