import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { AccessMenu } from './access_menu.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  menuId: string;

  @Column({ type: 'varchar' })
  menuName: string;

  @Column({ type: 'uuid', nullable: true })
  parentMenuId: string | null;

  @Column({ type: 'varchar' })
  routePath: string;

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ type: 'int' })
  hierarchyLevel: number;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'NOW()',
  })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @OneToMany(() => AccessMenu, (accessMenu) => accessMenu.menu) 
  accessMenu: AccessMenu[];
}