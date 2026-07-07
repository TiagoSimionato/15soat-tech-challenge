import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Resource } from '../../secondary/resources/resources.entity';
import { ServiceItem } from '../../secondary/services/serviceItem.entity';

@Entity({ name: 'tb_stock' })
@Unique(['resource'])
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @OneToOne(() => Resource, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;

  @OneToMany(() => ServiceItem, serviceItem => serviceItem.stock)
  serviceItem: ServiceItem;
}
