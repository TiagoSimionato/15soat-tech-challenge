import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Stock } from '../../stock/entities/stock.entity';
import { RequestedService } from './requestedService.entity';

@Entity({ name: 'tb_service_item' })
export class ServiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @ManyToOne(() => Stock, stock => stock.serviceItem)
  @JoinColumn({ name: 'stockId' })
  stock: Stock;

  @ManyToOne(() => RequestedService, requestedService => requestedService.serviceItem)
  @JoinColumn({ name: 'requested_service_id' })
  requestedService: RequestedService;
}
