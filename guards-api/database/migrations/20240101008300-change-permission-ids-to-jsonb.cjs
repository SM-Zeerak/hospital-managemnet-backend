'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Change permission_ids from uuid[] to jsonb so we can easily
        // store a JS array of UUID strings without casting issues.
        const userDesc = await queryInterface.describeTable('users');
        if (userDesc.permission_ids && userDesc.permission_ids.type === 'UUID[]') {
            await queryInterface.sequelize.query(`
                ALTER TABLE users
                ALTER COLUMN permission_ids
                TYPE jsonb
                USING to_jsonb(permission_ids)
            `);
        }
    },

    async down(queryInterface, Sequelize) {
        // Best-effort: convert jsonb back to uuid[]
        const userDesc = await queryInterface.describeTable('users');
        if (userDesc.permission_ids && userDesc.permission_ids.type === 'JSONB') {
            await queryInterface.sequelize.query(`
                ALTER TABLE users
                ALTER COLUMN permission_ids
                TYPE uuid[]
                USING (
                    SELECT array_agg((elem->>0)::uuid)
                    FROM jsonb_array_elements_text(permission_ids) elem
                )
            `);
        }
    }
};

