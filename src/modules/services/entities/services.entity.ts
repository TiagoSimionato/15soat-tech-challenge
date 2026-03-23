import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @OneToOne(() => RequestedService, requestedService => requestedService.service)
  requestedService: RequestedService;

  @OneToMany(() => ResourcesByService, resources => resources.resource)
  resources: ResourcesByService[];
}
