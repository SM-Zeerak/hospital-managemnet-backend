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

export const resendResetSchema = z.object({
    email: z.email()
});

export const resetPasswordSchema = z.object({
    token: z.string().uuid(),
    password: z.string().min(8),
    otp: z.string().length(6)
});

export const requestEmailVerificationSchema = z.object({
    email: z.email()
});

export const resendEmailVerificationSchema = z.object({
    email: z.email()
});

export const verifyEmailSchema = z.object({
    email: z.email(),
    otp: z.string().length(6)
});
