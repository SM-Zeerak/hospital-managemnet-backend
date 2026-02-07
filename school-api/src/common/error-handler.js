/**
 * Comprehensive Error Handler Utility
 * Maps all error types to appropriate HTTP status codes and user-friendly messages
 */

/**
 * Normalize and format error for response
 * @param {Error} error - The error object
 * @param {Object} request - Fastify request object
 * @param {boolean} isProduction - Whether in production mode
 * @returns {Object} Normalized error response
 */
export function normalizeError(error, request, isProduction = false) {
    let status = error.statusCode || 500;
    let code = error.code || error.name || 'INTERNAL_ERROR';
    let message = error.message || 'An error occurred';
    let details = error.details;

    // Handle Fastify HTTP Errors (already have statusCode)
    if (error.statusCode && error.statusCode < 500) {
        status = error.statusCode;
        code = getErrorCodeFromStatus(status);
        return { status, code, message, details };
    }

    // Handle Sequelize Errors
    const sequelizeError = handleSequelizeError(error);
    if (sequelizeError) {
        return sequelizeError;
    }

    // Handle Validation Errors (Zod)
    const validationError = handleValidationError(error);
    if (validationError) {
        return validationError;
    }

    // Handle JWT Errors
    const jwtError = handleJWTError(error);
    if (jwtError) {
        return jwtError;
    }

    // Handle Database Connection Errors
    const dbError = handleDatabaseError(error);
    if (dbError) {
        return dbError;
    }

    // Handle File System Errors
    const fsError = handleFileSystemError(error);
    if (fsError) {
        return fsError;
    }

    // Handle Network/External Service Errors
    const networkError = handleNetworkError(error);
    if (networkError) {
        return networkError;
    }

    // Try to infer status from error message
    const inferredError = inferErrorFromMessage(error);
    if (inferredError && inferredError.status !== 500) {
        return inferredError;
    }

    // Default: Only return 500 for truly unexpected errors
    // If we can't determine the error, it's likely a client error (400)
    if (status === 500 && !isUnexpectedError(error)) {
        status = 400;
        code = 'BAD_REQUEST';
        message = isProduction ? 'Invalid request' : message;
    } else if (status === 500 && isProduction) {
        message = 'Internal server error';
        details = undefined;
    }

    return { status, code, message, details };
}

/**
 * Handle Sequelize ORM errors
 */
function handleSequelizeError(error) {
    const errorName = error.name || '';
    
    if (!errorName.includes('Sequelize')) {
        return null;
    }

    // Unique Constraint Violation
    if (errorName === 'SequelizeUniqueConstraintError') {
        const field = error.errors?.[0]?.path || 'field';
        const value = error.errors?.[0]?.value || '';
        const fieldName = formatFieldName(field);
        return {
            status: 409,
            code: 'DUPLICATE_ENTRY',
            message: `${fieldName} "${value}" already exists`,
            details: undefined
        };
    }

    // Validation Error
    if (errorName === 'SequelizeValidationError') {
        const firstError = error.errors?.[0];
        if (firstError) {
            const field = formatFieldName(firstError.path || 'field');
            return {
                status: 400,
                code: 'VALIDATION_ERROR',
                message: `${field}: ${firstError.message}`,
                details: undefined
            };
        }
        return {
            status: 400,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: undefined
        };
    }

    // Foreign Key Constraint
    if (errorName === 'SequelizeForeignKeyConstraintError') {
        const table = error.table || 'record';
        return {
            status: 400,
            code: 'INVALID_REFERENCE',
            message: `Referenced ${table} does not exist or cannot be deleted`,
            details: undefined
        };
    }

    // Exclusion Constraint
    if (errorName === 'SequelizeExclusionConstraintError') {
        return {
            status: 400,
            code: 'CONSTRAINT_VIOLATION',
            message: 'Data violates exclusion constraint',
            details: undefined
        };
    }

    // Database Error (check message for specific cases)
    if (errorName === 'SequelizeDatabaseError') {
        const msg = (error.message || '').toLowerCase();
        
        if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
            return {
                status: 409,
                code: 'DUPLICATE_ENTRY',
                message: 'A record with this value already exists',
                details: undefined
            };
        }
        
        if (msg.includes('foreign key') || msg.includes('referential integrity')) {
            return {
                status: 400,
                code: 'INVALID_REFERENCE',
                message: 'Referenced record does not exist',
                details: undefined
            };
        }
        
        if (msg.includes('not null') || msg.includes('null value')) {
            return {
                status: 400,
                code: 'MISSING_REQUIRED_FIELD',
                message: 'Required field is missing',
                details: undefined
            };
        }
        
        if (msg.includes('check constraint')) {
            return {
                status: 400,
                code: 'CONSTRAINT_VIOLATION',
                message: 'Data violates check constraint',
                details: undefined
            };
        }
        
        if (msg.includes('invalid input') || msg.includes('syntax error')) {
            return {
                status: 400,
                code: 'INVALID_INPUT',
                message: 'Invalid data format',
                details: undefined
            };
        }
        
        // Connection/timeout errors are server errors
        if (msg.includes('connection') || msg.includes('timeout') || msg.includes('ECONNREFUSED')) {
            return {
                status: 503,
                code: 'SERVICE_UNAVAILABLE',
                message: 'Database service temporarily unavailable',
                details: undefined
            };
        }
        
        // Default database error
        return {
            status: 400,
            code: 'DATABASE_ERROR',
            message: 'Database operation failed',
            details: undefined
        };
    }

    // Empty Result Error
    if (errorName === 'SequelizeEmptyResultError') {
        return {
            status: 404,
            code: 'NOT_FOUND',
            message: 'Record not found',
            details: undefined
        };
    }

    // Connection Error
    if (errorName === 'SequelizeConnectionError') {
        return {
            status: 503,
            code: 'SERVICE_UNAVAILABLE',
            message: 'Database connection failed',
            details: undefined
        };
    }

    // Timeout Error
    if (errorName === 'SequelizeTimeoutError') {
        return {
            status: 504,
            code: 'GATEWAY_TIMEOUT',
            message: 'Database operation timed out',
            details: undefined
        };
    }

    return null;
}

