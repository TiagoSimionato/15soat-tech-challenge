import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { ResourceDTO } from '../../../frameworks/primary/dto/resources/resource.model';
import { Resource } from '../../../frameworks/secondary/resources/resources.entity';
import { ResourcesByService } from '../../../frameworks/secondary/resources/resourcesByService.entity';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(ResourcesByService)
    private readonly resourceByServiceRepository: Repository<ResourcesByService>,
  ) { }

  async createResource(resource: ResourceDTO) {
    const dbResource = this.resourceRepository.create({
      cost: resource.cost,
      name: resource.name,
      type: resource.type,
      unit: resource.unit,
    });
    await this.resourceRepository.save(dbResource);
  }

  async createResourceForService(serviceId: number, resourceId: number, min_quantity: number) {
    const resourceByService = this.resourceByServiceRepository.create({
      min_quantity,
      resource: {
        id: resourceId,
      },
      service: {
        id: serviceId,
      },
    });

    await this.resourceByServiceRepository.save(resourceByService);
  }

  async listResources(): Promise<Resource[]> {
    return await this.resourceRepository.find();
  }

  async listResourcesOfAService(serviceId: number, manager?: EntityManager): Promise<ResourcesByService[]> {
    const repo = manager ? manager.getRepository(ResourcesByService) : this.resourceByServiceRepository;

    return await repo.find({
      relations: ['resource'],
      where: {
        service: {
          id: serviceId,
        },
      },
    });
  }

  async listOneResource(id: number, manager?: EntityManager): Promise<null | Resource> {
    const repo = manager ? manager.getRepository(Resource) : this.resourceRepository;
    return await repo.findOneBy({
      id,
    });
  }

  async updateResource(id: number, resource: ResourceDTO): Promise<UpdateResult> {
    return await this.resourceRepository.update({ id }, resource);
  }

  async updateResourceQuantityOfAService(resourceServiceId: number, min_quantity: number): Promise<UpdateResult> {
    return await this.resourceByServiceRepository.update({ id: resourceServiceId }, { min_quantity });
  }

  async deleteResource(id: number): Promise<DeleteResult> {
    return await this.resourceRepository.delete({ id });
  }

  async deleteResourceOfAService(resourceServiceId: number): Promise<DeleteResult> {
    return await this.resourceByServiceRepository.delete({ id: resourceServiceId });
  }
}
