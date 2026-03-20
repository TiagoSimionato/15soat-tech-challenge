import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/entities/users.entity';

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

  @Column()
  plate: string;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, user => user.vehicles, { cascade: ['remove', 'insert', 'update'], nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;
}
