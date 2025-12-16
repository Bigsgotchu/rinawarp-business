// Integration Partnerships Manager
// VS Code, GitHub, Slack, Docker, Cloud platforms

export class IntegrationManager {
  constructor() {
    this.integrations = {
      vscode: { enabled: false, config: null },
      github: { enabled: false, config: null },
      slack: { enabled: false, config: null },
      docker: { enabled: false, config: null },
      aws: { enabled: false, config: null },
      azure: { enabled: false, config: null },
      gcp: { enabled: false, config: null },
    };

    this.availableIntegrations = [
      {
        id: 'vscode',
        name: 'VS Code Extension',
        description: 'Integrate with VS Code for seamless development',
        icon: '🔧',
        category: 'ide',
        features: [
          'syntax_highlighting',
          'intellisense',
          'debugging',
          'extensions',
        ],
      },
      {
        id: 'github',
        name: 'GitHub Integration',
        description: 'Connect with GitHub for repository management',
        icon: '🐙',
        category: 'version_control',
        features: ['repos', 'issues', 'pull_requests', 'actions', 'codespaces'],
      },
      {
        id: 'slack',
        name: 'Slack Workspace',
        description: 'Share terminal sessions and collaborate in Slack',
        icon: '💬',
        category: 'communication',
        features: ['notifications', 'sharing', 'collaboration', 'bots'],
      },
      {
        id: 'docker',
        name: 'Docker Integration',
        description: 'Manage containers and images directly from terminal',
        icon: '🐳',
        category: 'containerization',
        features: ['containers', 'images', 'compose', 'registry'],
      },
      {
        id: 'aws',
        name: 'AWS CLI Integration',
        description: 'Manage AWS resources with enhanced CLI tools',
        icon: '☁️',
        category: 'cloud',
        features: ['ec2', 's3', 'lambda', 'cloudformation', 'iam'],
      },
      {
        id: 'azure',
        name: 'Azure CLI Integration',
        description: 'Manage Azure resources with enhanced CLI tools',
        icon: '🔵',
        category: 'cloud',
        features: ['vm', 'storage', 'functions', 'arm', 'ad'],
      },
      {
        id: 'gcp',
        name: 'Google Cloud Integration',
        description: 'Manage GCP resources with enhanced CLI tools',
        icon: '🌐',
        category: 'cloud',
        features: ['compute', 'storage', 'functions', 'deployment', 'iam'],
      },
    ];

    this.initializeIntegrations();
  }

  initializeIntegrations() {
    // Load integration configurations
    this.loadIntegrationConfigs();

    // Set up event listeners
    this.setupEventListeners();

    // Initialize enabled integrations
    this.initializeEnabledIntegrations();
  }

  loadIntegrationConfigs() {
    // Load from localStorage or server
    const savedConfigs = localStorage.getItem('rinawarp_integrations');
    if (savedConfigs) {
      try {
        const configs = JSON.parse(savedConfigs);
        Object.keys(configs).forEach((integrationId) => {
          if (this.integrations[integrationId]) {
            this.integrations[integrationId] = configs[integrationId];
          }
        });
      } catch (error) {
        console.error('Failed to load integration configs:', error);
      }
    }
  }

  saveIntegrationConfigs() {
    localStorage.setItem(
      'rinawarp_integrations',
      JSON.stringify(this.integrations)
    );
  }

  setupEventListeners() {
    // Listen for integration events
    document.addEventListener('integration-request', (event) => {
      this.handleIntegrationRequest(event.detail);
    });
  }

  // VS Code Integration
  async initializeVSCodeIntegration() {
    if (!this.integrations.vscode.enabled) return;

    try {
      // Check if VS Code is available
      const vscode = await this.detectVSCode();
      if (vscode) {
        this.integrations.vscode.config = {
          available: true,
          version: vscode.version,
          extensions: vscode.extensions,
        };

        // Set up VS Code communication
        this.setupVSCodeCommunication();

        console.log('VS Code integration initialized');
      }
    } catch (error) {
      console.error('VS Code integration failed:', error);
    }
  }

  async detectVSCode() {
    // Check if VS Code is running and accessible
    try {
      const response = await fetch('https://rinawarptech.com/vscode/status');
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  setupVSCodeCommunication() {
    // Set up communication with VS Code extension
    window.addEventListener('message', (event) => {
      if (event.data.source === 'vscode') {
        this.handleVSCodeMessage(event.data);
      }
    });
  }

  handleVSCodeMessage(message) {
    switch (message.type) {
      case 'file_opened':
        this.handleFileOpened(message.data);
        break;
      case 'debug_started':
        this.handleDebugStarted(message.data);
        break;
      case 'extension_installed':
        this.handleExtensionInstalled(message.data);
        break;
    }
  }

  // GitHub Integration
  async initializeGitHubIntegration() {
    if (!this.integrations.github.enabled) return;

    try {
      // Check GitHub authentication
      const auth = await this.checkGitHubAuth();
      if (auth.authenticated) {
        this.integrations.github.config = {
          authenticated: true,
          user: auth.user,
          token: auth.token,
        };

        // Load user repositories
        await this.loadGitHubRepositories();

        console.log('GitHub integration initialized');
      }
    } catch (error) {
      console.error('GitHub integration failed:', error);
    }
  }

  async checkGitHubAuth() {
    const token = localStorage.getItem('github_token');
    if (!token) return { authenticated: false };

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        return { authenticated: true, user: user, token: token };
      }
    } catch (error) {
      console.error('GitHub auth check failed:', error);
    }

    return { authenticated: false };
  }

