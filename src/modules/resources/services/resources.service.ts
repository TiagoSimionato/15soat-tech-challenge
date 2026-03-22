import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { Resource } from '../entities/resources.entity';
import { ResourceDTO } from '../models/resource.model';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
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

  async listResourcesOfAService(serviceId: number) {
    return await this.resourceByServiceRepository.findBy({ service: { id: serviceId } });
  }

  async listOneResource(id: number): Promise<null | Resource> {
    return await this.resourceRepository.findOneBy({
      id,
    });
  }

  async updateResource(id: number, resource: ResourceDTO): Promise<UpdateResult> {
    return await this.resourceRepository.update({ id }, resource);
  }

  async updateResourceQuantityOfAService() {

  }

  async deleteResource(id: number): Promise<DeleteResult> {
    return await this.resourceRepository.delete({ id });
  }
}
