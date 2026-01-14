/**
 * RinaWarp Authentication Module
 * Handles OAuth-like flow for VS Code extension
 */

import * as vscode from 'vscode';
import axios from 'axios';

export interface RinaWarpUser {
    id: string;
    email: string;
    plan: 'community' | 'pioneer' | 'founder' | 'monthly_starter' | 'monthly_creator' | 'monthly_pro';
    token: string;
}

export class RinaWarpAuth {
    private static readonly AUTH_URL = 'https://rinawarptech.com/vscode/login';
    private static readonly BACKEND_URL = 'https://api.rinawarptech.com';
    private static readonly TOKEN_KEY = 'rinawarp_auth_token';
    private static readonly USER_KEY = 'rinawarp_user_data';

    /**
     * Check if user is authenticated
     */
    static async isAuthenticated(): Promise<boolean> {
        const token = await this.getStoredToken();
        return token !== null && await this.validateToken(token);
    }

    /**
     * Get stored authentication token
     */
    static async getStoredToken(): Promise<string | null> {
        return await vscode.authentication.getSession('rinawarp', [], { silent: true })
            .then(session => session?.accessToken || null)
            .catch(() => null);
    }

    /**
     * Get stored user data
     */
    static async getStoredUser(): Promise<RinaWarpUser | null> {
        try {
            const userData = await vscode.workspace.getConfiguration().get('rinawarp.userData');
            return userData as RinaWarpUser || null;
        } catch {
            return null;
        }
    }

    /**
     * Sign in to RinaWarp Terminal Pro
     */
    static async signIn(): Promise<RinaWarpUser | null> {
        try {
            // Open authentication URL in external browser
            await vscode.env.openExternal(vscode.Uri.parse(this.AUTH_URL));

            // Register URI handler for callback
            const authProvider = new RinaWarpAuthProvider();
            const session = await vscode.authentication.createSession('rinawarp', []);

            if (session) {
                const user = await this.fetchUserData(session.accessToken);
                await this.storeUserData(user);
                vscode.window.showInformationMessage(`✔ Welcome to RinaWarp Terminal Pro, ${user.email}!`);
                return user;
            }

            return null;
        } catch (error) {
            vscode.window.showErrorMessage(`Authentication failed: ${error}`);
            return null;
        }
    }

    /**
     * Sign out from RinaWarp Terminal Pro
     */
    static async signOut(): Promise<void> {
        try {
            await vscode.authentication.removeSession('rinawarp', '');
            await vscode.workspace.getConfiguration().update('rinawarp.userData', null, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Signed out from RinaWarp Terminal Pro');
        } catch (error) {
            vscode.window.showErrorMessage(`Sign out failed: ${error}`);
        }
    }

    /**
     * Handle OAuth callback from web
     */
    static async handleAuthCallback(uri: vscode.Uri): Promise<RinaWarpUser | null> {
        try {
            const queryParams = new URLSearchParams(uri.query);
            const token = queryParams.get('token');
            const userId = queryParams.get('user_id');

            if (!token || !userId) {
                throw new Error('Invalid authentication callback');
            }

            // Create VS Code session
            const session = await vscode.authentication.createSession('rinawarp', [token]);

            if (session) {
                const user = await this.fetchUserData(token);
                await this.storeUserData(user);
                vscode.window.showInformationMessage(`✔ Successfully signed in to RinaWarp Terminal Pro!`);
                return user;
            }

            return null;
        } catch (error) {
            vscode.window.showErrorMessage(`Authentication callback failed: ${error}`);
            return null;
        }
    }

    /**
     * Validate token with backend
     */
    static async validateToken(token: string): Promise<boolean> {
        try {
            const response = await axios.get(`${this.BACKEND_URL}/api/vscode/license`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.status === 200;
        } catch {
            return false;
        }
    }

    /**
     * Fetch user data from backend
     */
    static async fetchUserData(token: string): Promise<RinaWarpUser> {
        try {
            const response = await axios.get(`${this.BACKEND_URL}/api/vscode/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            return {
                id: response.data.id,
                email: response.data.email,
                plan: response.data.plan,
                token: token
            };
        } catch (error) {
            throw new Error(`Failed to fetch user data: ${error}`);
        }
    }

    /**
     * Store user data locally
     */
    static async storeUserData(user: RinaWarpUser): Promise<void> {
        await vscode.workspace.getConfiguration().update('rinawarp.userData', user, vscode.ConfigurationTarget.Global);
    }

    /**
     * Get user's current plan
     */
    static async getUserPlan(): Promise<string> {
        const user = await this.getStoredUser();
        return user?.plan || 'community';
    }

    /**
     * Check if user has premium access
     */
    static async hasPremiumAccess(): Promise<boolean> {
        const plan = await this.getUserPlan();
        return ['pioneer', 'founder', 'monthly_creator', 'monthly_pro'].includes(plan);
    }

    /**
     * Make authenticated API request
     */
    static async makeAuthenticatedRequest(url: string, options?: any): Promise<any> {
        const token = await this.getStoredToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        return await axios({
            url,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...options?.headers
            },
            ...options
        });
    }
}

/**
 * VS Code Authentication Provider for RinaWarp
 */
export class RinaWarpAuthProvider implements vscode.AuthenticationProvider {
    onDidChangeSessions = new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>().event;

    async getSessions(scopes?: string[]): Promise<vscode.AuthenticationSession[]> {
        const token = await RinaWarpAuth.getStoredToken();
        if (token) {
            return [{
                id: 'rinawarp-session',
                accessToken: token,
                account: {
                    id: 'rinawarp-user',
                    label: 'RinaWarp User'
                },
                scopes: []
            }];
        }
        return [];
    }

    async createSession(scopes: string[]): Promise<vscode.AuthenticationSession> {
        // This will be called when we need to create a new session
        // The actual authentication happens through the web flow
        throw new Error('Use signIn() method instead');
    }

    async removeSession(sessionId: string): Promise<void> {
        await RinaWarpAuth.signOut();
    }
}