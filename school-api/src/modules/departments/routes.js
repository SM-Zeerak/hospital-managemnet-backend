import {
    createListDepartmentsController,
    createCreateDepartmentController,
    createGetDepartmentController,
    createUpdateDepartmentController,
    createDeleteDepartmentController
} from './controller.js';

export function registerDepartmentRoutes(app) {
    const listController = createListDepartmentsController(app);
    const createController = createCreateDepartmentController(app);
    const getController = createGetDepartmentController(app);
    const updateController = createUpdateDepartmentController(app);
    const deleteController = createDeleteDepartmentController(app);

    const authGuard = app.authGuard;
    const requireAdmin = app.roleGuard(['admin', 'sub-admin']);
    const requireRead = app.permissionGuard('departments.read');
    const requireCreate = app.permissionGuard('departments.create');
    const requireUpdate = app.permissionGuard('departments.update');
    const requireDelete = app.permissionGuard('departments.delete');

    app.get('/school/departments', {
        schema: {
            tags: ['Departments'],
            summary: 'List departments',
            description: 'Get a list of all hospital departments',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, requireRead]
    }, listController);

    app.post('/school/departments', {
        schema: {
            tags: ['Departments'],
            summary: 'Create department',
            description: 'Create a new hospital department',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' }
                }
            }
        },
        preHandler: [authGuard, requireAdmin, requireCreate]
    }, createController);

    app.get('/school/departments/:id', {
        schema: {
            tags: ['Departments'],
            summary: 'Get department by ID',
            description: 'Get details of a specific department',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, getController);

    app.patch('/school/departments/:id', {
        schema: {
            tags: ['Departments'],
            summary: 'Update department',
            description: 'Update department information',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' }
                }
            }
        },
        preHandler: [authGuard, requireUpdate]
    }, updateController);

    app.delete('/school/departments/:id', {
        schema: {
            tags: ['Departments'],
            summary: 'Delete department',
            description: 'Delete a department from the system',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireAdmin, requireDelete]
    }, deleteController);
}
