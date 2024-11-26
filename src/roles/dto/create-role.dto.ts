import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRoleDTO {
    @ApiProperty({
        description: 'The name of the role',
        example: 'Admin',
        maxLength: 100,
    })
    @IsNotEmpty()
    role: string; 
}