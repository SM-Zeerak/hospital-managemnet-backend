import { z } from 'zod';

const staffShape = {
    personalInfo: z.object({
        phone: z.string().optional(),
        address: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        dob: z.string().optional(),
        emergencyContact: z.string().optional()
    }).optional(),
    qualificationInfo: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.number().optional()
    })).optional(),
    experienceInfo: z.array(z.object({
        company: z.string(),
        position: z.string(),
        duration: z.string(),
        description: z.string().optional()
    })).optional(),
    salary: z.union([z.number(), z.string()]).optional().transform((v) =>
        v === undefined || v === '' ? undefined : Number(v)
    ),
    rfidCardNumber: z.string().optional(),
    imageUrl: z.string().optional()
};

export const createUserSchema = z
    .object({
        email: z.email(),
        password: z.string().min(8),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        departmentId: z.uuid().nullable().optional(),
        roleIds: z.array(z.uuid()).default([]),
        commisionType: z.enum(['percentage', 'fixed']).optional(),
        commisionValue: z.number().optional().default(0),
        salary: z.union([z.number(), z.string()]).optional(),
        staff: z.object(staffShape).optional()
    })
    .transform((data) => {
        const { salary: topLevelSalary, staff, ...rest } = data;
        const staffSalary =
            staff?.salary !== undefined
                ? (typeof staff.salary === 'number' ? staff.salary : Number(staff.salary))
                : topLevelSalary !== undefined
                  ? Number(topLevelSalary)
                  : undefined;
        const mergedStaff =
            staff != null
                ? { ...staff, ...(staffSalary !== undefined && { salary: staffSalary }) }
                : topLevelSalary !== undefined
                  ? { salary: Number(topLevelSalary) }
                  : undefined;
        return { ...rest, staff: mergedStaff };
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
    commisionValue: z.number().optional().default(0),
    staff: z
        .object({
            ...staffShape
        })
        .optional()
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
