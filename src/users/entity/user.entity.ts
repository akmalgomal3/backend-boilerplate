import { BaseColumn } from 'src/common/base-entity/base.entity';
import { Roles } from 'src/roles/entity/roles.entity';
import { Entity, Column, PrimaryGeneratedColumn, Timestamp, ManyToOne } from 'typeorm';

@Entity()
export class Users extends BaseColumn {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    role_id: string;

    @Column({ unique: true })
    email: string;
  
    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    full_name: string;

    @Column()
    created_by: string;

    @Column({ default: false })
    active: boolean;

    @Column({ type: 'int', default: 5 })
    login_attemp: number;

    @Column()
    is_dev: boolean;
}