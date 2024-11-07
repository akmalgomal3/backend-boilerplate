export type ApiResponse<T> = {
    statusCode: number;
    message: string;
    data?: T;
    meta?: {
        [key: string]: any;
    };
};