import { IsNotEmpty } from "class-validator";

export class CreateUserLogActivityByUserDTO {
    @IsNotEmpty()
    method: string;

    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    path: string;

    params?: Object

    @IsNotEmpty()
    statusCode: string;

    @IsNotEmpty()
    description?: string;
}