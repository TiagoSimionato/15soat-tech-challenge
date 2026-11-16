import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { ResourcesByService } from '../../../frameworks/secondary/resources/resourcesByService.entity';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(ResourcesByService)
    private readonly resourceByServiceRepository: Repository<ResourcesByService>,
  ) { }

  async createResourceForService(serviceId: number, resourceId: number, min_quantity: number) {
    const resourceByService = this.resourceByServiceRepository.create({
      min_quantity,
      resource_id: resourceId,
      service: {
        id: serviceId,
      },
    });

    await this.resourceByServiceRepository.save(resourceByService);
  }

  async listResourcesOfAService(serviceId: number, manager?: EntityManager): Promise<ResourcesByService[]> {
    const repo = manager ? manager.getRepository(ResourcesByService) : this.resourceByServiceRepository;

    return await repo.find({
      where: {
        service: {
          id: serviceId,
        },
      },
    });
  }

  async updateResourceQuantityOfAService(resourceServiceId: number, min_quantity: number): Promise<UpdateResult> {
    return await this.resourceByServiceRepository.update({ id: resourceServiceId }, { min_quantity });
  }

  async deleteResourceOfAService(resourceServiceId: number): Promise<DeleteResult> {
    return await this.resourceByServiceRepository.delete({ id: resourceServiceId });
  }
}
