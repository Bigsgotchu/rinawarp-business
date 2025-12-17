// Enhanced Documentation System
// Interactive docs, video tutorials, API documentation

export class DocumentationSystem {
  constructor() {
    this.docs = {
      gettingStarted: {
        title: 'Getting Started',
        sections: [
          {
            id: 'installation',
            title: 'Installation',
            content: this.getInstallationContent(),
            video: '/videos/installation.mp4',
          },
          {
            id: 'first-steps',
            title: 'First Steps',
            content: this.getFirstStepsContent(),
            video: '/videos/first-steps.mp4',
          },
          {
            id: 'basic-commands',
            title: 'Basic Commands',
            content: this.getBasicCommandsContent(),
            interactive: true,
          },
        ],
      },
      features: {
        title: 'Features',
        sections: [
          {
            id: 'ai-assistant',
            title: 'AI Assistant',
            content: this.getAIAssistantContent(),
            video: '/videos/ai-assistant.mp4',
          },
          {
            id: 'terminal-features',
            title: 'Terminal Features',
            content: this.getTerminalFeaturesContent(),
            interactive: true,
          },
          {
            id: 'themes',
            title: 'Themes & Customization',
            content: this.getThemesContent(),
            interactive: true,
          },
        ],
      },
      api: {
        title: 'API Documentation',
        sections: [
          {
            id: 'rest-api',
            title: 'REST API',
            content: this.getRESTAPIContent(),
            interactive: true,
          },
          {
            id: 'websocket-api',
            title: 'WebSocket API',
            content: this.getWebSocketAPIContent(),
            interactive: true,
          },
          {
            id: 'sdk',
            title: 'SDK & Libraries',
            content: this.getSDKContent(),
          },
        ],
      },
      enterprise: {
        title: 'Enterprise',
        sections: [
          {
            id: 'team-management',
            title: 'Team Management',
            content: this.getTeamManagementContent(),
            video: '/videos/team-management.mp4',
          },
          {
            id: 'sso-integration',
            title: 'SSO Integration',
            content: this.getSSOIntegrationContent(),
            video: '/videos/sso-integration.mp4',
          },
          {
            id: 'admin-controls',
            title: 'Admin Controls',
            content: this.getAdminControlsContent(),
          },
        ],
      },
    };

    this.currentSection = null;
    this.searchIndex = this.buildSearchIndex();
    this.interactiveElements = new Map();

    this.initializeDocumentation();
  }

  initializeDocumentation() {
    // Set up search functionality
    this.setupSearch();

    // Set up interactive elements
    this.setupInteractiveElements();

    // Set up video player
    this.setupVideoPlayer();

    // Set up code examples
    this.setupCodeExamples();
  }

  // Content Generation
  getInstallationContent() {
    return `
      <h2>Installation Guide</h2>
      <p>Get RinaWarp Terminal Pro up and running in minutes!</p>
      
      <h3>System Requirements</h3>
      <ul>
        <li>macOS 10.15+ or Windows 10+ or Linux</li>
        <li>4GB RAM minimum (8GB recommended)</li>
        <li>100MB free disk space</li>
        <li>Internet connection for AI features</li>
      </ul>
      
      <h3>Quick Install</h3>
      <div class="code-block">
        <pre><code># Download and install
curl -sSL https://install.rinawarptech.com | bash

# Or download from our website
# Visit https://rinawarptech.com/download</code></pre>
      </div>
      
      <h3>Verification</h3>
      <p>After installation, verify everything works:</p>
      <div class="code-block">
        <pre><code># Check installation
rinawarp --version

# Test AI features
rinawarp "Hello Rina!"</code></pre>
      </div>
    `;
  }

