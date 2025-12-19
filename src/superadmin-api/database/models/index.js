import SuperAdminModel from './super-admin.js';

export function initSuperadminModels(sequelize) {
    const models = {};

    // SuperAdmin model
    models.SuperAdmin = SuperAdminModel(sequelize);

    return models;
}