/**
 * Handle Validation Errors (Zod)
 */
function handleValidationError(error) {
    if (error.name !== 'ZodError' || !Array.isArray(error.issues)) {
        return null;
    }

    const firstIssue = error.issues[0];
    if (!firstIssue) {
        return {
            status: 400,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: undefined
        };
    }

    const field = firstIssue.path?.length > 0 
        ? firstIssue.path.join('.') 
        : 'field';
    const fieldName = formatFieldName(field);

    let message = '';

    switch (firstIssue.code) {
        case 'too_small':
            if (firstIssue.type === 'string') {
                message = `${fieldName} must be at least ${firstIssue.minimum} characters`;
            } else if (firstIssue.type === 'number') {
                message = `${fieldName} must be at least ${firstIssue.minimum}`;
            } else if (firstIssue.type === 'array') {
                message = `${fieldName} must contain at least ${firstIssue.minimum} items`;
            } else {
                message = `${fieldName} is too small`;
            }
            break;
        
        case 'too_big':
            if (firstIssue.type === 'string') {
                message = `${fieldName} must be at most ${firstIssue.maximum} characters`;
            } else if (firstIssue.type === 'number') {
                message = `${fieldName} must be at most ${firstIssue.maximum}`;
            } else if (firstIssue.type === 'array') {
                message = `${fieldName} must contain at most ${firstIssue.maximum} items`;
            } else {
                message = `${fieldName} is too large`;
            }
            break;
        
        case 'invalid_type':
            message = `${fieldName} is required and must be a valid ${firstIssue.expected}`;
            break;
        
        case 'invalid_string':
            if (firstIssue.validation === 'email') {
                message = `${fieldName} must be a valid email address`;
            } else if (firstIssue.validation === 'uuid') {
                message = `${fieldName} must be a valid UUID`;
            } else if (firstIssue.validation === 'url') {
                message = `${fieldName} must be a valid URL`;
            } else if (firstIssue.validation === 'datetime') {
                message = `${fieldName} must be a valid date and time`;
            } else {
                message = `${fieldName} is invalid`;
            }
            break;
        
        case 'invalid_enum_value':
            message = `${fieldName} must be one of: ${firstIssue.options?.join(', ') || 'valid options'}`;
            break;
        
        case 'custom':
            message = firstIssue.message || `${fieldName} is invalid`;
            break;
        
        default:
            message = firstIssue.message || `Invalid ${fieldName}`;
    }

    return {
        status: 400,
        code: 'VALIDATION_ERROR',
        message,
        details: undefined
    };
}

/**
 * Handle JWT/Authentication Errors
 */
function handleJWTError(error) {
    const msg = (error.message || '').toLowerCase();
    
    if (error.name === 'JsonWebTokenError' || msg.includes('jwt') || msg.includes('token')) {
        if (msg.includes('expired')) {
            return {
                status: 401,
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired',
                details: undefined
            };
        }
        if (msg.includes('invalid') || msg.includes('malformed')) {
            return {
                status: 401,
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token',
                details: undefined
            };
        }
        return {
            status: 401,
            code: 'AUTHENTICATION_ERROR',
            message: 'Authentication failed',
            details: undefined
        };
    }
    
    return null;
}

/**
 * Handle Database Connection Errors
 */
function handleDatabaseError(error) {
    const msg = (error.message || '').toLowerCase();
    const code = error.code || '';
    
    if (code === 'ECONNREFUSED' || msg.includes('connection refused')) {
        return {
            status: 503,
            code: 'SERVICE_UNAVAILABLE',
            message: 'Database service unavailable',
            details: undefined
        };
    }
    
    if (code === 'ETIMEDOUT' || msg.includes('timeout')) {
        return {
            status: 504,
            code: 'GATEWAY_TIMEOUT',
            message: 'Database operation timed out',
            details: undefined
        };
    }
    
    return null;
}