  getFirstStepsContent() {
    return `
      <h2>First Steps</h2>
      <p>Welcome to RinaWarp Terminal Pro! Let's get you started.</p>
      
      <h3>1. Launch the Terminal</h3>
      <p>Open RinaWarp Terminal Pro from your applications or run <code>rinawarp</code> in your terminal.</p>
      
      <h3>2. Meet Rina</h3>
      <p>Rina is your AI assistant. Try asking her something:</p>
      <div class="interactive-demo">
        <input type="text" placeholder="Ask Rina anything..." class="demo-input">
        <button class="demo-button" onclick="this.runDemo()">Ask Rina</button>
      </div>
      
      <h3>3. Explore Features</h3>
      <p>Use the command palette (Cmd+K) to discover features:</p>
      <ul>
        <li><strong>AI Chat:</strong> Ask questions and get help</li>
        <li><strong>Themes:</strong> Customize your terminal appearance</li>
        <li><strong>Monitoring:</strong> Track system performance</li>
        <li><strong>Workflows:</strong> Automate repetitive tasks</li>
      </ul>
    `;
  }

  getBasicCommandsContent() {
    return `
      <h2>Basic Commands</h2>
      <p>Essential commands to get you started with RinaWarp Terminal Pro.</p>
      
      <h3>AI Commands</h3>
      <div class="command-list">
        <div class="command-item">
          <code>!help</code>
          <span>Show all available commands</span>
        </div>
        <div class="command-item">
          <code>!ai "your question"</code>
          <span>Ask Rina a question</span>
        </div>
        <div class="command-item">
          <code>!voice on/off</code>
          <span>Toggle voice responses</span>
        </div>
      </div>
      
      <h3>Terminal Commands</h3>
      <div class="command-list">
        <div class="command-item">
          <code>!theme [name]</code>
          <span>Change terminal theme</span>
        </div>
        <div class="command-item">
          <code>!monitor</code>
          <span>Show system monitoring</span>
        </div>
        <div class="command-item">
          <code>!workflow [name]</code>
          <span>Run a workflow</span>
        </div>
      </div>
      
      <h3>Interactive Demo</h3>
      <p>Try these commands in the terminal below:</p>
      <div class="interactive-terminal">
        <div class="terminal-output" id="demo-output"></div>
        <div class="terminal-input">
          <input type="text" id="demo-command" placeholder="Type a command...">
          <button onclick="this.executeDemoCommand()">Execute</button>
        </div>
      </div>
    `;
  }

  getAIAssistantContent() {
    return `
      <h2>AI Assistant Features</h2>
      <p>Rina is your intelligent terminal assistant with advanced capabilities.</p>
      
      <h3>Natural Language Processing</h3>
      <p>Ask Rina questions in natural language:</p>
      <div class="example-box">
        <p><strong>Example:</strong> "How do I check disk usage?"</p>
        <p><strong>Rina:</strong> "You can use the <code>df -h</code> command to check disk usage. Would you like me to run it for you?"</p>
      </div>
      
      <h3>Code Generation</h3>
      <p>Rina can generate code snippets and scripts:</p>
      <div class="example-box">
        <p><strong>Example:</strong> "Create a Python script to list files"</p>
        <p><strong>Rina:</strong> <code>import os<br>for file in os.listdir('.'):<br>&nbsp;&nbsp;print(file)</code></p>
      </div>
      
      <h3>Context Awareness</h3>
      <p>Rina remembers your previous commands and context:</p>
      <ul>
        <li>Remembers your project structure</li>
        <li>Learns your preferences</li>
        <li>Provides personalized suggestions</li>
      </ul>
    `;
  }

  getTerminalFeaturesContent() {
    return `
      <h2>Terminal Features</h2>
      <p>Advanced terminal capabilities that rival the best terminal applications.</p>
      
      <h3>Command Blocks</h3>
      <p>Organize your commands with Warp-style blocks:</p>
      <div class="feature-demo">
        <div class="command-block">
          <div class="block-header">git status</div>
          <div class="block-output">On branch main<br>Your branch is up to date</div>
        </div>
      </div>
      
      <h3>Split Panes</h3>
      <p>Work with multiple terminal sessions side by side:</p>
      <div class="feature-demo">
        <div class="split-panes">
          <div class="pane">Terminal 1</div>
          <div class="pane">Terminal 2</div>
        </div>
      </div>
      
      <h3>Workflows</h3>
      <p>Automate repetitive tasks with custom workflows:</p>
      <div class="code-block">
        <pre><code># Create a workflow
rinawarp workflow create "deploy"
rinawarp workflow add "git pull"
rinawarp workflow add "npm install"
rinawarp workflow add "npm run build"
rinawarp workflow add "pm2 restart app"

# Run the workflow
rinawarp workflow run "deploy"</code></pre>
      </div>
    `;
  }

