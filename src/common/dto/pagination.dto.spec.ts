import { PaginationDto, PaginatedResponseDto } from './pagination.dto';

describe('PaginationDto', () => {
    it('should create pagination dto with valid values', () => {
        const pagination = new PaginationDto();
        pagination.page = 1;
        pagination.limit = 10;

        expect(pagination).toBeDefined();
        expect(pagination.page).toBe(1);
        expect(pagination.limit).toBe(10);
    });

    it('should allow setting different pagination values', () => {
        const pagination = new PaginationDto();
        pagination.page = 2;
        pagination.limit = 20;

        expect(pagination.page).toBe(2);
        expect(pagination.limit).toBe(20);
    });
});

describe('PaginatedResponseDto', () => {
    interface TestData {
        id: number;
        name: string;
    }

    it('should create paginated response with valid data', () => {
        const testData: TestData[] = [
            { id: 1, name: 'Test 1' },
            { id: 2, name: 'Test 2' }
        ];

        const response = new PaginatedResponseDto<TestData>();
        response.data = testData;
        response.metadata = {
            page: 1,
            limit: 10,
            totalPages: 1,
            totalItems: 2
        };

        expect(response).toBeDefined();
        expect(response.data).toHaveLength(2);
        expect(response.metadata).toBeDefined();
        expect(response.metadata.page).toBe(1);
        expect(response.metadata.limit).toBe(10);
        expect(response.metadata.totalPages).toBe(1);
        expect(response.metadata.totalItems).toBe(2);
    });

    it('should handle empty data array', () => {
        const response = new PaginatedResponseDto<TestData>();
        response.data = [];
        response.metadata = {
            page: 1,
            limit: 10,
            totalPages: 0,
            totalItems: 0
        };

        expect(response.data).toHaveLength(0);
        expect(response.metadata.totalItems).toBe(0);
        expect(response.metadata.totalPages).toBe(0);
    });

    it('should handle multiple pages of data', () => {
        const testData: TestData[] = [
            { id: 1, name: 'Test 1' },
            { id: 2, name: 'Test 2' }
        ];

        const response = new PaginatedResponseDto<TestData>();
        response.data = testData;
        response.metadata = {
            page: 2,
            limit: 2,
            totalPages: 3,
            totalItems: 5
        };

        expect(response.data).toHaveLength(2);
        expect(response.metadata.page).toBe(2);
        expect(response.metadata.totalPages).toBe(3);
        expect(response.metadata.totalItems).toBe(5);
    });

    it('should work with different data types', () => {
        interface AnotherTestData {
            code: string;
            value: number;
        }

        const testData: AnotherTestData[] = [
            { code: 'A', value: 100 },
            { code: 'B', value: 200 }
        ];

        const response = new PaginatedResponseDto<AnotherTestData>();
        response.data = testData;
        response.metadata = {
            page: 1,
            limit: 10,
            totalPages: 1,
            totalItems: 2
        };

        expect(response.data[0].code).toBe('A');
        expect(response.data[1].value).toBe(200);
    });
});