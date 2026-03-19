import { Resource } from 'src/modules/resources/entities/resources.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_stock' })
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @OneToOne(() => Resource)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
