import { Op } from 'sequelize';
import {
    createUserSchema,
    updateUserSchema,
    idParamSchema,
    listUsersQuerySchema,
    createUserInviteSchema,
    listInvitesQuerySchema,
    inviteIdParamSchema,
    acceptInviteSchema,
    bulkOperationSchema
} from './schemas.js';
import {
    getUserStats,
    listUsers,
    createUser,
    findUserById,
    updateUser,
    activateUser,
    suspendUser,
    deleteUser,
    createUserInvite,
    listUserInvites,
    resendUserInvite,
    cancelUserInvite,
    acceptUserInvite,
    uploadUserImage
} from './service.js';
import { getUserHighestRoleLevel } from './utils.js';

export function createGetUserStatsController(app) {
    return async function getUserStatsController(request) {
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const requesterId = request.user?.userId || request.user?.id || null;
        const requesterRoles = request.user?.roles || [];
        const stats = await getUserStats(app.db.models, tenantId, requesterId, requesterRoles);
        
        return {
            ok: true,
            data: stats
        };
    };
}

export function createListUsersController(app) {
    return async function listUsersController(request) {
        const query = listUsersQuerySchema.parse(request.query);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const requesterId = request.user?.userId || request.user?.id || null;
        const requesterRoles = request.user?.roles || [];
        
        // Check role level before querying - if role level is too low, deny access
        if (requesterRoles.length > 0) {
            const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });
            
            // If requester has lowest role level (0) and there are users with higher roles,
            // they won't be able to see anyone - deny access upfront
            if (requesterLevel === 0) {
                const { TenantUser } = app.db.models;
                const totalUsersInSystem = await TenantUser.count({ 
                    where: { 
                        tenantId,
                        ...(requesterId ? { id: { [Op.ne]: requesterId } } : {})
                    } 
                });
                
                if (totalUsersInSystem > 0) {
                    // Check if any users have roles higher than level 0
                    const usersWithRoles = await TenantUser.findAll({
                        where: { 
                            tenantId,
                            ...(requesterId ? { id: { [Op.ne]: requesterId } } : {})
                        },
                        include: [{
                            model: app.db.models.Role,
                            as: 'roleEntities',
                            through: { attributes: [] },
                            required: false
                        }],
                        limit: 10,
                        attributes: ['id']
                    });
                    
                    // If any user has a role level > 0, the requester can't see them
                    const hasHigherRoleUsers = usersWithRoles.some(user => {
                        const userLevel = getUserHighestRoleLevel(user);
                        return userLevel > 0;
                    });
                    
                    if (hasHigherRoleUsers) {
                        throw app.httpErrors.forbidden('Insufficient role level to view users. You can only view users with equal or lower role levels.');
                    }
                }
            }
        }
        
        const result = await listUsers(app.db.models, { 
            ...query, 
            tenantId,
            requesterId,
            requesterRoles
        });
        
        // Include stats in list response
        const stats = await getUserStats(app.db.models, tenantId, requesterId, requesterRoles);
        
        return {
            ok: true,
            ...result,
            stats
        };
    };
}

export function createGetUserController(app) {
    return async function getUserController(request) {
        const { id } = idParamSchema.parse(request.params);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        const requesterId = request.user?.userId || request.user?.id || null;
        const requesterRoles = request.user?.roles || [];
        
        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }
        
        // Check role level before querying - if role level is too low, deny access
        if (requesterRoles.length > 0) {
            const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });
            
            // If requester has lowest role level (0) and there are users with higher roles,
            // they won't be able to see anyone - deny access upfront
            if (requesterLevel === 0) {
                const { TenantUser } = app.db.models;
                const targetUser = await TenantUser.findOne({
                    where: { id, tenantId },
                    include: [{
                        model: app.db.models.Role,
                        as: 'roleEntities',
                        through: { attributes: [] },
                        required: false
                    }]
                });
                
                if (targetUser) {
                    const targetUserLevel = getUserHighestRoleLevel(targetUser);
                    if (targetUserLevel > 0) {
                        throw app.httpErrors.forbidden('Insufficient role level to view this user. You can only view users with equal or lower role levels.');
                    }
                }
            }
        }
        
        const user = await findUserById(
            app.db.models, 
            id, 
            tenantId,
            requesterId,
            requesterRoles
        );
        
        if (!user) {
            throw app.httpErrors.notFound('User not found');
        }

        // Include stats in get response
        const stats = await getUserStats(app.db.models, tenantId, requesterId, requesterRoles);

        return {
            ok: true,
            data: user,
            stats
        };
    };
}

