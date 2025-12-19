import fp from 'fastify-plugin';
import { z } from 'zod';

// Request size limit (10MB)
const MAX_REQUEST_SIZE = 10 * 1024 * 1024;

// Rate limiting configuration
const rateLimitConfig = {
    max: 100, // requests
    timeWindow: '1 minute',
    cache: 10000,
    allowList: ['127.0.0.1', '::1'], // Allow localhost
    skipOnError: false
};

// Security headers configuration
const helmetConfig = {
    global: true,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
};

// CORS configuration
export function getCorsConfig(env) {
    const allowedOrigins = [];
    
    if (process.env.UI_ORIGIN) {
        allowedOrigins.push(process.env.UI_ORIGIN);
    }
    
    if (env === 'development') {
        allowedOrigins.push(
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5175',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5175'
        );
    }

    return {
        origin: allowedOrigins.length > 0 ? allowedOrigins : false,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Request-ID',
            'X-Tenant-ID',
            'x-refresh-token',
            'X-Refresh-Token'
        ],
        exposedHeaders: ['X-Request-ID'],
        maxAge: 86400 // 24 hours
    };
}

// Input sanitization
export function sanitizeInput(input) {
    if (typeof input === 'string') {
        // Remove potential script tags and dangerous characters
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
    if (typeof input === 'object' && input !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    return input;
}

// Request validation schema
export const commonSchemas = {
    pagination: z.object({
        page: z.coerce.number().int().min(1).default(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(20).optional()
    }),
    
    idParam: z.object({
        id: z.string().uuid('Invalid ID format')
    }),
    
    email: z.string().email('Invalid email format').max(255),
    
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
};

// Security middleware
export const securityMiddleware = fp(async (app) => {
    // Request size limit
    app.addContentTypeParser('application/json', { bodyLimit: MAX_REQUEST_SIZE }, (req, body, done) => {
        try {
            const json = JSON.parse(body);
            done(null, json);
        } catch (err) {
            err.statusCode = 400;
            done(err, undefined);
        }
    });

    // Security logging
    app.addHook('onRequest', async (request) => {
        // Log suspicious requests
        const userAgent = request.headers['user-agent'] || '';
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /union.*select/i,
            /drop.*table/i,
            /exec.*\(/i
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(userAgent) || pattern.test(request.url))) {
            request.log.warn({
                suspicious: true,
                url: request.url,
                userAgent,
                ip: request.ip
            }, 'Suspicious request detected');
        }
    });

    // Add security headers hook
    app.addHook('onSend', async (request, reply) => {
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('X-Frame-Options', 'DENY');
        reply.header('X-XSS-Protection', '1; mode=block');
        reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    });
});

export { rateLimitConfig, helmetConfig, MAX_REQUEST_SIZE };

