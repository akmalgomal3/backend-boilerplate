import { ApiProperty } from "@nestjs/swagger"

export class UserActivityFilterDTO {
    @ApiProperty({
        description: 'action of user activity',
        example: 'LOGIN',
    })
    action: string

    @ApiProperty({
        description: 'date to filter start date user activity',
        example: '2024-12-3',
    })
    startDate: string

    @ApiProperty({
        description: 'date to filter end date user activity',
        example: '2024-12-4',
    })
    endDate: string
}