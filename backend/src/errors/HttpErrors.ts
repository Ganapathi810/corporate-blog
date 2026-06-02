import { AppError } from "./AppError.js";

export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
        super(message, 400, code)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
        super(message, 401, code)
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', code = 'Forbidden') {
        super(message, 403, code)
    }
}
export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, 'NOT_FOUND')
    }
}
export class ConflictError extends AppError {
    constructor(message: string, code = 'CONFLICT') {
        super(message, 409, code)
    }
}
export class UnprocessableEntityError extends AppError {
    constructor(message: string, code = 'UNPROCESSABLE_ENTITY') {
        super(message, 422, code)
    }
}
export class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error') {
        super(message, 500, 'INTERNAL_SERVER_ERROR',false)
    }
}