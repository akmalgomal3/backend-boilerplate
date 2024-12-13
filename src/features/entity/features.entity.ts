import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('features')
export class Features {
  @PrimaryGeneratedColumn('uuid')
  featureId: string;

  @Column({ type: 'varchar' })
  featureName: string;

  @Column({ type: 'uuid', nullable: true })
  menuId: string | null;

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
  updated_At: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
