// Enterprise Features Manager
// Team management, SSO, admin controls, custom branding

export class EnterpriseManager {
  constructor() {
    this.enterpriseFeatures = {
      teamManagement: false,
      ssoIntegration: false,
      adminControls: false,
      customBranding: false,
      apiRateLimiting: false,
      auditLogging: false,
      complianceReporting: false,
    };

    this.teamData = {
      members: [],
      roles: ['admin', 'user', 'viewer'],
      permissions: {
        admin: ['all'],
        user: ['terminal', 'ai', 'themes'],
        viewer: ['terminal'],
      },
    };

    this.ssoProviders = ['saml', 'oauth', 'ldap'];
    this.currentSSO = null;
    this.auditLog = [];
    this.rateLimits = {};

    this.initializeEnterprise();
  }

  initializeEnterprise() {
    // Check if enterprise features are enabled
    this.checkEnterpriseStatus();

    // Initialize team management
    this.initializeTeamManagement();

    // Initialize SSO
    this.initializeSSO();

    // Initialize admin controls
    this.initializeAdminControls();

    // Initialize audit logging
    this.initializeAuditLogging();

    // Initialize rate limiting
    this.initializeRateLimiting();
  }

  checkEnterpriseStatus() {
    // Check if user has enterprise license
    const license = this.getLicenseInfo();
    if (license && license.tier === 'enterprise') {
      this.enableAllEnterpriseFeatures();
    }
  }

  enableAllEnterpriseFeatures() {
    Object.keys(this.enterpriseFeatures).forEach((feature) => {
      this.enterpriseFeatures[feature] = true;
    });
  }

  // Team Management
  initializeTeamManagement() {
    if (!this.enterpriseFeatures.teamManagement) return;

    // Load team data from server
    this.loadTeamData();

    // Set up team event listeners
    this.setupTeamEventListeners();
  }

  loadTeamData() {
    // Load team members from server
    fetch('/api/enterprise/team')
      .then((response) => response.json())
      .then((data) => {
        this.teamData.members = data.members || [];
        this.teamData.roles = data.roles || ['admin', 'user', 'viewer'];
        this.teamData.permissions =
          data.permissions || this.teamData.permissions;
      })
      .catch((error) => {
        console.error('Failed to load team data:', error);
      });
  }

  addTeamMember(email, role = 'user') {
    try {
      if (!this.enterpriseFeatures.teamManagement) {
        throw new Error('Team management not available');
      }

      const member = {
        id: this.generateId(),
        email: email,
        role: role,
        status: 'pending',
        addedAt: Date.now(),
        addedBy: this.getCurrentUser().id,
      };

      this.teamData.members.push(member);

      // Send invitation
      this.sendTeamInvitation(member);

      // Log action
      this.logAuditEvent('team_member_added', { member: member });

      return member;
    } catch (error) {
      console.error('Failed to add team member:', error);
      throw error;
    }
  }

  removeTeamMember(memberId) {
    if (!this.enterpriseFeatures.teamManagement) {
      throw new Error('Team management not available');
    }

    const member = this.teamData.members.find((m) => m.id === memberId);
    if (member) {
      this.teamData.members = this.teamData.members.filter(
        (m) => m.id !== memberId
      );

      // Log action
      this.logAuditEvent('team_member_removed', { member: member });

      return true;
    }
    return false;
  }

  updateTeamMemberRole(memberId, newRole) {
    if (!this.enterpriseFeatures.teamManagement) {
      throw new Error('Team management not available');
    }

    const member = this.teamData.members.find((m) => m.id === memberId);
    if (member) {
      const oldRole = member.role;
      member.role = newRole;

      // Log action
      this.logAuditEvent('team_member_role_updated', {
        member: member,
        oldRole: oldRole,
        newRole: newRole,
      });

      return true;
    }
    return false;
  }

  getTeamMembers() {
    return this.teamData.members;
  }

