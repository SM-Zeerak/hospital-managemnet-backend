'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // Force-change permission_ids to jsonb regardless of previous type
        await queryInterface.sequelize.query(`
            ALTER TABLE users
            ALTER COLUMN permission_ids
            TYPE jsonb
            USING to_jsonb(permission_ids)
        `);
    },

    async down(queryInterface) {
        // No-op safe down; we don't try to infer previous type again
        // (column will stay jsonb if you rollback this migration)
        return;
    }
};

