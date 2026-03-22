import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResourcesByService } from '../../services/entities/resourcesByService.entity';
import { ResourceType, UnitType } from '../enums/resources.types';

@Entity({ name: 'tb_resource' })
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ enum: ResourceType, type: 'enum' })
  type: string;

  @Column({ type: 'numeric' })
  cost: number;

  @Column({ enum: UnitType, type: 'enum' })
  unit: string;

  @OneToMany(() => ResourcesByService, services => services.resource)
  services: ResourcesByService[];
}
