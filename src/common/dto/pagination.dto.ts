export class PaginationDto {
    page: number;
    limit: number;
    // isBanned: boolean;
}

export class PaginatedResponseDto<T> {
    data: T[];
    metadata: {
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
    };
}