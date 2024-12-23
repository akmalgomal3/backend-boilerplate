import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Features } from './features.entity';
import { Roles } from 'src/roles/entity/roles.entity';

@Entity('access_feature')
export class AccessFeature {
  @PrimaryGeneratedColumn('uuid')
  accessFeatureId: string;

  @ManyToOne(() => Features)
  @JoinColumn({ name: 'feature_id' })
  feature: Partial<Features>;

  @ManyToOne(() => Roles)
  @JoinColumn({ name: 'role_id' })
  role: Partial<Roles>;

  @Column({ default: false })
  canAccess: boolean;

  @Column({ default: false })
  canRead: boolean;

  @Column({ default: false })
  canUpdate: boolean;

  @Column({ default: false })
  canDelete: boolean;

  @Column({ default: false })
  canInsert: boolean;

  @CreateDateColumn({ default: () => 'NOW()', name: 'created_at' })
  @Column()
  createdAt: Date;

  @UpdateDateColumn({ default: () => 'NOW()', name: 'updated_at' })
  @Column()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
