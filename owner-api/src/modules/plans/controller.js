import {
    createPlanSchema,
    updatePlanSchema,
    planIdParamSchema
} from './schemas.js';
import {
    listPlans,
    createPlan,
    findPlanById,
    updatePlan,
    deletePlan
} from './service.js';

export function createListPlansController(app) {
    return async function listPlansController() {
        const plans = await listPlans(app.db.models);
        return {
            ok: true,
            data: plans
        };
    };
}

export function createCreatePlanController(app) {
    return async function createPlanController(request) {
        const payload = createPlanSchema.parse(request.body);
        const plan = await createPlan(app.db.models, payload);
        return {
            ok: true,
            data: plan
        };
    };
}

export function createGetPlanController(app) {
    return async function getPlanController(request) {
        const { id } = planIdParamSchema.parse(request.params);
        const plan = await findPlanById(app.db.models, id);
        if (!plan) {
            throw app.httpErrors.notFound('Plan not found');
        }

        return {
            ok: true,
            data: plan
        };
    };
}

export function createUpdatePlanController(app) {
    return async function updatePlanController(request) {
        const { id } = planIdParamSchema.parse(request.params);
        const payload = updatePlanSchema.parse(request.body);
        const plan = await updatePlan(app.db.models, id, payload);
        if (!plan) {
            throw app.httpErrors.notFound('Plan not found');
        }

        return {
            ok: true,
            data: plan
        };
    };
}

export function createDeletePlanController(app) {
    return async function deletePlanController(request) {
        const { id } = planIdParamSchema.parse(request.params);
        const plan = await deletePlan(app.db.models, id);
        if (!plan) {
            throw app.httpErrors.notFound('Plan not found');
        }

        return {
            ok: true,
            data: { id }
        };
    };
}
