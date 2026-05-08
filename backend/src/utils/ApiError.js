class ApiError extends Error {
    constructor(statusCode, message, info = null) {
        super(message);
        this.statusCode = statusCode;
        this.info = info;

        
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;