  getThemesContent() {
    return `
      <h2>Themes & Customization</h2>
      <p>Personalize your terminal with beautiful themes and customizations.</p>
      
      <h3>Built-in Themes</h3>
      <div class="theme-gallery">
        <div class="theme-preview" data-theme="mermaid-enhanced">
          <div class="theme-preview-header">Mermaid Enhanced</div>
          <div class="theme-preview-content">Beautiful ocean-inspired theme</div>
        </div>
        <div class="theme-preview" data-theme="dark-pro">
          <div class="theme-preview-header">Dark Pro</div>
          <div class="theme-preview-content">Professional dark theme</div>
        </div>
        <div class="theme-preview" data-theme="light-modern">
          <div class="theme-preview-header">Light Modern</div>
          <div class="theme-preview-content">Clean light theme</div>
        </div>
      </div>
      
      <h3>Custom Themes</h3>
      <p>Create your own themes with CSS:</p>
      <div class="code-block">
        <pre><code>/* Custom theme example */
:root {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --accent-color: #00ff88;
  --border-color: #333333;
}</code></pre>
      </div>
    `;
  }

  getRESTAPIContent() {
    return `
      <h2>REST API Documentation</h2>
      <p>Integrate RinaWarp Terminal Pro with your applications using our REST API.</p>
      
      <h3>Base URL</h3>
      <code>https://api.rinawarptech.com/v1</code>
      
      <h3>Authentication</h3>
      <p>All API requests require authentication using your API key:</p>
      <div class="code-block">
        <pre><code>curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.rinawarptech.com/v1/terminal/status</code></pre>
      </div>
      
      <h3>Endpoints</h3>
      <div class="api-endpoint">
        <h4>POST /terminal/execute</h4>
        <p>Execute a command in the terminal</p>
        <div class="code-block">
          <pre><code>{
  "command": "ls -la",
  "options": {
    "timeout": 5000,
    "cwd": "/home/user"
  }
}</code></pre>
        </div>
      </div>
      
      <div class="api-endpoint">
        <h4>GET /ai/chat</h4>
        <p>Send a message to the AI assistant</p>
        <div class="code-block">
          <pre><code>{
  "message": "Hello Rina!",
  "context": "terminal_session"
}</code></pre>
        </div>
      </div>
    `;
  }

  getWebSocketAPIContent() {
    return `
      <h2>WebSocket API Documentation</h2>
      <p>Real-time communication with the terminal using WebSocket connections.</p>
      
      <h3>Connection</h3>
      <div class="code-block">
        <pre><code>const ws = new WebSocket('wss://api.rinawarptech.com/ws');
ws.onopen = () => {
  console.log('Connected to RinaWarp Terminal Pro');
};</code></pre>
      </div>
      
      <h3>Message Types</h3>
      <div class="message-type">
        <h4>Command Execution</h4>
        <div class="code-block">
          <pre><code>{
  "type": "execute",
  "command": "ls -la",
  "id": "unique-request-id"
}</code></pre>
        </div>
      </div>
      
      <div class="message-type">
        <h4>AI Chat</h4>
        <div class="code-block">
          <pre><code>{
  "type": "ai_chat",
  "message": "Hello Rina!",
  "id": "unique-request-id"
}</code></pre>
        </div>
      </div>
    `;
  }

  getSDKContent() {
    return `
      <h2>SDK & Libraries</h2>
      <p>Official SDKs and libraries for popular programming languages.</p>
      
      <h3>JavaScript/Node.js</h3>
      <div class="code-block">
        <pre><code>npm install rinawarp-terminal-sdk

const RinaWarp = require('rinawarp-terminal-sdk');
const terminal = new RinaWarp({
  apiKey: 'your-api-key'
});

// Execute command
const result = await terminal.execute('ls -la');
console.log(result.output);</code></pre>
      </div>
      
      <h3>Python</h3>
      <div class="code-block">
        <pre><code>pip install rinawarp-terminal

from rinawarp import Terminal

terminal = Terminal(api_key='your-api-key')
result = terminal.execute('ls -la')
print(result.output)</code></pre>
      </div>
      
      <h3>Go</h3>
      <div class="code-block">
        <pre><code>go get github.com/rinawarptech/terminal-sdk

import "github.com/rinawarptech/terminal-sdk"

terminal := terminal.New("your-api-key")
result, err := terminal.Execute("ls -la")
if err != nil {
    log.Fatal(err)
}
fmt.Println(result.Output)</code></pre>
      </div>
    `;
  }

