import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RequestedServicePart } from '../services/requestedServicePart.entity';
import { PartsByService } from './partsByService.entity';

@Entity({ name: 'tb_parts' })
export class Part {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => PartsByService, services => services.part)
  services: PartsByService[];

  @OneToMany(() => RequestedServicePart, requestedService => requestedService.part)
  requestedServicePart: RequestedServicePart[];
}
