// Custom class to send API error
class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong',
        errors = [],
        stack = ''
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            success: this.success,
            stack:
                process.env.NODE_ENV === 'development' ? this.stack : undefined, // Include stack only in development
        };
    }
}

export default ApiError;
