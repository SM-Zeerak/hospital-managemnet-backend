import { Op } from 'sequelize';
import { getPaginationParams, createPaginationResponse } from '../../common/pagination.js';

export class SuperAdminService {
    constructor(db) {
        this.db = db;
    }

    async create(data) {
        const { SuperAdmin } = this.db.models;

        // Check if email already exists
        const existing = await SuperAdmin.findOne({
            where: { email: data.email.toLowerCase() }
        });

        if (existing) {
            throw new Error('Email already exists');
        }

        const superAdmin = await SuperAdmin.create({
            ...data,
            email: data.email.toLowerCase()
        });

        return superAdmin.toJSON();
    }

    async update(id, data, currentUserId) {
        const { SuperAdmin } = this.db.models;

        const superAdmin = await SuperAdmin.findByPk(id);
        if (!superAdmin) {
            throw new Error('Super admin not found');
        }

        // Prevent self-deactivation
        if (data.isActive === false && id === currentUserId) {
            throw new Error('Cannot deactivate your own account');
        }

        // If email is being updated, check for duplicates
        if (data.email && data.email.toLowerCase() !== superAdmin.email) {
            const existing = await SuperAdmin.findOne({
                where: {
                    email: data.email.toLowerCase(),
                    id: { [Op.ne]: id }
                }
            });

            if (existing) {
                throw new Error('Email already exists');
            }
        }

        await superAdmin.update({
            ...data,
            email: data.email ? data.email.toLowerCase() : superAdmin.email
        });

        return superAdmin.reload().then(s => s.toJSON());
    }

    async delete(id, currentUserId) {
        const { SuperAdmin } = this.db.models;

        const superAdmin = await SuperAdmin.findByPk(id);
        if (!superAdmin) {
            throw new Error('Super admin not found');
        }

        // Prevent self-deletion
        if (id === currentUserId) {
            throw new Error('Cannot delete your own account');
        }

        await superAdmin.destroy();

        return { success: true, message: 'Super admin deleted successfully' };
    }

    async getById(id) {
        const { SuperAdmin } = this.db.models;

        const superAdmin = await SuperAdmin.findByPk(id);
        if (!superAdmin) {
            throw new Error('Super admin not found');
        }

        return superAdmin.toJSON();
    }

    async list(request) {
        const { SuperAdmin } = this.db.models;
        const { page, limit, offset } = getPaginationParams(request);

        const { count, rows } = await SuperAdmin.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const data = rows.map(superAdmin => superAdmin.toJSON());

        return createPaginationResponse(data, count, page, limit);
    }
}

