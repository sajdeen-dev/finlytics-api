export class AppError extends Error {
    status: number;
  
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
      this.name = 'AppError';
    }
  }
  
  export const notFound = (msg = 'Not found') => new AppError(msg, 404);
  export const forbidden = (msg = 'Forbidden') => new AppError(msg, 403);
  export const badRequest = (msg = 'Bad request') => new AppError(msg, 400);
  export const unauthorized = (msg = 'Unauthorized') => new AppError(msg, 401);