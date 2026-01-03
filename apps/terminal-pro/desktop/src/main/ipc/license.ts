import { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-map';
import { machineIdSync } from 'node-machine-id';

export class LicenseHandler {
  private initialized = false;
  private adminApiBaseUrl: string;
  private machineHash: string;

  constructor() {
    console.log('🔑 Initializing License Handler');
    this.adminApiBaseUrl =
      process.env['ADMIN_API_BASE_URL'] || 'https://rinawarp-admin-api.rinawarptech.workers.dev';
    this.machineHash = machineIdSync();
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    ipcMain.handle(IPC_CHANNELS.LICENSE.VERIFY, this.handleVerify.bind(this));
    ipcMain.handle(IPC_CHANNELS.LICENSE.GET_KEY, this.handleGet.bind(this));
    ipcMain.handle(IPC_CHANNELS.LICENSE.REFRESH, this.handleRefresh.bind(this));
    ipcMain.handle(IPC_CHANNELS.LICENSE.GET_PLAN, this.handleGetPlan.bind(this));

    this.initialized = true;
    console.log('✅ License IPC handlers registered');
  }

  private async apiCall(endpoint: string, method = 'GET', body?: any): Promise<any> {
    const url = `${this.adminApiBaseUrl}${endpoint}`;
    const options: RequestInit = {
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

  private async handleVerify(event: any, licenseKey: string): Promise<any> {
    console.log('🔑 Verify license:', licenseKey);

    try {
      // First try to activate if not already activated
      const activateResult = await this.apiCall('/api/license/activate', 'POST', {
        licenseKey,
        machineHash: this.machineHash,
        appVersion: process.env['npm_package_version'] || '1.0.0',
      });

      return {
        valid: true,
        tier: this.mapEntitlementToTier(activateResult.entitlement),
        status: activateResult.status,
        planId: activateResult.planId,
      };
    } catch (error) {
      console.error('License activation failed:', error);
      return { valid: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async handleGet(event: any, payload: any): Promise<any> {
    console.log('📋 Get license:', payload);
    // This would typically return stored license info from local storage
    // For now, return null as the app manages license state in renderer
    return { license: null };
  }

  private async handleRefresh(event: any, licenseKey: string): Promise<any> {
    console.log('🔄 Refresh license:', licenseKey);

    try {
      const validateResult = await this.apiCall('/api/license/validate', 'POST', {
        licenseKey,
        machineHash: this.machineHash,
      });

      return {
        success: true,
        valid: true,
        tier: this.mapEntitlementToTier(validateResult.entitlement),
        status: validateResult.status,
        planId: validateResult.planId,
      };
    } catch (error) {
      console.error('License validation failed:', error);
      return {
        success: false,
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleGetPlan(event: any, licenseKey: string): Promise<any> {
    console.log('📋 Get plan for license:', licenseKey);

    try {
      const validateResult = await this.apiCall('/api/license/validate', 'POST', {
        licenseKey,
        machineHash: this.machineHash,
      });

      return {
        planId: validateResult.planId,
        entitlement: validateResult.entitlement,
        status: validateResult.status,
        tier: this.mapEntitlementToTier(validateResult.entitlement),
      };
    } catch (error) {
      console.error('License plan retrieval failed:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  private mapEntitlementToTier(entitlement: string): string {
    // Map plan IDs to tier names
    const tierMap: Record<string, string> = {
      starter_monthly: 'starter',
      creator_monthly: 'creator',
      pro_monthly: 'pro',
      starter_lifetime: 'starter',
      creator_lifetime: 'creator',
      final_lifetime: 'pro',
    };
    return tierMap[entitlement] || 'free';
  }

  cleanup(): void {
    this.initialized = false;
  }
}
