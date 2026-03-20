import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Resource } from '../../resources/entities/resources.entity';

@Entity({ name: 'tb_stock' })
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @OneToOne(() => Resource, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
