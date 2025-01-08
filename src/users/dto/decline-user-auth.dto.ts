import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeclineUserAuthDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User Auth ID',
  })
  @IsUUID('all', { message: 'Invalid UUID format' })
  @IsNotEmpty({ message: 'userAuthId is required' })
  userAuthId: string;
}