  getTeamMember(memberId) {
    return this.teamData.members.find((m) => m.id === memberId);
  }

  // SSO Integration
  initializeSSO() {
    if (!this.enterpriseFeatures.ssoIntegration) return;

    // Check for existing SSO configuration
    this.loadSSOConfiguration();
  }

  loadSSOConfiguration() {
    fetch('/api/enterprise/sso')
      .then((response) => response.json())
      .then((data) => {
        this.currentSSO = data;
      })
      .catch((error) => {
        console.error('Failed to load SSO configuration:', error);
      });
  }

  configureSSO(provider, config) {
    if (!this.enterpriseFeatures.ssoIntegration) {
      throw new Error('SSO integration not available');
    }

    if (!this.ssoProviders.includes(provider)) {
      throw new Error('Unsupported SSO provider');
    }

    this.currentSSO = {
      provider: provider,
      config: config,
      enabled: true,
      configuredAt: Date.now(),
    };

    // Save configuration
    this.saveSSOConfiguration();

    // Log action
    this.logAuditEvent('sso_configured', { provider: provider });
  }

  authenticateSSO(provider, token) {
    if (!this.enterpriseFeatures.ssoIntegration) {
      throw new Error('SSO integration not available');
    }

    // Validate SSO token
    return fetch('/api/enterprise/sso/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: provider,
        token: token,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.logAuditEvent('sso_authentication', { provider: provider });
          return data.user;
        } else {
          throw new Error(data.error);
        }
      });
  }

  // Admin Controls
  initializeAdminControls() {
    if (!this.enterpriseFeatures.adminControls) return;

    // Set up admin event listeners
    this.setupAdminEventListeners();
  }

  setupAdminEventListeners() {
    // Listen for admin actions
    document.addEventListener('admin-action', (event) => {
      this.handleAdminAction(event.detail);
    });
  }

  handleAdminAction(action) {
    if (!this.isCurrentUserAdmin()) {
      throw new Error('Admin privileges required');
    }

    switch (action.type) {
    case 'disable_user':
      this.disableUser(action.userId);
      break;
    case 'reset_user_data':
      this.resetUserData(action.userId);
      break;
    case 'export_user_data':
      this.exportUserData(action.userId);
      break;
    case 'update_system_settings':
      this.updateSystemSettings(action.settings);
      break;
    }
  }

  disableUser(userId) {
    // Disable user account
    this.logAuditEvent('user_disabled', { userId: userId });

    // Notify user
    this.notifyUser(
      userId,
      'Your account has been disabled by an administrator.'
    );
  }

  resetUserData(userId) {
    // Reset user data
    this.logAuditEvent('user_data_reset', { userId: userId });

    // Notify user
    this.notifyUser(userId, 'Your data has been reset by an administrator.');
  }

  exportUserData(userId) {
    // Export user data for compliance
    this.logAuditEvent('user_data_exported', { userId: userId });

    // Generate export
    return this.generateUserDataExport(userId);
  }

  updateSystemSettings(settings) {
    // Update system-wide settings
    this.logAuditEvent('system_settings_updated', { settings: settings });

    // Apply settings
    this.applySystemSettings(settings);
  }

  // Custom Branding
  setCustomBranding(branding) {
    if (!this.enterpriseFeatures.customBranding) {
      throw new Error('Custom branding not available');
    }

    // Apply custom branding
    this.applyCustomBranding(branding);

    // Log action
    this.logAuditEvent('custom_branding_applied', { branding: branding });
  }

  applyCustomBranding(branding) {
    // Apply logo
    if (branding.logo) {
      document.querySelector('.logo-icon').textContent = branding.logo;
    }

    // Apply colors
    if (branding.colors) {
      const root = document.documentElement;
      Object.keys(branding.colors).forEach((color) => {
        root.style.setProperty(`--${color}`, branding.colors[color]);
      });
    }

    // Apply custom CSS
    if (branding.customCSS) {
      const style = document.createElement('style');
      style.textContent = branding.customCSS;
      document.head.appendChild(style);
    }
  }

  // Audit Logging
  initializeAuditLogging() {
    if (!this.enterpriseFeatures.auditLogging) return;

    // Load existing audit log
    this.loadAuditLog();

    // Set up audit log rotation
    this.setupAuditLogRotation();
  }

  logAuditEvent(eventType, data) {
    if (!this.enterpriseFeatures.auditLogging) return;

    const event = {
      id: this.generateId(),
      type: eventType,
      data: data,
      timestamp: Date.now(),
      user: this.getCurrentUser().id,
      ip: this.getClientIP(),
      userAgent: navigator.userAgent,
    };

    this.auditLog.push(event);

    // Send to server
    this.sendAuditEvent(event);

    // Rotate log if needed
    if (this.auditLog.length > 10000) {
      this.rotateAuditLog();
    }
  }

  getAuditLog(filters = {}) {
    let filteredLog = this.auditLog;

    if (filters.eventType) {
      filteredLog = filteredLog.filter(
        (event) => event.type === filters.eventType
      );
    }

    if (filters.user) {
      filteredLog = filteredLog.filter((event) => event.user === filters.user);
    }

    if (filters.startDate) {
      filteredLog = filteredLog.filter(
        (event) => event.timestamp >= filters.startDate
      );
    }

    if (filters.endDate) {
      filteredLog = filteredLog.filter(
        (event) => event.timestamp <= filters.endDate
      );
    }

    return filteredLog;
  }

  // Rate Limiting
  initializeRateLimiting() {
    if (!this.enterpriseFeatures.apiRateLimiting) return;

    // Set up rate limiting
    this.setupRateLimiting();
  }

  setupRateLimiting() {
    // Set default rate limits
    this.rateLimits = {
      api: { requests: 1000, window: 3600000 }, // 1000 requests per hour
      ai: { requests: 100, window: 3600000 }, // 100 AI requests per hour
      terminal: { requests: 500, window: 3600000 }, // 500 terminal commands per hour
    };
  }

  checkRateLimit(endpoint, userId) {
    if (!this.enterpriseFeatures.apiRateLimiting) return true;

    const limit = this.rateLimits[endpoint];
    if (!limit) return true;

    const key = `${endpoint}:${userId}`;
    const now = Date.now();

    if (!this.rateLimitCounters) {
      this.rateLimitCounters = {};
    }

    if (!this.rateLimitCounters[key]) {
      this.rateLimitCounters[key] = [];
    }

    // Clean old requests
    this.rateLimitCounters[key] = this.rateLimitCounters[key].filter(
      (timestamp) => now - timestamp < limit.window
    );

    // Check if limit exceeded
    if (this.rateLimitCounters[key].length >= limit.requests) {
      return false;
    }

    // Add current request
    this.rateLimitCounters[key].push(now);
    return true;
  }

  // Utility methods
  getCurrentUser() {
    // Get current user from session
    return {
      id: 'current-user',
      email: 'user@example.com',
      role: 'admin',
    };
  }

  getClientIP() {
    // Get client IP (would be set by server)
    return '127.0.0.1';
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  isCurrentUserAdmin() {
    const user = this.getCurrentUser();
    return user.role === 'admin';
  }

  // Public API
  isEnterpriseFeatureEnabled(feature) {
    return this.enterpriseFeatures[feature] || false;
  }

  getEnterpriseStatus() {
    return {
      features: this.enterpriseFeatures,
      team: {
        memberCount: this.teamData.members.length,
        roles: this.teamData.roles,
      },
      sso: this.currentSSO,
      auditLog: {
        totalEvents: this.auditLog.length,
        recentEvents: this.auditLog.slice(-10),
      },
    };
  }
}

// Global instance
window.enterpriseManager = new EnterpriseManager();
