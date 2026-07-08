import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PartsByService } from '../../../frameworks/secondary/parts/partsByService.entity';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(PartsByService)
    private readonly partsByServiceRepository: Repository<PartsByService>,
  ) { }

  async listOnePartByService(serviceId: number, partId: number, manager?: EntityManager): Promise<null | PartsByService> {
    const repo = manager ? manager.getRepository(PartsByService) : this.partsByServiceRepository;
    return await repo.findOne({ where: { part: { id: partId }, service: { id: serviceId } } });
  }
}
