import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Services } from '../../secondary/services/services.entity';

@Entity({ name: 'tb_resources_by_service' })
export class ResourcesByService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Services, service => service.resources)
  @JoinColumn({ name: 'service_id' })
  service: Services;

  @Column()
  resource: string;

  @Column()
  min_quantity: number;
}