  getTeamManagementContent() {
    return `
      <h2>Team Management</h2>
      <p>Manage your team's access and permissions with enterprise features.</p>
      
      <h3>Adding Team Members</h3>
      <p>Invite team members to your organization:</p>
      <div class="code-block">
        <pre><code># Add team member
rinawarp team add user@example.com --role=user

# Set permissions
rinawarp team permissions user@example.com --allow=terminal,ai --deny=admin</code></pre>
      </div>
      
      <h3>Role Management</h3>
      <ul>
        <li><strong>Admin:</strong> Full access to all features</li>
        <li><strong>User:</strong> Standard terminal and AI features</li>
        <li><strong>Viewer:</strong> Read-only access</li>
      </ul>
      
      <h3>Usage Monitoring</h3>
      <p>Track team usage and resource consumption:</p>
      <div class="code-block">
        <pre><code># View team usage
rinawarp team usage --period=month

# Export usage report
rinawarp team export --format=csv --period=quarter</code></pre>
      </div>
    `;
  }

  getSSOIntegrationContent() {
    return `
      <h2>SSO Integration</h2>
      <p>Integrate with your organization's Single Sign-On system.</p>
      
      <h3>Supported Providers</h3>
      <ul>
        <li>SAML 2.0</li>
        <li>OAuth 2.0</li>
        <li>OpenID Connect</li>
        <li>LDAP</li>
      </ul>
      
      <h3>SAML Configuration</h3>
      <div class="code-block">
        <pre><code># Configure SAML
rinawarp sso configure saml \\
  --entity-id="https://your-idp.com/saml" \\
  --sso-url="https://your-idp.com/sso" \\
  --certificate="path/to/certificate.pem"</code></pre>
      </div>
      
      <h3>OAuth Configuration</h3>
      <div class="code-block">
        <pre><code># Configure OAuth
rinawarp sso configure oauth \\
  --client-id="your-client-id" \\
  --client-secret="your-client-secret" \\
  --authorization-url="https://oauth.provider.com/auth" \\
  --token-url="https://oauth.provider.com/token"</code></pre>
      </div>
    `;
  }

  getAdminControlsContent() {
    return `
      <h2>Admin Controls</h2>
      <p>Comprehensive administrative controls for enterprise deployments.</p>
      
      <h3>User Management</h3>
      <div class="code-block">
        <pre><code># List all users
rinawarp admin users list

# Disable user
rinawarp admin users disable user@example.com

# Reset user data
rinawarp admin users reset user@example.com</code></pre>
      </div>
      
      <h3>System Settings</h3>
      <div class="code-block">
        <pre><code># Update system settings
rinawarp admin settings update \\
  --max-users=1000 \\
  --session-timeout=3600 \\
  --rate-limit=1000</code></pre>
      </div>
      
      <h3>Audit Logs</h3>
      <div class="code-block">
        <pre><code># View audit logs
rinawarp admin audit list --user=user@example.com

# Export audit logs
rinawarp admin audit export --format=json --period=month</code></pre>
      </div>
    `;
  }

  // Search Functionality
  buildSearchIndex() {
    const index = [];

    Object.keys(this.docs).forEach((category) => {
      this.docs[category].sections.forEach((section) => {
        index.push({
          category: category,
          section: section.id,
          title: section.title,
          content: section.content,
          keywords: this.extractKeywords(section.content),
        });
      });
    });

    return index;
  }

  extractKeywords(content) {
    // Simple keyword extraction
    const words = content
      .toLowerCase()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter(
        (word) => !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/.test(word)
      );

    return [...new Set(words)]; // Remove duplicates
  }

