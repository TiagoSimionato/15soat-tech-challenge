import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RequestedService } from '../../services/entities/requestedService.entity';
import { ServiceOrder } from '../../services/entities/serviceOrder.entity';
import { Vehicle } from '../../vehicle/entities/vehicle.entity';
import { LegalNature } from '../enums/legalNature';
import { Role } from './roles.entity';

@Entity({ name: 'tb_user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  document: string;

  @Column({ enum: LegalNature, name: 'legal_nature', type: 'enum' })
  legalNature: LegalNature;

  @ManyToMany(() => Role)
  @JoinTable({ inverseJoinColumn: { name: 'role_id' }, joinColumn: { name: 'user_id' }, name: 'tb_user_role' })
  roles: Role[];

  @OneToMany(() => Vehicle, vehicle => vehicle.user)
  vehicles: Vehicle[];

  @OneToMany(() => ServiceOrder, serviceOrder => serviceOrder.user)
  orders: ServiceOrder[];

  @OneToMany(() => RequestedService, requestedService => requestedService.employee)
  workingServiceRequests: RequestedService[];
}
