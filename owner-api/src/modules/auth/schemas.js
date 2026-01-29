import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1)
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(10)
});

export const requestResetSchema = z.object({
    email: z.email()
});

export const resetPasswordSchema = z.object({
    token: z.string().min(10),
    otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
    password: z.string().min(8)
});

export const resendResetSchema = requestResetSchema;
