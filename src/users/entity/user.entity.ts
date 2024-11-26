import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoles } from '../../common/enums/user.enum';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: UserRoles })
  role: string;

  @Column({ type: 'int', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'boolean', default: false })
  is_banned: boolean;

  @Column({ type: 'text', nullable: true, default: null })
  ban_reason: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: (): string => 'NOW()',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: (): string => 'NOW()',
    onUpdate: 'NOW()',
  })
  updated_at: Date;
}
