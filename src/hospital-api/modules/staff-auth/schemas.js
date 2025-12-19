import { z } from 'zod';
import { commonSchemas } from '../../../middleware/security.js';

export const loginSchema = z.object({
    body: z.object({
        email: commonSchemas.email,
        password: z.string().min(1, 'Password is required')
    })
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required')
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: commonSchemas.email
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        newPassword: commonSchemas.password
    })
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: commonSchemas.password
    })
});

