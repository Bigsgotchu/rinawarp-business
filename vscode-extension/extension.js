const vscode = require("vscode");
const path = require("path");
const cp = require("child_process");
const axios = require("axios");
const fs = require("fs");
const RinaWarpAuth = require("./auth");

/**
 * RinaWarp Terminal Pro VS Code Extension with Paywall System
 * Activates when extension is loaded
 */
function activate(context) {
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
	async function checkAuthentication() {
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
	function getPaywallHtml(webview) {
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
						command: 'signIn',
						plan: plan
					});
				}
				
				function openWebsite() {
					const vscode = acquireVsCodeApi();
					vscode.postMessage({
						command: 'openWebsite'
					});
				}
			</script>
		</body>
		</html>`;
	}

	/**
	 * Generate nonce for CSP
	 */
	function getNonce() {
		return Buffer.from(crypto.randomBytes(32)).toString('base64');
	}

	/**
	 * Helper function to create and show webview
	 */
	function openWebview(title, html, viewColumn = vscode.ViewColumn.One) {
		const panel = vscode.window.createWebviewPanel(
			"rinawarp",
			title,
			viewColumn,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(vscode.workspace.rootPath, 'rinawarp-website')),
					vscode.Uri.file(path.join(vscode.workspace.rootPath, '.kilo'))
				]
			}
		);

		panel.webview.html = getWebviewContent(html, panel.webview);
		return panel;
	}

	/**
	 * Get webview content with proper URI handling
	 */
	function getWebviewContent(html, webview) {
		// Convert relative paths to webview URIs
		return html.replace(
			/(href|src)="([^"]*)"/g,
			(match, attr, src) => {
				if (src.startsWith('http') || src.startsWith('data:')) {
					return match;
				}
				const uri = webview.asWebviewUri(vscode.Uri.file(
					path.join(vscode.workspace.rootPath, src)
				));
				return `${attr}="${uri}"`;
			}
		);
	}

	// ============================================================================
	// 🔐 AUTHENTICATION COMMANDS
	// ============================================================================

	/**
	 * 1. Sign In Command
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand("rinawarp.signIn", async () => {
			await auth.signIn();
		})
	);

	/**
	 * 2. Sign Out Command
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand("rinawarp.signOut", async () => {
			await auth.signOut();
		})
	);

	/**
	 * 3. Show Account Status
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand("rinawarp.account", async () => {
			const user = await auth.getStoredUser();
			if (user) {
				vscode.window.showInformationMessage(
					`Signed in as ${user.email} (${user.plan} plan)`,
					"Manage Account",
					"Sign Out"
				).then(selection => {
					if (selection === "Manage Account") {
						vscode.env.openExternal(vscode.Uri.parse("https://rinawarptech.com/account"));
					} else if (selection === "Sign Out") {
						auth.signOut();
					}
				});
			} else {
				vscode.window.showInformationMessage("Not signed in to RinaWarp Terminal Pro", "Sign In")
					.then(selection => {
						if (selection === "Sign In") {
							auth.signIn();
						}
					});
			}
		})
	);

	// ============================================================================
	// 🚀 MAIN FEATURES (WITH PAYWALL CHECK)
	// ============================================================================

	/**
	 * 4. Open Dev Dashboard (with auth check)
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand("rinawarp.openDashboard", async () => {
			if (!(await checkAuthentication())) return;

			try {
				const dashboardPath = path.join(vscode.workspace.rootPath, 'rinawarp-website/dev-dashboard.html');
				
				if (fs.existsSync(dashboardPath)) {
					const html = fs.readFileSync(dashboardPath, 'utf8');
					openWebview("RinaWarp Dev Dashboard", html);
				} else {
					vscode.window.showWarningMessage("Dev Dashboard not found, opening web version...");
					vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(dashboardUrl));
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Error opening dashboard: ${error.message}`);
			}
		})
	);

	/**
	 * 5. Open Terminal Pro (with auth check)
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand("rinawarp.openTerminal", async () => {
			if (!(await checkAuthentication())) return;

			try {
				vscode.window.showInformationMessage("🚀 Launching RinaWarp Terminal Pro...");
				
				const fullPath = path.join(vscode.workspace.rootPath, terminalProPath);
				if (fs.existsSync(fullPath)) {
					cp.exec(`"${fullPath}"`, (error) => {
						if (error) {
							vscode.window.showErrorMessage(`Failed to launch Terminal Pro: ${error.message}`);
						}
					});
				} else {
					vscode.window.showWarningMessage(`Terminal Pro not found at: ${fullPath}`);
					// Try alternative location
					const altPath = path.join(vscode.workspace.rootPath, 'rinawarp-website/assets/downloads/RinaWarp Terminal Pro-1.0.0.AppImage');
					if (fs.existsSync(altPath)) {
						cp.exec(`"${altPath}"`, (error) => {
							if (error) {
								vscode.window.showErrorMessage(`Failed to launch Terminal Pro: ${error.message}`);
							}
						});
					}
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Error launching Terminal Pro: ${error.message}`);
			}
		})
	);

	/**
	 * 6. AI Fix Suggestions (premium feature)
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand("rinawarp.aiFix", async () => {
			if (!(await checkAuthentication())) return;

			const hasPremium = await auth.hasPremiumAccess();
			if (!hasPremium) {
				vscode.window.showWarningMessage(
					"AI Fix Suggestions is a premium feature. Upgrade to Pioneer or Creator plan.",
					"Upgrade Now"
				).then(selection => {
					if (selection === "Upgrade Now") {
						vscode.env.openExternal(vscode.Uri.parse("https://rinawarptech.com/pricing"));
					}
				});
				return;
			}

			try {
				const panel = openWebview("AI Fix Suggestions", `
					<div style="padding: 20px; font-family: 'Courier New', monospace;">
						<h2>🤖 Kilo AI Analysis (Premium)</h2>
						<div id="ai-content">Loading AI insights...</div>
						<button onclick="runKiloFix()" style="margin: 10px 0; padding: 10px; background: #ff0080; color: white; border: none; border-radius: 5px; cursor: pointer;">Run Kilo Fix Pack</button>
					</div>
				`);

				// Load AI suggestions (authenticated)
				try {
					const response = await auth.makeAuthenticatedRequest(`${backendUrl}/api/ai/suggestions`);
					panel.webview.postMessage({
						type: 'aiSuggestions',
						data: response.data
					});
				} catch (error) {
					// Fallback to local analysis
					const fallbackSuggestions = `
						<div style="background: #1a1f2e; padding: 15px; border-radius: 8px; margin: 10px 0;">
							<h3>🔍 Local System Analysis (Premium)</h3>
							<p>• Run: <code>node .kilo/kilo-fix-pack.js</code> to scan for issues</p>
							<p>• Check: <code>pm2 logs</code> for application errors</p>
							<p>• Verify: All build outputs are present in build-output/</p>
						</div>
					`;
					panel.webview.postMessage({
						type: 'aiSuggestions',
						data: { html: fallbackSuggestions }
					});
				}

				// Handle messages from webview
				panel.webview.onDidReceiveMessage(
					message => {
						if (message.command === 'runKiloFix') {
							vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { text: 'node .kilo/kilo-fix-pack.js\r' });
						}
					},
					undefined,
					context.subscriptions
				);

			} catch (error) {
				vscode.window.showErrorMessage(`AI Fix failed: ${error.message}`);
			}
		})
	);

	/**
	 * 7. One-click Deploy (with auth check)
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand("rinawarp.runDeploy", async () => {
			if (!(await checkAuthentication())) return;

			const choice = await vscode.window.showQuickPick(
				['Deploy Backend', 'Deploy Frontend', 'Deploy Full Stack', 'Cancel'],
				{ placeHolder: 'Choose deployment type' }
			);

			if (choice === 'Cancel') return;

			try {
				vscode.window.showInformationMessage(`🚀 Starting ${choice} deployment...`);
				
				let command;
				switch (choice) {
					case 'Deploy Backend':
						command = 'bash scripts/build-backend.sh && bash scripts/rinawarp-one-click-deploy.sh';
						break;
					case 'Deploy Frontend':
						command = 'bash scripts/build-frontend.sh && cd rinawarp-website && bash deploy.sh';
						break;
					case 'Deploy Full Stack':
						command = 'bash scripts/rinawarp-one-click-deploy.sh';
						break;
				}

				const terminal = vscode.window.createTerminal('RinaWarp Deploy');
				terminal.show();
				terminal.sendText(command);

			} catch (error) {
				vscode.window.showErrorMessage(`Deploy failed: ${error.message}`);
			}
		})
	);

	/**
	 * 8. Plugin Sync
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand("rinawarp.syncPlugins", async () => {
			if (!(await checkAuthentication())) return;

			try {
				vscode.window.showInformationMessage("🔄 Syncing plugins...");

				// Check if git-helper plugin exists
				const pluginPath = path.join(vscode.workspace.rootPath, 'plugins/git-helper.json');
				if (fs.existsSync(pluginPath)) {
					const pluginData = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
					vscode.window.showInformationMessage(`✅ Synced ${pluginData.plugins?.length || 0} plugins`);
				} else {
					vscode.window.showWarningMessage("No plugins found to sync");
				}

				// Open plugins folder
				vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(path.join(vscode.workspace.rootPath, 'plugins')));

			} catch (error) {
				vscode.window.showErrorMessage(`Plugin sync failed: ${error.message}`);
			}
		})
	);

	// ============================================================================
	// 🔗 URI HANDLER FOR OAUTH CALLBACK
	// ============================================================================

	// Register URI handler for OAuth callback
	context.subscriptions.push(
		vscode.window.registerUriHandler({
			handleUri: async (uri) => {
				if (uri.scheme === 'vscode' && uri.authority === 'rinawarp.rinawarp-terminal-pro') {
					await auth.handleAuthCallback(uri);
				}
			}
		})
	);

	/**
	 * Create RinaWarp sidebar view with authentication status
	 */
	const rinawarpViewProvider = new RinaWarpViewProvider(context, auth);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"rinawarpView",
			rinawarpViewProvider,
			{
				webviewOptions: { retainContextWhenHidden: true }
			}
		)
	);

	/**
	 * Status bar integration with auth status
	 */
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'rinawarp.account';
	updateStatusBar(statusBarItem, auth);
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Update status bar periodically
	const statusInterval = setInterval(() => {
		updateStatusBar(statusBarItem, auth);
	}, 30000); // Update every 30 seconds

	context.subscriptions.push({
		dispose: () => clearInterval(statusInterval)
	});

	/**
	 * Update status bar with current auth status
	 */
	async function updateStatusBar(statusBarItem, auth) {
		const isAuth = await auth.isAuthenticated();
		if (isAuth) {
			const user = await auth.getStoredUser();
			const plan = user?.plan || 'community';
			const planIcon = plan === 'community' ? '🆓' : '💎';
			statusBarItem.text = `${planIcon} RinaWarp (${plan})`;
			statusBarItem.tooltip = `Click to view account: ${user?.email}`;
		} else {
			statusBarItem.text = '🔒 RinaWarp (Sign In)';
			statusBarItem.tooltip = 'Click to sign in to RinaWarp Terminal Pro';
		}
	}

	// Initial authentication check
	checkAuthentication();
}

