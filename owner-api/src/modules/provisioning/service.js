import { createCoolifyClient } from '../../services/coolify-client.js';

const deploymentWatchers = new Map();

function watcherKey(tenantId, deploymentId) {
    return `${tenantId}:${deploymentId}`;
}

async function recordAudit(app, tenantId, step, status, payload = null, error = null) {
    const entry = await app.db.models.ProvisioningAudit.create({
        tenantId,
        step,
        status,
        payload,
        error
    });

    app.ownerIO?.emit('provisioning.audit', {
        tenantId,
        step,
        status,
        error,
        createdAt: entry.createdAt
    });

    return entry;
}

function normalizeState(state) {
    if (!state) return 'unknown';
    const value = String(state).toLowerCase();
    if (['success', 'successful', 'completed'].includes(value)) {
        return 'success';
    }
    if (['failed', 'error', 'errored'].includes(value)) {
        return 'failed';
    }
    if (['running', 'in_progress', 'pending', 'queued'].includes(value)) {
        return 'in_progress';
    }
    return value;
}

async function pollDeploymentStatus(app, tenantId, deploymentId) {
    if (!deploymentId) {
        return null;
    }

    const client = createCoolifyClient(app);
    const logger = app.log.child({ module: 'provisioning', tenantId, deploymentId });

    try {
        const statusPayload = await client.getDeploymentStatus(deploymentId);
        const state = normalizeState(statusPayload?.state || statusPayload?.status);

        await recordAudit(app, tenantId, 'deployment.status', state, {
            deploymentId,
            status: statusPayload
        });

        if (state === 'success') {
            await app.db.models.Tenant.update({ status: 'active' }, {
                where: { id: tenantId }
            });
        }

        if (state === 'failed') {
            await app.db.models.Tenant.update({ status: 'provision_failed' }, {
                where: { id: tenantId }
            });
        }

        app.ownerIO?.emit('provisioning.status', {
            tenantId,
            deploymentId,
            state,
            payload: statusPayload
        });

        logger.info({ state }, 'Coolify deployment polled');

        return {
            state,
            payload: statusPayload
        };
    } catch (error) {
        logger.error({ err: error }, 'Failed to poll Coolify deployment');
        await recordAudit(app, tenantId, 'deployment.status', 'failed', {
            deploymentId
        }, error.message);
        throw error;
    }
}

function scheduleDeploymentWatcher(app, tenantId, deploymentId, attempt = 0) {
    if (!deploymentId) {
        return;
    }

    const key = watcherKey(tenantId, deploymentId);
    if (deploymentWatchers.has(key)) {
        return;
    }

    const intervalMs = Number(process.env.PROVISION_POLL_INTERVAL_MS || 30000);
    const maxAttempts = Number(process.env.PROVISION_POLL_MAX_ATTEMPTS || 40);
    const logger = app.log.child({
        module: 'provisioning',
        tenantId,
        deploymentId,
        intervalMs,
        maxAttempts
    });

    async function step(currentAttempt) {
        let shouldContinue = true;
        try {
            const result = await pollDeploymentStatus(app, tenantId, deploymentId);
            const state = result?.state || 'unknown';
            if (['success', 'failed'].includes(state)) {
                shouldContinue = false;
            }
        } catch (error) {
            logger.warn({ err: error, attempt: currentAttempt }, 'Provisioning poll attempt failed');
        }

        if (!shouldContinue || currentAttempt + 1 >= maxAttempts) {
            const handle = deploymentWatchers.get(key);
            if (handle) {
                clearTimeout(handle);
            }
            deploymentWatchers.delete(key);
            return;
        }

        const handle = setTimeout(() => step(currentAttempt + 1), intervalMs);
        deploymentWatchers.set(key, handle);
    }

    const handle = setTimeout(() => step(attempt), intervalMs);
    deploymentWatchers.set(key, handle);
}

export async function enqueueProvisioningWorkflow(app, payload) {
    const logger = app.log.child({ module: 'provisioning', tenantId: payload.tenantId });
    const client = createCoolifyClient(app);

    const tenant = await app.db.models.Tenant.findByPk(payload.tenantId);
    if (!tenant) {
        throw app.httpErrors.notFound('Tenant not found');
    }

    const requiredEnv = ['COOLIFY_BASE_URL', 'COOLIFY_API_TOKEN'];
    const missing = requiredEnv.filter((key) => !process.env[key] || !process.env[key]?.trim());
    if (missing.length) {
        logger.error({ missing }, 'Coolify credentials missing');
        await tenant.update({ status: 'provision_failed' });
        await recordAudit(app, payload.tenantId, 'deployment.requested', 'failed', {
            reason: 'Missing Coolify credentials',
            missing
        }, 'Coolify credentials missing');
        throw app.httpErrors.serviceUnavailable('Coolify credentials not configured');
    }

    logger.info('Starting provisioning workflow');

    await tenant.update({ status: 'provisioning' });

    let deployment = null;
    try {
        deployment = await client.createDeployment({
            tenantId: payload.tenantId,
            force: payload.force ?? false
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to create Coolify deployment');
        await recordAudit(app, payload.tenantId, 'deployment.requested', 'failed', {
            force: payload.force ?? false
        }, error.message);
        await tenant.update({ status: 'provision_failed' });
        throw error;
    }

    const deploymentId = deployment?.id;

    await recordAudit(app, payload.tenantId, 'deployment.requested', 'queued', {
        deploymentId,
        force: payload.force ?? false
    });

    if (deploymentId) {
        await pollDeploymentStatus(app, payload.tenantId, deploymentId).catch((error) => {
            logger.error({ err: error }, 'Initial deployment poll failed');
        });
        scheduleDeploymentWatcher(app, payload.tenantId, deploymentId);
    }

    return {
        tenantId: payload.tenantId,
        status: 'queued',
        deploymentId
    };
}

export async function getProvisioningStatus(app, tenantId) {
    const latest = await app.db.models.ProvisioningAudit.findOne({
        where: { tenantId },
        order: [['createdAt', 'DESC']]
    });

    let state = latest?.status || 'unknown';
    let payload = latest?.payload || null;

    const deploymentId = payload?.deploymentId || latest?.payload?.status?.id;

    if (!latest || ['in_progress', 'queued', 'pending'].includes(normalizeState(state))) {
        try {
            const poll = await pollDeploymentStatus(app, tenantId, deploymentId);
            if (poll) {
                state = poll.state;
                payload = poll.payload;
            }
            scheduleDeploymentWatcher(app, tenantId, deploymentId);
        } catch (error) {
            app.log.warn({ tenantId, err: error }, 'Provisioning status poll failed');
        }
    }

    return {
        tenantId,
        status: normalizeState(state),
        payload
    };
}
