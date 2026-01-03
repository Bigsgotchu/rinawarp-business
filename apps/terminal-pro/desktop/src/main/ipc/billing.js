import { shell } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-map';
export class BillingHandler {
    initialized = false;
    adminApiBaseUrl;
    constructor() {
        console.log('💳 Initializing Billing Handler');
        this.adminApiBaseUrl =
            process.env['ADMIN_API_BASE_URL'] || 'https://rinawarp-admin-api.rinawarptech.workers.dev';
    }
    register(ipcMain) {
        if (this.initialized)
            return;
        ipcMain.handle(IPC_CHANNELS.BILLING.START_UPGRADE, this.handleStartUpgrade.bind(this));
        this.initialized = true;
        console.log('✅ Billing IPC handlers registered');
    }
    async apiCall(endpoint, method = 'GET', body) {
        const url = `${this.adminApiBaseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        return data;
    }
    async handleStartUpgrade(event, payload) {
        console.log('💳 Start upgrade:', payload);
        try {
            // Map tier to plan ID
            const planIdMap = {
                starter: 'starter_monthly',
                creator: 'creator_monthly',
                pro: 'pro_monthly',
            };
            const planId = planIdMap[payload.tier];
            if (!planId) {
                throw new Error(`Invalid tier: ${payload.tier}`);
            }
            const result = await this.apiCall('/api/stripe/create-checkout-session', 'POST', {
                planId,
                email: payload.email,
            });
            // Open the checkout URL in external browser
            await shell.openExternal(result.url);
            return { success: true };
        }
        catch (error) {
            console.error('Billing upgrade failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    cleanup() {
        this.initialized = false;
    }
}
