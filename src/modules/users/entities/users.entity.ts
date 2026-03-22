import { ServiceOrder } from '../../services/entities/serviceOrder.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Vehicle } from '../../vehicle/vehicle.entity';
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

  @Column()
  password: string;

  @Column()
  document: string;

  @Column({ enum: LegalNature, name: 'legal_nature', type: 'enum' })
  legalNature: LegalNature;

  @ManyToMany(() => Role)
  @JoinTable({ name: 'tb_user_role' })
  roles: Role[];

  @OneToMany(() => Vehicle, vehicle => vehicle.user)
  vehicles: Vehicle[];

  @OneToMany(() => ServiceOrder, serviceOrder => serviceOrder.user)
  orders: ServiceOrder[];
}
