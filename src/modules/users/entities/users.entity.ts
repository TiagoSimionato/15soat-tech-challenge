import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column({ enum: LegalNature, name: 'legal_narute', type: 'enum' })
  legalNature: LegalNature;

  @ManyToMany(() => Role)
  @JoinTable({ name: 'tb_user_role' })
  roles: Role[];
}
