import { User } from '../../users/entities/users.entity';
import { Vehicle } from '../../vehicle/vehicle.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RequestedService } from './requestedService.entity';
import { ServiceOrderStatus } from '../enums/services.types';

@Entity({ name: 'tb_service_order' })
export class ServiceOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ServiceOrderStatus, type: 'enum' })
  status: string;

  @Column({ type: 'numeric' })
  budget: number;

  @Column({ type: 'numeric' })
  cost: number;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => RequestedService, requestedService => requestedService.serviceOrder)
  requestedService: RequestedService;

  @ManyToOne(() => Vehicle, vehicle => vehicle.serviceOrder)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;
}