async function parseMultipartUserBody(request, app) {
    const raw = {};
    let dataJson = null;
    /** @type {{ url: string, publicId: string, resourceType: string }|null} */
    let cloudinaryResult = null;
    const parts = request.parts();
    for await (const part of parts) {
        if (part.type === 'file') {
            if (part.fieldname === 'file') {
                const buffer = await part.toBuffer();
                try {
                    cloudinaryResult = await uploadUserImage(buffer);
                } catch {
                    // Image upload not configured - ignore
                }
            } else {
                await part.toBuffer();
            }
            continue;
        }
        if (part.type === 'field' && part.fieldname) {
            if (part.fieldname === 'data') {
                try {
                    dataJson = JSON.parse(part.value);
                } catch {
                    throw app.httpErrors.badRequest('Invalid JSON in "data" field');
                }
                continue;
            }
            let value = part.value;
            if (part.fieldname === 'roleIds' && typeof value === 'string') {
                try {
                    value = JSON.parse(value);
                } catch {
                    value = value ? [value] : [];
                }
            }
            if (part.fieldname === 'staff' && typeof value === 'string') {
                try {
                    value = JSON.parse(value);
                } catch {
                    value = undefined;
                }
            }
            if (value !== undefined) raw[part.fieldname] = value;
        }
    }
    const parsed = dataJson !== null ? dataJson : (Object.keys(raw).length ? raw : null);
    if (parsed && typeof parsed === 'object') {
        delete parsed.confirmPassword;
        // keep staffId so service can save as staffCode
    }
    return { parsed, cloudinaryResult };
}

export function createCreateUserController(app) {
    return async function createUserController(request) {
        let payload;

        if (request.isMultipart && request.isMultipart()) {
            const { parsed, cloudinaryResult } = await parseMultipartUserBody(request, app);
            if (!parsed) {
                throw app.httpErrors.badRequest('Missing form data or "data" field in multipart request');
            }
            payload = createUserSchema.parse(parsed);
            if (cloudinaryResult) {
                payload.staff = payload.staff || {};
                payload.staff.imageUrl = cloudinaryResult.url;
                payload.staff.cloudinaryPublicId = cloudinaryResult.publicId;
                payload.staff.cloudinaryResourceType = cloudinaryResult.resourceType;
            }
        } else {
            payload = createUserSchema.parse(request.body);
        }

        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        const inviterId = request.user?.id;

        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }

        try {
            const user = await createUser(app.db.models, payload, tenantId, inviterId);

            if (app.tenantIO) {
                app.tenantIO.emit('user:created', { user });
            }

            return {
                ok: true,
                data: user
            };
        } catch (error) {
            if (error.message.includes('already exists') || error.code === 'STAFF_ID_TAKEN' || error.statusCode === 409) {
                throw app.httpErrors.conflict(error.message);
            }
            if (error.statusCode === 400 || error.code === 'INVALID_REFERENCE') {
                throw app.httpErrors.badRequest(error.message);
            }
            throw error;
        }
    };
}

export function createUpdateUserController(app) {
    return async function updateUserController(request) {
        const { id } = idParamSchema.parse(request.params);
        let payload;

        if (request.isMultipart && request.isMultipart()) {
            const { parsed, cloudinaryResult } = await parseMultipartUserBody(request, app);
            if (!parsed) {
                throw app.httpErrors.badRequest('Missing form data or "data" field in multipart request');
            }
            payload = updateUserSchema.parse(parsed);
            if (cloudinaryResult) {
                payload.staff = payload.staff || {};
                payload.staff.imageUrl = cloudinaryResult.url;
                payload.staff.cloudinaryPublicId = cloudinaryResult.publicId;
                payload.staff.cloudinaryResourceType = cloudinaryResult.resourceType;
            }
        } else {
            payload = updateUserSchema.parse(request.body);
        }

        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        const updaterId = request.user?.id;

        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }

        try {
            const user = await updateUser(app.db.models, id, payload, tenantId, updaterId);

            if (!user) {
                throw app.httpErrors.notFound('User not found');
            }

            if (app.tenantIO) {
                app.tenantIO.emit('user:updated', { user });
            }

            return {
                ok: true,
                data: user
            };
        } catch (error) {
            if (error.code === 'STAFF_ID_TAKEN' || error.statusCode === 409) {
                throw app.httpErrors.conflict(error.message);
            }
            throw error;
        }
    };
}

