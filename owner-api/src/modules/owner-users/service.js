import bcrypt from 'bcrypt';

function sanitize(user) {
    if (!user) {
        return null;
    }

    const plain = typeof user.toJSON === 'function' ? user.toJSON() : user;
    delete plain.passwordHash;
    return plain;
}

export async function listOwnerUsers(models) {
    const users = await models.OwnerUser.findAll({
        order: [['createdAt', 'DESC']]
    });
    return users.map(sanitize);
}

export async function createOwnerUser(models, payload) {
    const { password, ...rest } = payload;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await models.OwnerUser.create({
        ...rest,
        passwordHash,
        isActive: rest.isActive ?? true
    });
    return sanitize(user);
}

export async function findOwnerUserById(models, id) {
    const user = await models.OwnerUser.findByPk(id);
    return sanitize(user);
}

export async function updateOwnerUser(models, id, changes) {
    const user = await models.OwnerUser.findByPk(id);
    if (!user) {
        return null;
    }

    const updates = { ...changes };
    if (updates.password) {
        updates.passwordHash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
    }

    await user.update(updates);
    return sanitize(user);
}

export async function deleteOwnerUser(models, id) {
    const user = await models.OwnerUser.findByPk(id);
    if (!user) {
        return null;
    }

    await user.destroy();
    return sanitize(user);
}


