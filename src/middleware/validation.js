import fp from 'fastify-plugin';
import { z } from 'zod';
import { sanitizeInput } from './security.js';

// Validation error formatter
function formatValidationError(error) {
    if (error instanceof z.ZodError) {
        return {
            ok: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            }
        };
    }
    return null;
}

// Request validation middleware
export const validationMiddleware = fp(async (app) => {
    // Validate request body
    app.decorate('validateBody', (schema) => {
        return async (request, reply) => {
            try {
                // Sanitize input first
                const sanitized = sanitizeInput(request.body || {});
                
                // Validate with Zod
                const validated = schema.parse(sanitized);
                request.body = validated;
            } catch (error) {
                const formatted = formatValidationError(error);
                if (formatted) {
                    return reply.code(400).send(formatted);
                }
                throw error;
            }
        };
    });

    // Validate request query
    app.decorate('validateQuery', (schema) => {
        return async (request, reply) => {
            try {
                const sanitized = sanitizeInput(request.query || {});
                const validated = schema.parse(sanitized);
                request.query = validated;
            } catch (error) {
                const formatted = formatValidationError(error);
                if (formatted) {
                    return reply.code(400).send(formatted);
                }
                throw error;
            }
        };
    });

    // Validate request params
    app.decorate('validateParams', (schema) => {
        return async (request, reply) => {
            try {
                const sanitized = sanitizeInput(request.params || {});
                const validated = schema.parse(sanitized);
                request.params = validated;
            } catch (error) {
                const formatted = formatValidationError(error);
                if (formatted) {
                    return reply.code(400).send(formatted);
                }
                throw error;
            }
        };
    });
});

