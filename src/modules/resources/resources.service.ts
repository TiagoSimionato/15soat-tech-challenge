import { Injectable } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { Resource } from './entities/resources.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceDTO } from './models/resource.model';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource> 
  ) {}

  async createResource(resource: ResourceDTO) {
    try {
      const dbResource = this.resourceRepository.create({
        name: resource.name,
        type: resource.type,
        cost: resource.cost,
        unit: resource.unit
      });
      await this.resourceRepository.save(dbResource);
    } catch (error) {
      throw error;
    }
  }

  async listResources(): Promise<Resource[]> {
    try {
      return await this.resourceRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async listOneResource(id: number): Promise<Resource | null> {
    try {
      return await this.resourceRepository.findOneBy({
        id: id
      });
    } catch (error) {
      throw error;
    }
  }

  async updateResource(id: number, resource: ResourceDTO) : Promise<UpdateResult>{
    try {
      return await this.resourceRepository.update({id: id}, resource)
    } catch (error) {
      throw error;
    }
  }

  async deleteResource(id: number) : Promise<DeleteResult>{
    try {
      return await this.resourceRepository.delete({id: id});
    } catch (error) {
      throw error;
    }
  }


}
