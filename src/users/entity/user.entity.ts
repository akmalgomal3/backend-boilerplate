import { Entity, Column, PrimaryGeneratedColumn, Timestamp } from 'typeorm';

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    user_id: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column()
    role_id: string;

    @Column()
    full_name: string;

    @Column()
    active: boolean;

    @Column()
    created_by: string;

    @Column()
    created_at: Date;

    @Column()
    updated_by: string;

    @Column()
    updated_at: Date;

    @Column()
    is_dev: boolean;
}