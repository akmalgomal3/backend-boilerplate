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
import { Menu } from './menus.entity';

@Entity('access_menu')
export class AccessMenu {
  @PrimaryGeneratedColumn('uuid')
  accessMenuId: string;

  @ManyToOne(() => Menu)
  @JoinColumn({ name: 'menu_id' })
  menu: Partial<Menu>;

  @ManyToOne(() => Roles)
  @JoinColumn({ name: 'role_id' })
  role: Partial<Roles>;

  @CreateDateColumn({ default: () => 'NOW()', name: "created_at"})
  @Column()
  createdAt: Date;

  @UpdateDateColumn({ default: () => 'NOW()', name: "updated_at"})
  @Column()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
