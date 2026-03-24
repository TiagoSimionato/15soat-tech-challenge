import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResourcesByService } from '../../resources/entities/resourcesByService.entity';
import { RequestedService } from './requestedService.entity';

@Entity({ name: 'tb_services' })
export class Services {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'numeric' })
  cost: number;

  @OneToMany(() => RequestedService, requestedService => requestedService.service)
  requestedService: RequestedService;

  @OneToMany(() => ResourcesByService, resources => resources.resource)
  resources: ResourcesByService[];
}