  async loadGitHubRepositories() {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `token ${this.integrations.github.config.token}`,
        },
      });

      if (response.ok) {
        const repos = await response.json();
        this.integrations.github.config.repositories = repos;
      }
    } catch (error) {
      console.error('Failed to load GitHub repositories:', error);
    }
  }

  // Slack Integration
  async initializeSlackIntegration() {
    if (!this.integrations.slack.enabled) return;

    try {
      // Check Slack authentication
      const auth = await this.checkSlackAuth();
      if (auth.authenticated) {
        this.integrations.slack.config = {
          authenticated: true,
          team: auth.team,
          channels: auth.channels,
          token: auth.token,
        };

        console.log('Slack integration initialized');
      }
    } catch (error) {
      console.error('Slack integration failed:', error);
    }
  }

  async checkSlackAuth() {
    const token = localStorage.getItem('slack_token');
    if (!token) return { authenticated: false };

    try {
      const response = await fetch('/api/integrations/slack/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
      });

      if (response.ok) {
        const data = await response.json();
        return { authenticated: true, ...data };
      }
    } catch (error) {
      console.error('Slack auth check failed:', error);
    }

    return { authenticated: false };
  }

  // Docker Integration
  async initializeDockerIntegration() {
    if (!this.integrations.docker.enabled) return;

    try {
      // Check Docker daemon
      const docker = await this.checkDockerDaemon();
      if (docker.available) {
        this.integrations.docker.config = {
          available: true,
          version: docker.version,
          containers: docker.containers,
          images: docker.images,
        };

        console.log('Docker integration initialized');
      }
    } catch (error) {
      console.error('Docker integration failed:', error);
    }
  }

  async checkDockerDaemon() {
    try {
      const response = await fetch('/api/integrations/docker/status');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Docker daemon check failed:', error);
    }

    return { available: false };
  }

  // Cloud Platform Integrations
  async initializeCloudIntegrations() {
    const cloudPlatforms = ['aws', 'azure', 'gcp'];

    for (const platform of cloudPlatforms) {
      if (this.integrations[platform].enabled) {
        await this.initializeCloudIntegration(platform);
      }
    }
  }

  async initializeCloudIntegration(platform) {
    try {
      const auth = await this.checkCloudAuth(platform);
      if (auth.authenticated) {
        this.integrations[platform].config = {
          authenticated: true,
          credentials: auth.credentials,
          regions: auth.regions,
          resources: auth.resources,
        };

        console.log(`${platform.toUpperCase()} integration initialized`);
      }
    } catch (error) {
      console.error(`${platform} integration failed:`, error);
    }
  }

  async checkCloudAuth(platform) {
    const token = localStorage.getItem(`${platform}_token`);
    if (!token) return { authenticated: false };

    try {
      const response = await fetch(`/api/integrations/${platform}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error(`${platform} auth check failed:`, error);
    }

    return { authenticated: false };
  }

  // Integration Management
  async enableIntegration(integrationId, config = {}) {
    if (!this.availableIntegrations.find((i) => i.id === integrationId)) {
      throw new Error('Unknown integration');
    }

    this.integrations[integrationId].enabled = true;
    this.integrations[integrationId].config = config;

    // Initialize the integration
    await this.initializeIntegration(integrationId);

    // Save configuration
    this.saveIntegrationConfigs();

    // Track usage
    this.trackIntegrationUsage(integrationId, 'enabled');
  }

  async disableIntegration(integrationId) {
    if (!this.integrations[integrationId]) {
      throw new Error('Integration not found');
    }

    this.integrations[integrationId].enabled = false;
    this.integrations[integrationId].config = null;

    // Save configuration
    this.saveIntegrationConfigs();

    // Track usage
    this.trackIntegrationUsage(integrationId, 'disabled');
  }

  async initializeIntegration(integrationId) {
    switch (integrationId) {
      case 'vscode':
        await this.initializeVSCodeIntegration();
        break;
      case 'github':
        await this.initializeGitHubIntegration();
        break;
      case 'slack':
        await this.initializeSlackIntegration();
        break;
      case 'docker':
        await this.initializeDockerIntegration();
        break;
      case 'aws':
      case 'azure':
      case 'gcp':
        await this.initializeCloudIntegration(integrationId);
        break;
    }
  }

  async initializeEnabledIntegrations() {
    for (const integrationId of Object.keys(this.integrations)) {
      if (this.integrations[integrationId].enabled) {
        await this.initializeIntegration(integrationId);
      }
    }
  }

  // Integration Actions
  async executeIntegrationAction(integrationId, action, data = {}) {
    if (!this.integrations[integrationId].enabled) {
      throw new Error('Integration not enabled');
    }

    try {
      const response = await fetch(
        `/api/integrations/${integrationId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();

        // Track usage
        this.trackIntegrationUsage(integrationId, action, data);

        return result;
      } else {
        throw new Error(`Integration action failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Integration action failed:', error);
      throw error;
    }
  }

  // Utility Methods
  trackIntegrationUsage(integrationId, action, data = {}) {
    // Send to analytics
    if (window.analytics) {
      window.analytics.track('integration_usage', {
        integration: integrationId,
        action: action,
        ...data,
      });
    }
  }

  getAvailableIntegrations() {
    return this.availableIntegrations;
  }

  getEnabledIntegrations() {
    return Object.keys(this.integrations).filter(
      (id) => this.integrations[id].enabled
    );
  }

  getIntegrationStatus(integrationId) {
    return this.integrations[integrationId] || null;
  }

  getAllIntegrationStatus() {
    return this.integrations;
  }

  // Public API
  async connectIntegration(integrationId, credentials) {
    try {
      await this.enableIntegration(integrationId, credentials);
      return { success: true, message: 'Integration connected successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async disconnectIntegration(integrationId) {
    try {
      await this.disableIntegration(integrationId);
      return {
        success: true,
        message: 'Integration disconnected successfully',
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Global instance
window.integrationManager = new IntegrationManager();
