import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Services } from '../../secondary/services/services.entity';
import { Part } from './parts.entity';

@Entity({ name: 'tb_parts_by_service' })
export class PartsByService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Services, service => service.parts)
  @JoinColumn({ name: 'service_id' })
  service: Services;

  @ManyToOne(() => Part, part => part.services)
  @JoinColumn({ name: 'part_id' })
  part: Part;
}
