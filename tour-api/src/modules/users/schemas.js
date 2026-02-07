import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    departmentId: z.uuid().nullable().optional(),
    roleIds: z.array(z.uuid()).default([]),
    commisionType: z.enum(['percentage', 'fixed']).optional(),
    commisionValue: z.number().optional().default(0)
});

export const updateUserSchema = z.object({
    email: z.email().optional(),
    password: z.string().min(8).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    departmentId: z.uuid().nullable().optional(),
    roleIds: z.array(z.uuid()).optional(),
    status: z.enum(['active', 'suspended']).optional(),
    commisionType: z.enum(['percentage', 'fixed']).optional(),
    commisionValue: z.number().optional().default(0)
});

export const idParamSchema = z.object({
    id: z.uuid()
});

export const listUsersQuerySchema = z.object({
    search: z.string().optional(),
    status: z.enum(['active', 'suspended']).optional(),
    departmentId: z.uuid().optional(),
    roleId: z.uuid().optional(),
    dateFrom: z.iso.datetime().optional(),
    dateTo: z.iso.datetime().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('50'),
    offset: z.string().regex(/^\d+$/).transform(Number).optional().default('0'),
    orderBy: z.enum(['createdAt', 'updatedAt', 'lastLoginAt', 'firstName', 'lastName', 'email']).optional().default('createdAt'),
    orderDir: z.enum(['ASC', 'DESC']).optional().default('DESC')
});

export const createUserInviteSchema = z.object({
    email: z.email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    departmentId: z.uuid().nullable().optional(),
    roleIds: z.array(z.uuid()).default([])
});

export const listInvitesQuerySchema = z.object({
    status: z.enum(['pending', 'accepted', 'cancelled']).optional().default('pending'),
    search: z.string().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('50'),
    offset: z.string().regex(/^\d+$/).transform(Number).optional().default('0')
});

export const inviteIdParamSchema = z.object({
    inviteId: z.uuid()
});

export const acceptInviteSchema = z.object({
    token: z.uuid(),
    password: z.string().min(8)
});

export const bulkOperationSchema = z.object({
    userIds: z.array(z.uuid()).min(1),
    action: z.enum(['activate', 'suspend', 'delete'])
});
