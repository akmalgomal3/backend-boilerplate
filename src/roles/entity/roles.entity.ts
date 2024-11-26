import { BaseColumn } from 'src/common/base-entity/base.entity';
import { Users } from 'src/users/entity/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('roles')
export class Roles extends BaseColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column({ type: 'varchar', length: 100 })
  role: string; 
}