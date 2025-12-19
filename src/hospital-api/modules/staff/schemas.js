import { z } from 'zod';
import { commonSchemas } from '../../../middleware/security.js';
import { getAllPermissions } from '../../config/permissions.js';

export const createStaffSchema = z.object({
    body: z.object({
        email: commonSchemas.email,
        password: commonSchemas.password,
        firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
        lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
        phone: z.string().min(10).max(20).optional(),
        department: z.string().max(100).optional(),
        position: z.string().max(100).optional(),
        employeeId: z.string().max(50).optional(),
        role: z.enum(['doctor', 'nurse', 'admin', 'receptionist', 'pharmacist', 'lab_technician', 'other']).default('other').optional(),
        isActive: z.boolean().default(true).optional(),
        permissions: z.array(z.string()).optional()
    }).refine((data) => {
        // Validate permissions if provided
        if (data.permissions) {
            const allPermissions = getAllPermissions();
            return data.permissions.every(p => allPermissions.includes(p));
        }
        return true;
    }, {
        message: 'Invalid permissions provided'
    })
});

export const updateStaffSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid ID format')
    }),
    body: z.object({
        email: commonSchemas.email.optional(),
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        phone: z.string().min(10).max(20).optional(),
        department: z.string().max(100).optional(),
        position: z.string().max(100).optional(),
        employeeId: z.string().max(50).optional(),
        role: z.enum(['doctor', 'nurse', 'admin', 'receptionist', 'pharmacist', 'lab_technician', 'other']).optional(),
        isActive: z.boolean().optional(),
        permissions: z.array(z.string()).optional()
    }).refine((data) => {
        // Validate permissions if provided
        if (data.permissions) {
            const allPermissions = getAllPermissions();
            return data.permissions.every(p => allPermissions.includes(p));
        }
        return true;
    }, {
        message: 'Invalid permissions provided'
    })
});

export const deleteStaffSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid ID format')
    })
});

export const getStaffSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid ID format')
    })
});

export const listStaffSchema = z.object({
    query: z.object({
        ...commonSchemas.pagination.shape,
        role: z.enum(['doctor', 'nurse', 'admin', 'receptionist', 'pharmacist', 'lab_technician', 'other']).optional(),
        department: z.string().optional(),
        isActive: z.coerce.boolean().optional(),
        search: z.string().optional()
    })
});

