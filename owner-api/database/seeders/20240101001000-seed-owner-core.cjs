'use strict';

const { hashSync } = require('bcrypt');
const { v4: uuid } = require('uuid');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();

        // Check for existing owner users
        const existingUsers = await queryInterface.sequelize.query(
            `SELECT email FROM owner_users WHERE email = :email`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { email: 'superadmin@hospitalmanagement.com' }
            }
        );

        if (existingUsers.length === 0) {
            const ownerUsers = [
                {
                    id: uuid(),
                    email: 'superadmin@hospitalmanagement.com',
                    password_hash: hashSync('ChangeMe123!', 10),
                    role: 'super-admin',
                    is_active: true,
                    created_at: now,
                    updated_at: now
                }
            ];
            await queryInterface.bulkInsert('owner_users', ownerUsers);
        }

        // Check for existing plans
        const existingPlans = await queryInterface.sequelize.query(
            `SELECT name FROM plans WHERE name IN (:names)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { names: ['Starter', 'Growth', 'Scale'] }
            }
        );
        const existingPlanNames = new Set(existingPlans.map(p => p.name));

        const plans = [
            {
                id: uuid(),
                name: 'Starter',
                description: 'Starter plan with core CRM modules and limited seats.',
                limits: JSON.stringify({ seats: 5, storageGb: 10, aiCredits: 0, marketingImports: 2 }),
                is_active: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuid(),
                name: 'Growth',
                description: 'Growth plan with automation, analytics and higher usage thresholds.',
                limits: JSON.stringify({ seats: 25, storageGb: 100, aiCredits: 5000, marketingImports: 12 }),
                is_active: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuid(),
                name: 'Scale',
                description: 'Scale plan with unlimited departments, premium support and AI workloads.',
                limits: JSON.stringify({ seats: 100, storageGb: 500, aiCredits: 20000, marketingImports: 999 }),
                is_active: true,
                created_at: now,
                updated_at: now
            }
        ].filter(p => !existingPlanNames.has(p.name));

        if (plans.length > 0) {
            await queryInterface.bulkInsert('plans', plans);
        }

        // Check for existing features
        const featureKeys = [
            'leads.pipeline', 'quotes.workflow', 'orders.lifecycle', 'dispatch.board',
            'carriers.registry', 'invoices.billing', 'payments.collection',
            'marketing.automation', 'marketing.api-integrations', 'analytics.dashboard',
            'analytics.ai-forecast', 'notifications.center', 'calendar.sync',
            'files.storage', 'knowledge.base', 'ai.pricing', 'search.global',
            'admin.sync', 'templates.manager', 'owner.telemetry', 'owner.permissions'
        ];

        const existingFeatures = await queryInterface.sequelize.query(
            `SELECT key FROM features WHERE key IN (:keys)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { keys: featureKeys }
            }
        );
        const existingFeatureKeys = new Set(existingFeatures.map(f => f.key));

        const features = [
            ['leads.pipeline', 'Leads Pipeline', 'Track leads by stage and department.', true],
            ['quotes.workflow', 'Quotes Workflow', 'Configure quote approvals and margin rules.', true],
            ['orders.lifecycle', 'Order Lifecycle', 'Order handoff, tracking and lifecycle management.', true],
            ['dispatch.board', 'Dispatch Board', 'Real-time dispatch board with carrier assignments.', true],
            ['carriers.registry', 'Carrier Registry', 'Manage carrier packets, compliance and notes.', true],
            ['invoices.billing', 'Invoices & Billing', 'Generate invoices and manage receivables.', true],
            ['payments.collection', 'Payments Collection', 'Record payments, reconcile and report.', true],
            ['marketing.automation', 'Marketing Automation', 'Campaigns, lead imports and nurture flows.', false],
            ['marketing.api-integrations', 'Marketing API Integrations', 'Google / Meta / LinkedIn lead connectors.', false],
            ['analytics.dashboard', 'Analytics Dashboard', 'Role-based dashboards and KPIs.', true],
            ['analytics.ai-forecast', 'AI Forecasting', 'Predictive revenue and margin insights.', false],
            ['notifications.center', 'Notifications Center', 'Multi-channel in-app notifications.', true],
            ['calendar.sync', 'Calendar & Tasks', 'Shared calendars, tasks and follow-ups.', true],
            ['files.storage', 'File Storage', 'Managed storage with access control.', true],
            ['knowledge.base', 'Knowledge Base', 'Internal documentation and carrier notes.', true],
            ['ai.pricing', 'AI Pricing', 'Aqua Price suggestions and optimization.', false],
            ['search.global', 'Global Search', 'Cross-module federated search.', true],
            ['admin.sync', 'Admin Sync', 'Owner ↔ tenant feature synchronisation.', true],
            ['templates.manager', 'Template Manager', 'Versioned templates for communications.', true],
            ['owner.telemetry', 'Owner Telemetry', 'Tenant usage dashboards for owner admins.', true],
            ['owner.permissions', 'Global Role Templates', 'Manage role & permission templates centrally.', true]
        ]
        .filter(([key]) => !existingFeatureKeys.has(key))
        .map(([key, name, description, enabled]) => ({
            id: uuid(),
            key,
            name,
            description,
            default_enabled: enabled,
            created_at: now,
            updated_at: now
        }));

        if (features.length > 0) {
            await queryInterface.bulkInsert('features', features);
        }
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('tenant_features', null, {});
        await queryInterface.bulkDelete('features', null, {});
        await queryInterface.bulkDelete('plans', null, {});
        await queryInterface.bulkDelete('owner_users', null, {});
    }
};
