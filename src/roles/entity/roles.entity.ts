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
  roleId: string;

  @Column({ type: 'enum', enum: RoleType })
  roleType: RoleType;

  @Column({ type: 'varchar' })
  roleName: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  @Column()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  @Column()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
