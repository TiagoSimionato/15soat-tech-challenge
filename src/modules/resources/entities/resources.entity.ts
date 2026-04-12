import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../../../common/transformers';
import { ResourceType, UnitType } from '../enums/resources.types';
import { ResourcesByService } from './resourcesByService.entity';

@Entity({ name: 'tb_resource' })
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ enum: ResourceType, type: 'enum' })
  type: string;

  @Column({ transformer: new ColumnNumericTransformer(), type: 'numeric' })
  cost: number;

  @Column({ enum: UnitType, type: 'enum' })
  unit: string;

  @OneToMany(() => ResourcesByService, services => services.resource)
  services: ResourcesByService[];
}