  search(query) {
    const results = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    this.searchIndex.forEach((item) => {
      let score = 0;

      // Title match
      if (item.title.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }

      // Content match
      queryWords.forEach((word) => {
        if (item.content.toLowerCase().includes(word)) {
          score += 1;
        }
        if (item.keywords.includes(word)) {
          score += 2;
        }
      });

      if (score > 0) {
        results.push({ ...item, score });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  setupSearch() {
    // Set up search input
    const searchInput = document.getElementById('doc-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length > 2) {
          const results = this.search(query);
          this.displaySearchResults(results);
        }
      });
    }
  }

  displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = results
      .map(
        (result) => `
      <div class="search-result" onclick="this.showSection('${result.category}', '${result.section}')">
        <h4>${result.title}</h4>
        <p>${result.content.substring(0, 150)}...</p>
        <span class="search-category">${result.category}</span>
      </div>
    `
      )
      .join('');
  }

  // Interactive Elements
  setupInteractiveElements() {
    // Set up interactive demos
    this.setupInteractiveDemos();

    // Set up code examples
    this.setupCodeExamples();

    // Set up theme previews
    this.setupThemePreviews();
  }

  setupInteractiveDemos() {
    // Demo input handler
    window.runDemo = (input) => {
      const demoInput = input.previousElementSibling;
      const command = demoInput.value;

      if (command) {
        // Simulate AI response
        const responses = [
          'Hello! I\'m Rina, your AI assistant. How can I help you today?',
          'That\'s a great question! Let me help you with that.',
          'I\'d be happy to assist you with that task.',
          'Let me think about that and provide you with the best solution.',
        ];

        const response =
          responses[Math.floor(Math.random() * responses.length)];

        // Display response
        const output = document.getElementById('demo-output');
        if (output) {
          output.innerHTML += `<div class="demo-response"><strong>You:</strong> ${command}</div>`;
          output.innerHTML += `<div class="demo-response"><strong>Rina:</strong> ${response}</div>`;
          output.scrollTop = output.scrollHeight;
        }

        demoInput.value = '';
      }
    };
  }

  setupCodeExamples() {
    // Add copy buttons to code blocks
    document.querySelectorAll('.code-block').forEach((block) => {
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = 'Copy';
      button.onclick = () => {
        const code = block.querySelector('code').textContent;
        navigator.clipboard.writeText(code);
        button.textContent = 'Copied!';
        setTimeout(() => (button.textContent = 'Copy'), 2000);
      };
      block.appendChild(button);
    });
  }

  setupThemePreviews() {
    // Set up theme preview interactions
    document.querySelectorAll('.theme-preview').forEach((preview) => {
      preview.addEventListener('click', () => {
        const theme = preview.dataset.theme;
        this.previewTheme(theme);
      });
    });
  }

  previewTheme(themeName) {
    // Apply theme preview
    document.body.setAttribute('data-theme-preview', themeName);

    // Show preview message
    const message = document.createElement('div');
    message.className = 'theme-preview-message';
    message.textContent = `Previewing ${themeName} theme. Click to apply or press Escape to cancel.`;
    document.body.appendChild(message);

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeAttribute('data-theme-preview');
        message.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  setupVideoPlayer() {
    // Set up video player for tutorial videos
    this.videoPlayer = document.createElement('div');
    this.videoPlayer.className = 'video-player';
    this.videoPlayer.innerHTML = `
      <div class="video-overlay">
        <button class="video-close">&times;</button>
        <video controls>
          <source src="" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;

    document.body.appendChild(this.videoPlayer);

    // Close video player
    this.videoPlayer.querySelector('.video-close').onclick = () => {
      this.videoPlayer.style.display = 'none';
    };
  }

  // Public API
  showSection(category, sectionId) {
    const section = this.docs[category].sections.find(
      (s) => s.id === sectionId
    );
    if (section) {
      this.currentSection = { category, sectionId };
      this.displaySection(section);
    }
  }

  displaySection(section) {
    const content = document.getElementById('doc-content');
    if (content) {
      content.innerHTML = section.content;

      // Set up interactive elements
      this.setupInteractiveElements();
    }
  }

  getDocumentation() {
    return this.docs;
  }

  getSearchResults(query) {
    return this.search(query);
  }
}

// Global instance
window.documentationSystem = new DocumentationSystem();