export function createActivateUserController(app) {
    return async function activateUserController(request) {
        const { id } = idParamSchema.parse(request.params);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        
        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }
        
        const user = await activateUser(app.db.models, id, tenantId);
        
        if (!user) {
            throw app.httpErrors.notFound('User not found');
        }
        
        // Emit socket event
        if (app.tenantIO) {
            app.tenantIO.emit('user:activated', { user });
        }

        return {
            ok: true,
            data: user
        };
    };
}

export function createSuspendUserController(app) {
    return async function suspendUserController(request) {
        const { id } = idParamSchema.parse(request.params);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        
        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }
        
        const user = await suspendUser(app.db.models, id, tenantId);
        
        if (!user) {
            throw app.httpErrors.notFound('User not found');
        }
        
        // Emit socket event
        if (app.tenantIO) {
            app.tenantIO.emit('user:suspended', { user });
        }

        return {
            ok: true,
            data: user
        };
    };
}

export function createDeleteUserController(app) {
    return async function deleteUserController(request) {
        const { id } = idParamSchema.parse(request.params);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        
        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }
        
        const result = await deleteUser(app.db.models, id, tenantId);
        
        if (!result) {
            throw app.httpErrors.notFound('User not found');
        }
        
        // Emit socket event
        if (app.tenantIO) {
            app.tenantIO.emit('user:deleted', { id });
        }

        return {
            ok: true,
            data: result
        };
    };
}

export function createBulkOperationController(app) {
    return async function bulkOperationController(request) {
        const { userIds, action } = bulkOperationSchema.parse(request.body);
        const results = [];
        const errors = [];
        
        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        
        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }
        
        for (const userId of userIds) {
            try {
                let result;
                switch (action) {
                    case 'activate':
                        result = await activateUser(app.db.models, userId, tenantId);
                        break;
                    case 'suspend':
                        result = await suspendUser(app.db.models, userId, tenantId);
                        break;
                    case 'delete':
                        result = await deleteUser(app.db.models, userId, tenantId);
                        break;
                }
                
                if (result) {
                    results.push({ userId, success: true, data: result });
                } else {
                    errors.push({ userId, error: 'User not found' });
                }
            } catch (error) {
                errors.push({ userId, error: error.message });
            }
        }
        
        // Emit socket event
        if (app.tenantIO) {
            app.tenantIO.emit('user:bulk-operation', { action, results, errors });
        }
        
        return {
            ok: true,
            data: {
                action,
                results,
                errors,
                summary: {
                    total: userIds.length,
                    successful: results.length,
                    failed: errors.length
                }
            }
        };
    };
}

// User Invite Controllers
export function createCreateInviteController(app) {
    return async function createInviteController(request) {
        const payload = createUserInviteSchema.parse(request.body);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        const inviterId = request.user?.id;
        
        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }
        
        try {
            const { invite, token } = await createUserInvite(app.db.models, payload, tenantId, inviterId);
            
            // Send invite email (if mailer is configured)
            if (app.mailer && app.mailer.transporter) {
                const inviteUrl = `${process.env.TENANT_UI_ORIGIN || 'http://localhost:5175'}/accept-invite?token=${token}`;
                await app.mailer.transporter.sendMail({
                    from: process.env.MAILER_FROM || 'noreply@freightezcrm.com',
                    to: invite.email,
                    subject: 'Invitation to join Freight CRM',
                    html: `
                        <h2>You've been invited!</h2>
                        <p>Hello ${invite.firstName} ${invite.lastName},</p>
                        <p>You have been invited to join Freight CRM. Click the link below to accept your invitation:</p>
                        <p><a href="${inviteUrl}">Accept Invitation</a></p>
                        <p>This invitation will expire in 7 days.</p>
                        <p>If you did not expect this invitation, you can safely ignore this email.</p>
                    `
                });
            }
            
            // Emit socket event
            if (app.tenantIO) {
                app.tenantIO.emit('user:invite:created', { invite });
            }
            
            const response = {
                ok: true,
                data: invite
            };
            
            // Only expose token in development
            if (process.env.NODE_ENV !== 'production') {
                response.data.token = token;
            }
            
            return response;
        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('Pending invite')) {
                throw app.httpErrors.conflict(error.message);
            }
            throw error;
        }
    };
}

