# Security Features

This backend implements comprehensive security measures to protect against common vulnerabilities.

## 🔒 Security Features Implemented

### 1. **Authentication & Authorization**
- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC)
- Tenant-based access control for multi-tenant scenarios
- Secure password hashing with bcrypt
- Token expiration and refresh mechanisms

### 2. **Input Validation & Sanitization**
- Zod schema validation for all requests
- Automatic input sanitization (XSS prevention)
- Request body, query, and params validation
- SQL injection prevention via Sequelize ORM
- Request size limits (10MB max)

### 3. **Security Headers**
- Helmet.js for security headers
- Content Security Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### 4. **Rate Limiting**
- 100 requests per minute per IP
- Configurable rate limits
- Localhost allowlist for development

### 5. **CORS Protection**
- Whitelist-based origin validation
- Credential support with secure origins
- Configurable allowed methods and headers

### 6. **Data Encryption**
- AES-256-GCM encryption for sensitive data
- Secure token generation
- One-way hashing for sensitive information
- Environment variable validation

### 7. **Audit Logging**
- Security event logging
- Suspicious request detection
- API request/response logging
- Authentication event tracking

### 8. **Error Handling**
- Secure error messages (no stack traces in production)
- Request ID tracking
- Detailed error logging for debugging

### 9. **Environment Security**
- Required environment variable validation
- JWT secret strength validation (min 32 chars)
- Encryption key validation

### 10. **Request Security**
- Suspicious pattern detection
- User-Agent validation
- IP-based request tracking
- Request ID generation for traceability

## 🛡️ Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use strong, randomly generated secrets
- Rotate secrets regularly
- Use different secrets for different environments

### Password Requirements
- Minimum 8 characters
- Must contain uppercase, lowercase, numbers, and special characters
- Maximum 128 characters

### API Usage
- Always use HTTPS in production
- Validate all inputs on the server side
- Use authentication for protected routes
- Implement proper error handling

### Database Security
- Use parameterized queries (Sequelize handles this)
- Never expose database credentials
- Use connection pooling
- Regular database backups

## 📝 Security Checklist

- [x] JWT authentication implemented
- [x] Input validation with Zod
- [x] XSS protection
- [x] SQL injection prevention
- [x] Rate limiting
- [x] CORS configuration
- [x] Security headers
- [x] Audit logging
- [x] Error handling
- [x] Environment validation
- [x] Data encryption utilities
- [x] Request sanitization

## 🔐 Using Security Features

### Input Validation Example
```javascript
import { z } from 'zod';
import { commonSchemas } from '../middleware/security.js';

const createUserSchema = z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    name: z.string().min(1).max(255)
});

// In your route
app.post('/users', {
    preHandler: [app.validateBody(createUserSchema)]
}, async (request, reply) => {
    // request.body is validated and sanitized
});
```

### Encryption Example
```javascript
import { encrypt, decrypt, hash } from '../utils/encryption.js';

// Encrypt sensitive data
const encrypted = encrypt('sensitive-data');

// Decrypt data
const decrypted = decrypt(encrypted);

// Hash data (one-way)
const hashed = hash('data-to-hash');
```

### Audit Logging Example
```javascript
// Automatically logs sensitive operations
app.auditLog('user_login', {
    userId: user.id,
    ip: request.ip,
    success: true
});
```

## ⚠️ Security Notes

1. **Never expose sensitive data** in error messages
2. **Always validate** user input
3. **Use HTTPS** in production
4. **Keep dependencies** up to date
5. **Monitor audit logs** regularly
6. **Rotate secrets** periodically
7. **Use strong passwords** for all accounts
8. **Implement 2FA** for admin accounts (recommended)

