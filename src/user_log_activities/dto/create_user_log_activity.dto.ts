import { IsNotEmpty } from "class-validator";

export class CreateUserLogActivityDTO {
    @IsNotEmpty()
    user_id: string

    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    activity_type: string;

    @IsNotEmpty()
    method: string;

    @IsNotEmpty()
    path: string;

    @IsNotEmpty()
    status_code: string;

    @IsNotEmpty()
    description: string;

    device?: Object

    auth_details?: Object

    timestamp: Date;
}