export function createListInvitesController(app) {
    return async function listInvitesController(request) {
        const query = listInvitesQuerySchema.parse(request.query);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        
        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }
        
        const result = await listUserInvites(app.db.models, { ...query, tenantId });
        
        return {
            ok: true,
            ...result
        };
    };
}

export function createResendInviteController(app) {
    return async function resendInviteController(request) {
        const { inviteId } = inviteIdParamSchema.parse(request.params);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        const inviterId = request.user?.id;
        
        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }
        
        try {
            const { invite, token } = await resendUserInvite(app.db.models, inviteId, tenantId, inviterId);
            
            // Resend invite email
            if (app.mailer && app.mailer.transporter) {
                const inviteUrl = `${process.env.TENANT_UI_ORIGIN || 'http://localhost:5175'}/accept-invite?token=${token}`;
                await app.mailer.transporter.sendMail({
                    from: process.env.MAILER_FROM || 'noreply@freightezcrm.com',
                    to: invite.email,
                    subject: 'Your Freight CRM Invitation (Resent)',
                    html: `
                        <h2>You've been invited!</h2>
                        <p>Hello ${invite.firstName} ${invite.lastName},</p>
                        <p>Your invitation to join Freight CRM has been resent. Click the link below to accept:</p>
                        <p><a href="${inviteUrl}">Accept Invitation</a></p>
                        <p>This invitation will expire in 7 days.</p>
                    `
                });
            }
            
            // Emit socket event
            if (app.tenantIO) {
                app.tenantIO.emit('user:invite:resent', { invite });
            }
            
            const response = {
                ok: true,
                data: invite
            };
            
            // Only expose token in development
            if (process.env.NODE_ENV !== 'production') {
                response.data.token = token;
            }
            
            return response;
        } catch (error) {
            if (error.message.includes('Can only resend') || error.message.includes('expired')) {
                throw app.httpErrors.badRequest(error.message);
            }
            throw error;
        }
    };
}

export function createCancelInviteController(app) {
    return async function cancelInviteController(request) {
        const { inviteId } = inviteIdParamSchema.parse(request.params);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID;
        
        if (!tenantId) {
            throw app.httpErrors.unauthorized('Tenant context required');
        }
        
        const invite = await cancelUserInvite(app.db.models, inviteId, tenantId);
        
        if (!invite) {
            throw app.httpErrors.notFound('Invite not found');
        }
        
        // Emit socket event
        if (app.tenantIO) {
            app.tenantIO.emit('user:invite:cancelled', { invite });
        }
        
        return {
            ok: true,
            data: invite
        };
    };
}

export function createAcceptInviteController(app) {
    return async function acceptInviteController(request) {
        const { token, password } = acceptInviteSchema.parse(request.body);
        const result = await acceptUserInvite(app.db.models, token, password);

        if (!result.ok) {
            const statusCode = {
                'invite_not_found': 404,
                'invite_expired': 400,
                'invite_already_accepted': 400,
                'user_already_exists': 409
            }[result.reason] || 400;

            throw app.httpErrors.createError(statusCode, result.reason);
        }

        if (app.tenantIO) {
            app.tenantIO.emit('user:invite:accepted', { user: result.user });
        }

        return {
            ok: true,
            data: result.user
        };
    };
}

export function createUploadUserImageController(app) {
    return async function uploadUserImageController(request) {
        const file = await request.file();
        if (!file) {
            throw app.httpErrors.badRequest('No file uploaded');
        }
        const buffer = await file.toBuffer();
        const result = await uploadUserImage(buffer);
        if (!result) {
            throw app.httpErrors.notImplemented('Image upload is not configured (set CLOUDINARY_* env)');
        }
        const data = {
            ok: true,
            data: {
                imageUrl: result.url,
                cloudinaryPublicId: result.publicId,
                cloudinaryResourceType: result.resourceType
            }
        };
        return data;
    };
}