/**
 * RinaWarp View Provider for sidebar with authentication integration
 */
class RinaWarpViewProvider {
	constructor(context, auth) {
		this.context = context;
		this.auth = auth;
		this._view = null;
	}

	resolveWebviewView(webviewView, context, token) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(vscode.workspace.rootPath, 'rinawarp-website')),
				vscode.Uri.file(path.join(vscode.workspace.rootPath, '.kilo'))
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// Handle messages
		webviewView.webview.onDidReceiveMessage(
			message => {
				switch (message.type) {
					case 'runCommand':
						vscode.commands.executeCommand(message.command);
						break;
					case 'showInfo':
						vscode.window.showInformationMessage(message.text);
						break;
					case 'checkAuth':
						this.updateAuthStatus();
						break;
				}
			},
			undefined,
			this.context.subscriptions
		);

		// Initial auth status update
		this.updateAuthStatus();
	}

	async updateAuthStatus() {
		const isAuth = await this.auth.isAuthenticated();
		const user = await this.auth.getStoredUser();
		
		this._view.webview.postMessage({
			type: 'authStatus',
			data: {
				isAuthenticated: isAuth,
				user: user
			}
		});
	}

	_getHtmlForWebview(webview) {
		return `<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<style>
				body { 
					padding: 10px; 
					font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
					background: var(--vscode-editor-background);
					color: var(--vscode-editor-foreground);
				}
				.btn {
					background: var(--vscode-button-background);
					color: var(--vscode-button-foreground);
					border: none;
					padding: 8px 12px;
					margin: 4px 0;
					cursor: pointer;
					border-radius: 4px;
					width: 100%;
					text-align: left;
					transition: background 0.2s;
				}
				.btn:hover {
					background: var(--vscode-button-hoverBackground);
				}
				.btn:disabled {
					opacity: 0.6;
					cursor: not-allowed;
				}
				.status {
					padding: 8px;
					border-radius: 4px;
					margin: 4px 0;
					font-size: 12px;
				}
				.status.authenticated {
					background: var(--vscode-statusBarItem-background);
					color: var(--vscode-statusBarItem-foreground);
				}
				.status.not-authenticated {
					background: var(--vscode-statusBarItem-warningBackground);
					color: var(--vscode-statusBarItem-warningForeground);
				}
				.premium-badge {
					background: linear-gradient(45deg, #ff0080, #00f7c3);
					color: white;
					padding: 2px 6px;
					border-radius: 10px;
					font-size: 10px;
					margin-left: 5px;
				}
				h3 { 
					margin: 10px 0; 
					color: var(--vscode-editor-foreground);
					font-size: 14px;
				}
				.user-info {
					background: var(--vscode-editor-background);
					padding: 8px;
					border-radius: 4px;
					margin: 8px 0;
					font-size: 12px;
				}
			</style>
		</head>
		<body>
			<h3>🚀 RinaWarp Terminal Pro</h3>
			
			<div id="authStatus" class="status not-authenticated">
				🔒 Not signed in
			</div>
			
			<div id="userInfo" class="user-info" style="display: none;">
				<div id="userEmail"></div>
				<div id="userPlan"></div>
			</div>
			
			<button class="btn" onclick="runCommand('rinawarp.account')">
				👤 Account Management
			</button>
			
			<button class="btn" onclick="runCommand('rinawarp.openDashboard')">
				📊 Open Dev Dashboard
			</button>
			
			<button class="btn" onclick="runCommand('rinawarp.openTerminal')">
				🖥️ Launch Terminal Pro
			</button>
			
			<button class="btn" onclick="runCommand('rinawarp.runDeploy')">
				🚀 Run Deploy
			</button>
			
			<button class="btn" onclick="runCommand('rinawarp.aiFix')">
				🤖 AI Fix Suggestions <span class="premium-badge">PREMIUM</span>
			</button>
			
			<button class="btn" onclick="runCommand('rinawarp.syncPlugins')">
				🔄 Sync Plugins
			</button>

			<script>
				const vscode = acquireVsCodeApi();
				
				function runCommand(command) {
					vscode.postMessage({
						type: 'runCommand',
						command: command
					});
				}

				// Listen for auth status updates
				window.addEventListener('message', event => {
					if (event.data.type === 'authStatus') {
						const { isAuthenticated, user } = event.data.data;
						const statusEl = document.getElementById('authStatus');
						const userInfoEl = document.getElementById('userInfo');
						
						if (isAuthenticated && user) {
							statusEl.className = 'status authenticated';
							statusEl.innerHTML = '✅ Signed in as ' + user.email;
							userInfoEl.style.display = 'block';
							document.getElementById('userEmail').innerHTML = '📧 ' + user.email;
							document.getElementById('userPlan').innerHTML = '💎 Plan: ' + user.plan;
						} else {
							statusEl.className = 'status not-authenticated';
							statusEl.innerHTML = '🔒 Not signed in';
							userInfoEl.style.display = 'none';
						}
					}
				});

				// Request initial auth status
				vscode.postMessage({
					type: 'checkAuth'
				});
			</script>
		</body>
		</html>`;
	}
}

module.exports = {
	activate
};