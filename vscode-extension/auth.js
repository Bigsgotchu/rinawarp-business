/**
 * RinaWarp Authentication Module
 * Handles OAuth-like flow for VS Code extension (JavaScript version)
 */

const vscode = require("vscode");
const axios = require("axios");

class RinaWarpAuth {
    constructor() {
        this.AUTH_URL = "https://rinawarptech.com/vscode/login";
        this.BACKEND_URL = "https://api.rinawarptech.com";
        this.TOKEN_KEY = "rinawarp_auth_token";
        this.USER_KEY = "rinawarp_user_data";
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated() {
        const token = await this.getStoredToken();
        if (!token) return false;
        return await this.validateToken(token);
    }

    /**
     * Get stored authentication token
     */
    async getStoredToken() {
        const config = vscode.workspace.getConfiguration();
        const token = config.get(this.TOKEN_KEY);
        return token || null;
    }

    /**
     * Get stored user data
     */
    async getStoredUser() {
        try {
            const config = vscode.workspace.getConfiguration();
            const userData = config.get(this.USER_KEY);
            return userData || null;
        } catch {
            return null;
        }
    }

    /**
     * Sign in to RinaWarp Terminal Pro
     */
    async signIn() {
        try {
            vscode.window.showInformationMessage("Opening RinaWarp Terminal Pro login...");

            // Open authentication URL in external browser
            await vscode.env.openExternal(vscode.Uri.parse(this.AUTH_URL));

            vscode.window.showInformationMessage(
                "Please complete login in your browser, then return to VS Code.",
                "Check Status"
            ).then(selection => {
                if (selection === "Check Status") {
                    this.checkAuthStatus();
                }
            });

            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Authentication failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Check authentication status
     */
    async checkAuthStatus() {
        const isAuth = await this.isAuthenticated();
        if (isAuth) {
            const user = await this.getStoredUser();
            vscode.window.showInformationMessage(`✔ Successfully signed in as ${user.email}!`);
        } else {
            vscode.window.showWarningMessage("Not signed in. Click to sign in to RinaWarp Terminal Pro.", "Sign In")
                .then(selection => {
                    if (selection === "Sign In") {
                        this.signIn();
                    }
                });
        }
    }

    /**
     * Handle OAuth callback from web
     */
    async handleAuthCallback(uri) {
        try {
            const query = uri.query;
            const params = new URLSearchParams(query);
            const token = params.get("token");
            const userId = params.get("user_id");

            if (!token || !userId) {
                throw new Error("Invalid authentication callback");
            }

            // Store token
            const config = vscode.workspace.getConfiguration();
            await config.update(this.TOKEN_KEY, token, vscode.ConfigurationTarget.Global);

            // Fetch user data
            const user = await this.fetchUserData(token);
            await this.storeUserData(user);

            vscode.window.showInformationMessage(`✔ Successfully signed in to RinaWarp Terminal Pro!`);
            return user;
        } catch (error) {
            vscode.window.showErrorMessage(`Authentication callback failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Validate token with backend
     */
    async validateToken(token) {
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
    async fetchUserData(token) {
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
            throw new Error(`Failed to fetch user data: ${error.message}`);
        }
    }

    /**
     * Store user data locally
     */
    async storeUserData(user) {
        const config = vscode.workspace.getConfiguration();
        await config.update(this.USER_KEY, user, vscode.ConfigurationTarget.Global);
    }

    /**
     * Get user's current plan
     */
    async getUserPlan() {
        const user = await this.getStoredUser();
        return user?.plan || 'community';
    }

    /**
     * Check if user has premium access
     */
    async hasPremiumAccess() {
        const plan = await this.getUserPlan();
        return ['pioneer', 'founder', 'monthly_creator', 'monthly_pro'].includes(plan);
    }

    /**
     * Make authenticated API request
     */
    async makeAuthenticatedRequest(url, options = {}) {
        const token = await this.getStoredToken();
        if (!token) {
            throw new Error("Not authenticated");
        }

        return await axios({
            url,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...options.headers
            },
            ...options
        });
    }

    /**
     * Sign out from RinaWarp Terminal Pro
     */
    async signOut() {
        try {
            const config = vscode.workspace.getConfiguration();
            await config.update(this.TOKEN_KEY, null, vscode.ConfigurationTarget.Global);
            await config.update(this.USER_KEY, null, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage("Signed out from RinaWarp Terminal Pro");
        } catch (error) {
            vscode.window.showErrorMessage(`Sign out failed: ${error.message}`);
        }
    }
}

module.exports = RinaWarpAuth;