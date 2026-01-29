import fetch from 'node-fetch';

export class CoolifyClient {
    constructor({ baseUrl, token, logger }) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.logger = logger;
    }

    async request(path, options = {}) {
        if (!this.baseUrl || !this.token) {
            throw new Error('Coolify client not configured');
        }

        const url = `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
        const headers = {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        if (!response.ok) {
            const text = await response.text();
            this.logger?.error({ url, status: response.status, text }, 'Coolify request failed');
            throw new Error(`Coolify request failed (${response.status})`);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    createDeployment(payload) {
        return this.request('/deployments', {
            method: 'POST',
            body: payload
        });
    }

    getDeploymentStatus(deploymentId) {
        return this.request(`/deployments/${deploymentId}`);
    }
}

export function createCoolifyClient(app) {
    return new CoolifyClient({
        baseUrl: process.env.COOLIFY_BASE_URL,
        token: process.env.COOLIFY_API_TOKEN,
        logger: app.log.child({ service: 'coolify-client' })
    });
}
