'use strict';

const { v4: uuid } = require('uuid');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();
        const templates = [
            {
                id: uuid(),
                key: 'tenant.welcome-email',
                name: 'Tenant Welcome Email',
                type: 'email',
                description: 'Sent to tenant admins after provisioning completes.',
                content: 'Hi {{adminName}},\n\nYour Freight CRM tenant {{tenantName}} is ready. Login at {{loginUrl}}.\n\nThanks,\nFreight CRM Team',
                metadata: { subject: 'Welcome to Freight CRM' },
                version: 1,
                is_active: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuid(),
                key: 'tenant.sync-notice',
                name: 'Tenant Sync Notice',
                type: 'email',
                description: 'Notification email when subscription or feature sync occurs.',
                content: 'Features for {{tenantName}} synced at {{syncedAt}}.\nChanges:\n{{changes}}',
                metadata: { subject: 'Feature Sync Completed' },
                version: 2,
                is_active: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuid(),
                key: 'tenant.provisioning-start',
                name: 'Provisioning Started',
                type: 'email',
                description: 'Sent to tenant decision makers when provisioning kicks off.',
                content: 'Hi {{adminName}},\n\nProvisioning has started for {{tenantName}}. We will notify you once the services are live.',
                metadata: { subject: 'Provisioning Started' },
                version: 3,
                is_active: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuid(),
                key: 'tenant.low-margin-alert',
                name: 'Low Margin Alert',
                type: 'email',
                description: 'Triggered when quotes/orders are below configured margin.',
                content: 'Quote {{quoteNumber}} is below the target margin threshold. Approver: {{approver}}.',
                metadata: { subject: 'Margin Review Required' },
                version: 4,
                is_active: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuid(),
                key: 'role-template.default',
                name: 'Default Role Template',
                type: 'json',
                description: 'Core roles and permissions shipped to every tenant.',
                content: JSON.stringify({
                    version: '1.0.0',
                    roles: ['admin', 'sub-admin', 'sales', 'sales-head', 'dispatch', 'dispatch-head', 'marketing', 'marketing-head', 'accounts', 'accounts-head', 'admin-depart'],
                    permissions: [
                        'dashboard.view',
                        'leads.read', 'leads.create', 'leads.update', 'leads.delete',
                        'quotes.read', 'quotes.create', 'quotes.update', 'quotes.approve',
                        'orders.read', 'orders.create', 'orders.update',
                        'dispatch.read', 'dispatch.update',
                        'carriers.read', 'carriers.create', 'carriers.update',
                        'invoices.read', 'invoices.create', 'invoices.update',
                        'payments.read', 'payments.create',
                        'marketing.campaigns', 'marketing.imports',
                        'notifications.read', 'notifications.manage',
                        'calendar.read', 'calendar.manage',
                        'files.read', 'files.upload',
                        'knowledge.read', 'knowledge.manage',
                        'analytics.view',
                        'search.view',
                        'templates.view',
                        'admin.sync'
                    ]
                }),
                metadata: { entity: 'roles-permissions' },
                version: 5,
                is_active: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuid(),
                key: 'tenant.password-reset',
                name: 'Password Reset Email',
                type: 'email',
                description: 'Tenant password reset instructions.',
                content: 'Hi {{userName}},\nFollow this link to reset your password: {{resetUrl}}. The link expires in {{expiresIn}} minutes.',
                metadata: { subject: 'Reset your Freight CRM password' },
                version: 6,
                is_active: true,
                created_at: now,
                updated_at: now
            }
        ];

        const keys = templates.map((template) => template.key);
        const existingRows = await queryInterface.sequelize.query(
            'SELECT key FROM templates WHERE key IN (:keys)',
            {
                replacements: { keys },
                type: queryInterface.sequelize.QueryTypes.SELECT
            }
        );

        const existingKeys = new Set(existingRows.map((row) => row.key));
        const toInsert = templates
            .filter((template) => !existingKeys.has(template.key))
            .map((template) => ({
                ...template,
                metadata: JSON.stringify(template.metadata)
            }));

        const toUpdate = templates.filter((template) => existingKeys.has(template.key));

        if (toInsert.length) {
            await queryInterface.bulkInsert('templates', toInsert);
        }

        for (const template of toUpdate) {
            await queryInterface.bulkUpdate(
                'templates',
                {
                    name: template.name,
                    type: template.type,
                    description: template.description,
                    content: template.content,
                    metadata: JSON.stringify(template.metadata),
                    version: template.version,
                    is_active: template.is_active,
                    updated_at: now
                },
                { key: template.key }
            );
        }

        await queryInterface.sequelize.query(
            `
            INSERT INTO template_meta (id, global_version, updated_at)
            VALUES (1, :version, :updatedAt)
            ON CONFLICT (id) DO UPDATE
            SET global_version = GREATEST(template_meta.global_version, EXCLUDED.global_version),
                updated_at = EXCLUDED.updated_at
            `,
            {
                replacements: {
                    version: 6,
                    updatedAt: now
                }
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('templates', null, {});
        await queryInterface.bulkDelete('template_meta', null, {});
    }
};
