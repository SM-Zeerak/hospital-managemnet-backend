import { Op } from 'sequelize';
import { getPaginationParams, createPaginationResponse } from '../../common/pagination.js';
import { getRolePermissions, validatePermissions } from '../../config/permissions.js';

export class StaffService {
    constructor(db) {
        this.db = db;
    }

    async create(data) {
        const { Staff } = this.db.models;

        // Check if email already exists
        const existingEmail = await Staff.findOne({
            where: { email: data.email.toLowerCase() }
        });

        if (existingEmail) {
            throw new Error('Email already exists');
        }

        // Check if employee ID already exists (if provided)
        if (data.employeeId) {
            const existingEmployeeId = await Staff.findOne({
                where: { employeeId: data.employeeId }
            });

            if (existingEmployeeId) {
                throw new Error('Employee ID already exists');
            }
        }

        // Handle permissions
        let permissions = [];
        
        // If permissions are explicitly provided, use them
        if (data.permissions && data.permissions.length > 0) {
            validatePermissions(data.permissions);
            permissions = data.permissions;
        } else {
            // Otherwise, use default permissions for the role
            permissions = getRolePermissions(data.role || 'other');
        }

        const staff = await Staff.create({
            ...data,
            email: data.email.toLowerCase(),
            permissions: permissions
        });

        return staff.toJSON();
    }

    async update(id, data, currentUserId) {
        const { Staff } = this.db.models;

        const staff = await Staff.findByPk(id);
        if (!staff) {
            throw new Error('Staff not found');
        }

        // Prevent self-deactivation
        if (data.isActive === false && id === currentUserId) {
            throw new Error('Cannot deactivate your own account');
        }

        // If email is being updated, check for duplicates
        if (data.email && data.email.toLowerCase() !== staff.email) {
            const existing = await Staff.findOne({
                where: {
                    email: data.email.toLowerCase(),
                    id: { [Op.ne]: id }
                }
            });

            if (existing) {
                throw new Error('Email already exists');
            }
        }

        // If employee ID is being updated, check for duplicates
        if (data.employeeId && data.employeeId !== staff.employeeId) {
            const existing = await Staff.findOne({
                where: {
                    employeeId: data.employeeId,
                    id: { [Op.ne]: id }
                }
            });

            if (existing) {
                throw new Error('Employee ID already exists');
            }
        }

        // Handle permissions update
        if (data.permissions !== undefined) {
            if (data.permissions.length > 0) {
                validatePermissions(data.permissions);
            }
        }

        await staff.update({
            ...data,
            email: data.email ? data.email.toLowerCase() : staff.email
        });

        return staff.reload().then(s => s.toJSON());
    }

    async delete(id, currentUserId) {
        const { Staff } = this.db.models;

        const staff = await Staff.findByPk(id);
        if (!staff) {
            throw new Error('Staff not found');
        }

        // Prevent self-deletion
        if (id === currentUserId) {
            throw new Error('Cannot delete your own account');
        }

        await staff.destroy();

        return { success: true, message: 'Staff deleted successfully' };
    }

    async getById(id) {
        const { Staff } = this.db.models;

        const staff = await Staff.findByPk(id);
        if (!staff) {
            throw new Error('Staff not found');
        }

        return staff.toJSON();
    }

    async list(request) {
        const { Staff } = this.db.models;
        const { page, limit, offset } = getPaginationParams(request);
        const { role, department, isActive, search } = request.query;

        // Build where clause
        const where = {};

        if (role) {
            where.role = role;
        }

        if (department) {
            where.department = department;
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { employeeId: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Staff.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const data = rows.map(staff => staff.toJSON());

        return createPaginationResponse(data, count, page, limit);
    }
}

