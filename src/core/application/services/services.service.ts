import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { ServicesDTO } from '../../../frameworks/primary/dto/services/services.model';
import { Services } from '../../../frameworks/secondary/services/services.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Services)
    private readonly servicesRepository: Repository<Services>,
  ) { }

  async createService(services: ServicesDTO) {
    const dbServices = this.servicesRepository.create(services);
    await this.servicesRepository.save(dbServices);
  }

  async listServices(): Promise<Services[]> {
    return await this.servicesRepository.find();
  }

  async listOneService(id: number, manager?: EntityManager): Promise<null | Services> {
    const repo = manager ? manager.getRepository(Services) : this.servicesRepository;
    return await repo.findOne({ where: { id } });
  }

  async updateService(id: number, service: ServicesDTO): Promise<UpdateResult> {
    return await this.servicesRepository.update({ id }, service);
  }

  async deleteService(id: number): Promise<DeleteResult> {
    return await this.servicesRepository.delete({ id });
  }
}
