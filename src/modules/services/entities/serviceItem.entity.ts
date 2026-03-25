import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Stock } from '../../stock/entities/stock.entity';
import { RequestedService } from './requestedService.entity';

@Entity({ name: 'tb_service_item' })
@Unique(['stock', 'requestedService'])
export class ServiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @ManyToOne(() => Stock, stock => stock.serviceItem)
  @JoinColumn({ name: 'stock_id' })
  stock: Stock;

  @ManyToOne(() => RequestedService, requestedService => requestedService.serviceItem)
  @JoinColumn({ name: 'requested_service_id' })
  requestedService: RequestedService;
}
