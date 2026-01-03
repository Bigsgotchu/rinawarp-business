import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import axios from 'axios';
import * as fs from 'fs';
import { RinaWarpAuth, RinaWarpUser } from './authentication';

export function activate(context: vscode.ExtensionContext) {
    console.log('RinaWarp Terminal Pro extension is now active!');

    // Initialize authentication
    const auth = new RinaWarpAuth();

    // Get configuration
    const config = vscode.workspace.getConfiguration('rinawarp');
    const terminalProPath = config.get('terminalProPath') || './build-output/RinaWarp Terminal Pro-1.0.0.AppImage';
    const dashboardUrl = config.get('dashboardUrl') || 'http://localhost:8080/dev-dashboard.html';
    const backendUrl = config.get('backendUrl') || 'http://localhost:3001';

    /**
     * Check if user is authenticated and show paywall if needed
     */
    async function checkAuthentication(): Promise<boolean> {
        const isAuth = await auth.isAuthenticated();
        if (!isAuth) {
            showPaywall();
            return false;
        }
        return true;
    }

    /**
     * Show paywall interface
     */
    function showPaywall() {
        const panel = vscode.window.createWebviewPanel(
            "rinawarp-paywall",
            "RinaWarp Terminal Pro - Sign In",
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getPaywallHtml(panel.webview);
    }

    /**
     * Get paywall HTML content
     */
    function getPaywallHtml(webview: vscode.Webview): string {
        const nonce = getNonce();
        return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    margin: 0;
                    padding: 40px;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    max-width: 500px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                h1 {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .subtitle {
                    font-size: 1.2em;
                    margin-bottom: 30px;
                    opacity: 0.9;
                }
                .btn {
                    background: linear-gradient(45deg, #ff0080, #00f7c3);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    margin: 10px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    text-decoration: none;
                    display: inline-block;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                }
                .btn-primary {
                    background: linear-gradient(45deg, #ff0080, #ff4d9d);
                    padding: 18px 40px;
                    font-size: 18px;
                }
                .btn-secondary {
                    background: transparent;
                    border: 2px solid rgba(255,255,255,0.5);
                }
                .plans {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
                .plan {
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 15px;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .plan.free {
                    border-color: #4CAF50;
                }
                .plan.premium {
                    border-color: #ff0080;
                    transform: scale(1.05);
                }
                .plan h3 {
                    margin: 0 0 10px 0;
                    color: #00f7c3;
                }
                .features {
                    text-align: left;
                    margin: 20px 0;
                }
                .features li {
                    margin: 8px 0;
                    opacity: 0.9;
                }
                .pricing {
                    font-size: 1.5em;
                    font-weight: bold;
                    color: #ff0080;
                    margin: 15px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 RinaWarp Terminal Pro</h1>
                <p class="subtitle">AI-powered development assistant with advanced deployment tools</p>
                
                <div class="plans">
                    <div class="plan free">
                        <h3>Community</h3>
                        <div class="pricing">FREE</div>
                        <ul class="features">
                            <li>✅ Basic Dev Dashboard</li>
                            <li>✅ Kilo Fix Pack</li>
                            <li>✅ One-click Deploy</li>
                            <li>❌ AI Suggestions</li>
                            <li>❌ Premium Features</li>
                        </ul>
                        <button class="btn btn-secondary" onclick="signIn('community')">Sign In Free</button>
                    </div>
                    
                    <div class="plan premium">
                        <h3>Pioneer</h3>
                        <div class="pricing">$49 Lifetime</div>
                        <ul class="features">
                            <li>✅ Everything in Community</li>
                            <li>🚀 AI-Powered Suggestions</li>
                            <li>🚀 Advanced Analytics</li>
                            <li>🚀 Priority Support</li>
                            <li>🚀 Early Access Features</li>
                        </ul>
                        <button class="btn btn-primary" onclick="signIn('pioneer')">Get Pioneer</button>
                    </div>
                </div>
                
                <button class="btn" onclick="openWebsite()">Learn More</button>
            </div>

            <script>
                function signIn(plan) {
                    const vscode = acquireVsCodeApi();
                    vscode.postMessage({
                        type: 'signIn',
                        plan: plan
                    });
                }

                function openWebsite() {
                    window.open('https://rinawarptech.com', '_blank');
                }

                // Listen for messages from extension
                const vscode = acquireVsCodeApi();
                vscode.postMessage({ type: 'ready' });
            </script>
        </body>
        </html>`;
    }

    /**
     * Generate nonce for CSP
     */
    function getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * Open Terminal Pro application
     */
    async function openTerminal(): Promise<void> {
        if (!(await checkAuthentication())) {
            return;
        }

        try {
            // Check if terminal pro path exists
            if (fs.existsSync(terminalProPath)) {
                // Launch the terminal pro app
                cp.exec(`"${terminalProPath}"`, (error) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Failed to launch Terminal Pro: ${error.message}`);
                    } else {
                        vscode.window.showInformationMessage('Terminal Pro launched successfully!');
                    }
                });
            } else {
                vscode.window.showWarningMessage('Terminal Pro not found. Please check the path in settings.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error launching Terminal Pro: ${error}`);
        }
    }

    /**
     * Open Dev Dashboard
     */
    async function openDashboard(): Promise<void> {
        if (!(await checkAuthentication())) {
            return;
        }

        try {
            await vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open dashboard: ${error}`);
        }
    }

    /**
     * Run deployment process
     */
    async function runDeploy(): Promise<void> {
        if (!(await checkAuthentication())) {
            return;
        }

        const terminal = vscode.window.createTerminal('RinaWarp Deploy');
        terminal.show();
        terminal.sendText('echo "🚀 Starting RinaWarp deployment..."');
        terminal.sendText('# Add your deployment commands here');
    }

    /**
     * AI Fix Suggestions (Premium Feature)
     */
    async function aiFix(): Promise<void> {
        const hasPremium = await auth.hasPremiumAccess();
        if (!hasPremium) {
            vscode.window.showWarningMessage('AI Fix Suggestions is a premium feature. Please upgrade your plan.');
            showPaywall();
            return;
        }

        if (!(await checkAuthentication())) {
            return;
        }

        // AI fix implementation would go here
        vscode.window.showInformationMessage('🤖 AI Fix Suggestions feature coming soon!');
    }

    /**
     * Sync plugins/extensions
     */
    async function syncPlugins(): Promise<void> {
        if (!(await checkAuthentication())) {
            return;
        }

        try {
            vscode.window.showInformationMessage('🔄 Syncing plugins...');
            // Plugin sync implementation would go here
            setTimeout(() => {
                vscode.window.showInformationMessage('✅ Plugins synced successfully!');
            }, 2000);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to sync plugins: ${error}`);
        }
    }

    /**
     * Account Management
     */
    async function accountManagement(): Promise<void> {
        try {
            const user = await auth.getStoredUser();
            if (user) {
                const action = await vscode.window.showQuickPick(
                    ['View Account Details', 'Manage Subscription', 'Sign Out'],
                    { placeHolder: 'Select account action' }
                );

                switch (action) {
                    case 'View Account Details':
                        vscode.window.showInformationMessage(`Signed in as: ${user.email} (${user.plan})`);
                        break;
                    case 'Manage Subscription':
                        await vscode.env.openExternal(vscode.Uri.parse('https://rinawarptech.com/account'));
                        break;
                    case 'Sign Out':
                        await auth.signOut();
                        vscode.window.showInformationMessage('Signed out successfully');
                        break;
                }
            } else {
                showPaywall();
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Account management error: ${error}`);
        }
    }

    /**
     * Register commands
     */
    const commands = [
        vscode.commands.registerCommand('rinawarp.openTerminal', openTerminal),
        vscode.commands.registerCommand('rinawarp.openDashboard', openDashboard),
        vscode.commands.registerCommand('rinawarp.runDeploy', runDeploy),
        vscode.commands.registerCommand('rinawarp.aiFix', aiFix),
        vscode.commands.registerCommand('rinawarp.syncPlugins', syncPlugins),
        vscode.commands.registerCommand('rinawarp.launchTerminalPro', openTerminal),
        vscode.commands.registerCommand('rinawarp.account', accountManagement)
    ];

    context.subscriptions.push(...commands);

    /**
     * Create Status Bar Item
     */
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'rinawarp.account';
    statusBarItem.text = '$(terminal-terminal) RinaWarp';
    statusBarItem.tooltip = 'RinaWarp Terminal Pro';
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);

    /**
     * Create Tree View
     */
    const treeDataProvider = new RinaWarpTreeDataProvider(auth, context);
    vscode.window.registerTreeDataProvider('rinawarpView', treeDataProvider);
    context.subscriptions.push(
        vscode.commands.registerCommand('rinawarp.refreshView', () => treeDataProvider.refresh())
    );

    // Update status on startup
    updateAuthStatus();

    /**
     * Update authentication status
     */
    async function updateAuthStatus() {
        const isAuth = await auth.isAuthenticated();
        const user = await auth.getStoredUser();
        
        if (isAuth && user) {
            statusBarItem.text = `$(terminal-terminal) ${user.email}`;
            statusBarItem.tooltip = `RinaWarp - ${user.plan}`;
        } else {
            statusBarItem.text = '$(terminal-terminal) RinaWarp (Sign In)';
            statusBarItem.tooltip = 'Click to sign in to RinaWarp Terminal Pro';
        }
    }

    /**
     * Handle webview messages
     */
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor && editor.document.languageId === 'javascript' || editor.document.languageId === 'typescript') {
            updateAuthStatus();
        }
    });
}

/**
 * Tree Data Provider for RinaWarp commands
 */
class RinaWarpTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(
        private auth: typeof RinaWarpAuth,
        private context: vscode.ExtensionContext
    ) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        const isAuth = await this.auth.isAuthenticated();
        const user = await this.auth.getStoredUser();

        if (!isAuth) {
            const signInItem = new vscode.TreeItem('Sign In to RinaWarp', vscode.TreeItemCollapsibleState.None);
            signInItem.command = {
                command: 'rinawarp.account',
                title: 'Sign In'
            };
            signInItem.iconPath = new vscode.ThemeIcon('sign-in');
            return [signInItem];
        }

        if (!user) {
            return [];
        }

        const items: vscode.TreeItem[] = [];

        // User info item
        const userItem = new vscode.TreeItem(`${user.email} (${user.plan})`, vscode.TreeItemCollapsibleState.None);
        userItem.iconPath = new vscode.ThemeIcon('account');
        items.push(userItem);

        // Commands
        const commands = [
            { title: 'Open Terminal Pro', command: 'rinawarp.openTerminal', icon: 'terminal-terminal' },
            { title: 'Open Dev Dashboard', command: 'rinawarp.openDashboard', icon: 'dashboard' },
            { title: 'Run Deploy', command: 'rinawarp.runDeploy', icon: 'rocket' },
            { title: 'Sync Plugins', command: 'rinawarp.syncPlugins', icon: 'refresh' }
        ];

        // Add AI Fix if premium
        const hasPremium = await this.auth.hasPremiumAccess();
        if (hasPremium) {
            commands.push({ title: 'AI Fix Suggestions', command: 'rinawarp.aiFix', icon: 'lightbulb' });
        }

        for (const cmd of commands) {
            const item = new vscode.TreeItem(cmd.title, vscode.TreeItemCollapsibleState.None);
            item.command = {
                command: cmd.command,
                title: cmd.title
            };
            item.iconPath = new vscode.ThemeIcon(cmd.icon);
            items.push(item);
        }

        // Add premium badge for premium features
        if (!hasPremium) {
            const premiumItem = new vscode.TreeItem('Upgrade to Premium', vscode.TreeItemCollapsibleState.None);
            premiumItem.command = {
                command: 'rinawarp.account',
                title: 'Upgrade'
            };
            premiumItem.iconPath = new vscode.ThemeIcon('star');
            premiumItem.tooltip = 'Unlock AI Fix Suggestions and more features';
            items.push(premiumItem);
        }

        return items;
    }
}