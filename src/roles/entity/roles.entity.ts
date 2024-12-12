import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleType } from '../../common/enums/user-roles.enum';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn('uuid')
  role_id: string;

  @Column({ type: 'enum', enum: RoleType })
  role_type: RoleType;

  @Column({ type: 'varchar' })
  role_name: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  @Column()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  @Column()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;
}
