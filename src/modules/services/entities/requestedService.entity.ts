import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ServiceItem } from './serviceItem.entity';
import { ServiceOrder } from './serviceOrder.entity';
import { Services } from './services.entity';

@Entity({ name: 'tb_requested_service' })
export class RequestedService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  started_at: Date;

  @Column()
  finished_at: Date;

  @Column({ type: 'numeric' })
  cost: number;

  @OneToOne(() => Services, services => services.requestedService)
  @JoinColumn({ name: 'service_id' })
  service: Services;

  @ManyToOne(() => ServiceOrder, serviceOrder => serviceOrder.requestedService)
  @JoinColumn({ name: 'service_order_id' })
  serviceOrder: ServiceOrder;

  @OneToMany(() => ServiceItem, item => item.requestedService)
  serviceItem: ServiceItem;
}
