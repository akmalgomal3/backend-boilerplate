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

// user auth is for temporary user who is not approved by admin
@Entity('users_auth')
export class UsersAuth {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @ManyToOne(() => Roles)
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @Column({ type: 'date' })
  birthdate: string;

  @Column({ type: 'boolean' })
  active: boolean;

  @CreateDateColumn({ default: () => 'NOW()' })
  @Column()
  createdAt: Date;

  @UpdateDateColumn({ default: () => 'NOW()' })
  @Column()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
