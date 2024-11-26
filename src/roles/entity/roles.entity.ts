import { BaseColumn } from 'src/common/base-entity/base.entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('roles')
export class Roles extends BaseColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column({ type: 'varchar', length: 100 })
  role: string; 
}