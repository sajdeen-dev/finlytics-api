"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unauthorized = exports.badRequest = exports.forbidden = exports.notFound = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const notFound = (msg = 'Not found') => new AppError(msg, 404);
exports.notFound = notFound;
const forbidden = (msg = 'Forbidden') => new AppError(msg, 403);
exports.forbidden = forbidden;
const badRequest = (msg = 'Bad request') => new AppError(msg, 400);
exports.badRequest = badRequest;
const unauthorized = (msg = 'Unauthorized') => new AppError(msg, 401);
exports.unauthorized = unauthorized;
