import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../../../users/entity/user.entity';
import { DeviceType } from '../../../common/enums/user.enum';

@Entity()
export class Sessions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    (): typeof Users => Users,
    (user: Users): Sessions[] => user.sessions,
    {
      onDelete: 'CASCADE',
    },
  )
  user_id: Users;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp' })
  last_activity: Date;

  @Column({ type: 'enum', enum: DeviceType })
  device_type: DeviceType;
}
