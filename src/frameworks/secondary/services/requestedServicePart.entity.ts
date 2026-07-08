import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Part } from '../parts/parts.entity';
import { RequestedService } from './requestedService.entity';

@Entity({ name: 'tb_requested_service_part' })
@Unique(['part', 'requestedService'])
export class RequestedServicePart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Part, part => part.requestedServicePart)
  @JoinColumn({ name: 'part_id' })
  part: Part;

  @ManyToOne(() => RequestedService, requestedService => requestedService.requestedServicePart)
  @JoinColumn({ name: 'requested_service_id' })
  requestedService: RequestedService;
}
