import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ServiceOrder } from '../services/serviceOrder.entity';
import { User } from '../users/users.entity';

@Entity({ name: 'tb_vehicle' })
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ unique: true })
  plate: string;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, user => user.vehicles, { cascade: ['remove', 'insert', 'update'], nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;

  @OneToMany(() => ServiceOrder, serviceOrder => serviceOrder.vehicle)
  serviceOrder: ServiceOrder[];
}
