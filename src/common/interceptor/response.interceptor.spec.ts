import { ResponseInterceptor } from './response.interceptor';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ApiResponse } from '../types/response.type';

describe('ResponseInterceptor', () => {
    let interceptor: ResponseInterceptor<any>;
    let mockExecutionContext: ExecutionContext;
    let mockCallHandler: any;
    let mockHttpResponse: any;

    beforeEach(() => {
        interceptor = new ResponseInterceptor();

        mockHttpResponse = {
            statusCode: HttpStatus.OK,
        };

        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: jest.fn().mockReturnValue(mockHttpResponse),
                getRequest: jest.fn(),
            }),
        } as any;

        mockCallHandler = {
            handle: jest.fn(),
        };
    });

    describe('Success Scenarios', () => {
        it('should transform response with existing statusCode and message', (done) => {
            const mockData = {
                statusCode: HttpStatus.CREATED,
                message: 'Created successfully',
                result: { id: 1, name: 'Test' },
            };

            mockCallHandler.handle.mockReturnValue(of(mockData));

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe((result: ApiResponse<any>) => {
                    expect(result).toEqual({
                        statusCode: HttpStatus.CREATED,
                        message: 'Created successfully',
                        data: { id: 1, name: 'Test' },
                    });
                    done();
                });
        });

        it('should transform response with meta data', (done) => {
            const mockData = {
                statusCode: HttpStatus.OK,
                message: 'Success',
                data: [{ id: 1 }],
                meta: { total: 1, page: 1 },
            };

            mockCallHandler.handle.mockReturnValue(of(mockData));

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe((result: ApiResponse<any>) => {
                    expect(result).toEqual({
                        statusCode: HttpStatus.OK,
                        message: 'Success',
                        data: [{ id: 1 }],
                        meta: { total: 1, page: 1 },
                    });
                    done();
                });
        });

        it('should handle plain data response', (done) => {
            const mockData = { id: 1, name: 'Test' };

            mockCallHandler.handle.mockReturnValue(of(mockData));

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe((result: ApiResponse<any>) => {
                    expect(result).toEqual({
                        statusCode: HttpStatus.OK,
                        message: 'Success',
                        data: mockData,
                    });
                    done();
                });
        });

        it('should handle null data response', (done) => {
            mockCallHandler.handle.mockReturnValue(of(null));

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe((result: ApiResponse<any>) => {
                    expect(result).toEqual({
                        statusCode: HttpStatus.OK,
                        message: 'Success',
                        data: null,
                    });
                    done();
                });
        });
    });

    describe('Error Scenarios', () => {
        it('should handle known HTTP exceptions', (done) => {
            const errorMessage = 'Not Found';
            const error = new HttpException(errorMessage, HttpStatus.NOT_FOUND);

            mockCallHandler.handle.mockReturnValue(throwError(() => error));

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    error: (error: HttpException) => {
                        const response = error.getResponse() as ApiResponse<null>;
                        expect(response).toEqual({
                            statusCode: HttpStatus.NOT_FOUND,
                            message: errorMessage,
                            data: null,
                        });
                        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
                        done();
                    },
                });
        });

        it('should handle unknown errors', (done) => {
            const error = new Error('Unknown error');

            mockCallHandler.handle.mockReturnValue(throwError(() => error));

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    error: (error: HttpException) => {
                        const response = error.getResponse() as ApiResponse<null>;
                        expect(response).toEqual({
                            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                            message: 'Unknown error',
                            data: null,
                        });
                        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                        done();
                    },
                });
        });

        it('should handle error with custom status', (done) => {
            const error = {
                status: HttpStatus.BAD_REQUEST,
                message: 'Bad Request Error',
            };

            mockCallHandler.handle.mockReturnValue(throwError(() => error));

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    error: (error: HttpException) => {
                        const response = error.getResponse() as ApiResponse<null>;
                        expect(response).toEqual({
                            statusCode: HttpStatus.BAD_REQUEST,
                            message: 'Bad Request Error',
                            data: null,
                        });
                        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
                        done();
                    },
                });
        });
    });
});