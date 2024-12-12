import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Roles } from '../../roles/entity/roles.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar' })
  full_name: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  phone_number: string;

  @ManyToOne(() => Roles)
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column({ type: 'boolean' })
  active: boolean;

  @CreateDateColumn({ default: () => 'NOW()' })
  @Column()
  created_at: Date;

  @UpdateDateColumn({ default: () => 'NOW()' })
  @Column()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;
}
