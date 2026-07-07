import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Services } from '../../secondary/services/services.entity';
import { Resource } from './resources.entity';

@Entity({ name: 'tb_resources_by_service' })
export class ResourcesByService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Services, service => service.resources)
  @JoinColumn({ name: 'service_id' })
  service: Services;

  @ManyToOne(() => Resource, resource => resource.services)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;

  @Column()
  min_quantity: number;
}
