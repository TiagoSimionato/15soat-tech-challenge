import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { RequestedService } from './requestedService.entity';

@Entity({ name: 'tb_service_item' })
@Unique(['stock', 'requestedService'])
export class ServiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  stock_id: number;

  @ManyToOne(() => RequestedService, requestedService => requestedService.serviceItem)
  @JoinColumn({ name: 'requested_service_id' })
  requestedService: RequestedService;
}
