import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../../../utils/transformers';
import { ResourcesByService } from '../../secondary/resources/resourcesByService.entity';
import { PartsByService } from '../parts/partsByService.entity';
import { RequestedService } from './requestedService.entity';

@Entity({ name: 'tb_services' })
export class Services {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ transformer: new ColumnNumericTransformer(), type: 'numeric' })
  cost: number;

  @OneToMany(() => RequestedService, requestedService => requestedService.service)
  requestedService: RequestedService;

  @OneToMany(() => ResourcesByService, resources => resources.resource)
  resources: ResourcesByService[];

  @OneToMany(() => PartsByService, parts => parts.service)
  parts: PartsByService[];
}
