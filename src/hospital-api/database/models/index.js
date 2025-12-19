import StaffModel from './staff.js';

export function initHospitalModels(sequelize) {
    const models = {};

    // Staff model
    models.Staff = StaffModel(sequelize);

    return models;
}