/**
 * Handle File System Errors
 */
function handleFileSystemError(error) {
    const code = error.code || '';
    
    if (code === 'ENOENT') {
        return {
            status: 404,
            code: 'NOT_FOUND',
            message: 'File or resource not found',
            details: undefined
        };
    }
    
    if (code === 'EACCES' || code === 'EPERM') {
        return {
            status: 403,
            code: 'FORBIDDEN',
            message: 'Permission denied',
            details: undefined
        };
    }
    
    if (code === 'EMFILE' || code === 'ENFILE') {
        return {
            status: 503,
            code: 'SERVICE_UNAVAILABLE',
            message: 'File system limit reached',
            details: undefined
        };
    }
    
    return null;
}

/**
 * Handle Network/External Service Errors
 */
function handleNetworkError(error) {
    const code = error.code || '';
    const msg = (error.message || '').toLowerCase();
    
    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
        return {
            status: 502,
            code: 'BAD_GATEWAY',
            message: 'External service unavailable',
            details: undefined
        };
    }
    
    if (code === 'ETIMEDOUT' || msg.includes('timeout')) {
        return {
            status: 504,
            code: 'GATEWAY_TIMEOUT',
            message: 'External service timeout',
            details: undefined
        };
    }
    
    return null;
}

/**
 * Infer error from error message
 */
function inferErrorFromMessage(error) {
    if (!error.message) {
        return null;
    }
    
    const msg = error.message.toLowerCase();
    let status = 500;
    let code = 'INTERNAL_ERROR';
    let message = error.message;
    
    // Not found patterns
    if (msg.includes('not found') || msg.includes('does not exist') || msg.includes('cannot find')) {
        status = 404;
        code = 'NOT_FOUND';
    }
    // Duplicate patterns
    else if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('already in use')) {
        status = 409;
        code = 'DUPLICATE_ENTRY';
    }
    // Unauthorized patterns
    else if (msg.includes('unauthorized') || msg.includes('authentication') || msg.includes('login')) {
        status = 401;
        code = 'UNAUTHORIZED';
    }
    // Forbidden patterns
    else if (msg.includes('forbidden') || msg.includes('permission') || msg.includes('access denied') || msg.includes('not allowed')) {
        status = 403;
        code = 'FORBIDDEN';
    }
    // Validation patterns
    else if (msg.includes('invalid') || msg.includes('validation') || msg.includes('malformed') || msg.includes('bad format')) {
        status = 400;
        code = 'VALIDATION_ERROR';
    }
    // Conflict patterns
    else if (msg.includes('conflict') || msg.includes('already') || msg.includes('in use')) {
        status = 409;
        code = 'CONFLICT';
    }
    // Too many requests
    else if (msg.includes('too many') || msg.includes('rate limit') || msg.includes('throttle')) {
        status = 429;
        code = 'RATE_LIMIT_EXCEEDED';
    }
    // Service unavailable
    else if (msg.includes('unavailable') || msg.includes('service down')) {
        status = 503;
        code = 'SERVICE_UNAVAILABLE';
    }
    // Timeout
    else if (msg.includes('timeout') || msg.includes('timed out')) {
        status = 504;
        code = 'GATEWAY_TIMEOUT';
    }
    // Bad gateway
    else if (msg.includes('bad gateway') || msg.includes('upstream')) {
        status = 502;
        code = 'BAD_GATEWAY';
    }
    
    if (status !== 500) {
        return { status, code, message, details: undefined };
    }
    
    return null;
}

/**
 * Check if error is truly unexpected (should return 500)
 */
function isUnexpectedError(error) {
    // If error has a stack trace and is not a known error type, it's unexpected
    if (error.stack && !error.name) {
        return true;
    }
    
    // If it's a generic Error without statusCode, it might be unexpected
    if (error.name === 'Error' && !error.statusCode && !error.code) {
        // But check if message gives us hints
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('not found') || msg.includes('already exists') || msg.includes('invalid')) {
            return false; // Can be inferred
        }
        return true; // Truly unexpected
    }
    
    return false;
}

/**
 * Get error code from HTTP status
 */
function getErrorCodeFromStatus(status) {
    const statusMap = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
        422: 'UNPROCESSABLE_ENTITY',
        429: 'RATE_LIMIT_EXCEEDED',
        500: 'INTERNAL_ERROR',
        502: 'BAD_GATEWAY',
        503: 'SERVICE_UNAVAILABLE',
        504: 'GATEWAY_TIMEOUT'
    };
    
    return statusMap[status] || 'ERROR';
}

/**
 * Format field name for display
 */
function formatFieldName(field) {
    if (!field) return 'Field';
    
    // Convert snake_case to Title Case
    return field
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .replace(/\bId\b/g, 'ID')
        .replace(/\bUrl\b/g, 'URL')
        .replace(/\bUuid\b/g, 'UUID');
}

