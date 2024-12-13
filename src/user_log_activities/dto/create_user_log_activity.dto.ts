import { IsNotEmpty } from "class-validator";

export class CreateUserLogActivityDTO {
    @IsNotEmpty()
    userId?: string

    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    activityType: string;

    @IsNotEmpty()
    method: string;

    @IsNotEmpty()
    path: string;

    @IsNotEmpty()
    statusCode: string;

    @IsNotEmpty()
    description: string;

    device?: {
        type?: string, 
        info?: {
            ipAddress: string, 
            latitude?: Number, 
            longitude?: Number
        }
    }

    authDetails?: {
        loginTime?: Date;
        logoutTime?: Date;
    }
}