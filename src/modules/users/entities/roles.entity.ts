import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_role' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authority: string;
}
