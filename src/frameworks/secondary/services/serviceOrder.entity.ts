import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../../../utils/transformers';
import { User } from '../../secondary/users/users.entity';
import { Vehicle } from '../../secondary/vehicle/vehicle.entity';
import { ServiceOrderStatus } from '../../../common/enums/services/services.enum';
import { RequestedService } from './requestedService.entity';

@Entity({ name: 'tb_service_order' })
export class ServiceOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ServiceOrderStatus, type: 'enum' })
  status: ServiceOrderStatus;

  @Column({ transformer: new ColumnNumericTransformer(), type: 'numeric' })
  budget: number;

  @Column({ transformer: new ColumnNumericTransformer(), type: 'numeric' })
  cost: number;

  @Column({ nullable: true, type: 'timestamptz' })
  vehicle_arrived_at: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  vehicle_delivered_at: Date;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => RequestedService, requestedService => requestedService.serviceOrder, { cascade: ['update'] })
  requestedServices: RequestedService[];

  @ManyToOne(() => Vehicle, vehicle => vehicle.serviceOrder)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;
}
