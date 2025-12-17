# RinaWarp Technologies - Application Routing Configuration

## Main Website Routing Strategy

### Current Setup

- **Main Website**: `rinawarptech.com` (Company homepage with product showcase)
- **RinaWarp Terminal**: `rinawarptech.com/terminal` (Existing production app)
- **AI Music Creator**: `ai-music-creator.rinawarptech.com` (New subdomain)
- **Admin Dashboard**: `admin.rinawarptech.com` (Admin interface)

### Routing Implementation Options

#### Option 1: Subdirectory Routing (Recommended)

```
rinawarptech.com/
├── / (Main homepage)
├── /terminal (RinaWarp Terminal - existing)
├── /ai-music-creator (Redirect to subdomain)
├── /admin (Redirect to subdomain)
├── /about (Company info)
├── /contact (Contact page)
└── /pricing (Pricing for all products)
```

#### Option 2: Subdomain Routing

```
rinawarptech.com (Main website)
├── terminal.rinawarptech.com (RinaWarp Terminal)
├── ai-music-creator.rinawarptech.com (AI Music Creator)
└── admin.rinawarptech.com (Admin Dashboard)
```

### Implementation: Subdirectory with Redirects

#### 1. Main Website (rinawarptech.com)

```html
<!-- Product Launch Buttons -->
<div class="product-launchers">
  <a href="/terminal" class="product-btn terminal-btn"> 🖥️ Terminal Pro </a>
  <a href="/ai-music-creator" class="product-btn music-btn"> 🎵 Music Creator </a>
  <a href="/admin" class="product-btn admin-btn"> ⚙️ Admin </a>
</div>
```

#### 2. Routing Logic

```javascript
// Main website routing configuration
const routes = {
  '/': {
    type: 'page',
    file: 'index.html',
    title: 'RinaWarp Technologies - AI-Powered Solutions',
  },
  '/terminal': {
    type: 'redirect',
    target: 'terminal.rinawarptech.com',
    title: 'RinaWarp Terminal Pro',
  },
  '/ai-music-creator': {
    type: 'redirect',
    target: 'ai-music-creator.rinawarptech.com',
    title: 'RinaWarp AI Music Creator',
  },
  '/admin': {
    type: 'redirect',
    target: 'admin.rinawarptech.com',
    title: 'RinaWarp Admin Dashboard',
  },
  '/about': {
    type: 'page',
    file: 'about.html',
    title: 'About RinaWarp Technologies',
  },
  '/contact': {
    type: 'page',
    file: 'contact.html',
    title: 'Contact RinaWarp Technologies',
  },
  '/pricing': {
    type: 'page',
    file: 'pricing.html',
    title: 'RinaWarp Technologies Pricing',
  },
};
```

#### 3. Nginx Configuration for Main Website

```nginx
# Main website (rinawarptech.com)
server {
    listen 80;
    listen 443 ssl http2;
    server_name rinawarptech.com www.rinawarptech.com;

    ssl_certificate /etc/ssl/certs/rinawarptech.com.crt;
    ssl_certificate_key /etc/ssl/private/rinawarptech.com.key;

    # Main website root
    root /var/www/rinawarptech.com;
    index index.html;

    # Main website pages
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Terminal Pro (existing app)
    location /terminal {
        # Option A: Redirect to subdomain
        return 301 https://terminal.rinawarptech.com$request_uri;

        # Option B: Proxy to existing app
        # proxy_pass http://localhost:3000;
        # proxy_set_header Host $host;
        # proxy_set_header X-Real-IP $remote_addr;
        # proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # proxy_set_header X-Forwarded-Proto $scheme;
    }

    # AI Music Creator redirect
    location /ai-music-creator {
        return 301 https://ai-music-creator.rinawarptech.com$request_uri;
    }

    # Admin Dashboard redirect
    location /admin {
        return 301 https://admin.rinawarptech.com$request_uri;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4. Application Subdomains

```nginx
# AI Music Creator
server {
    listen 80;
    listen 443 ssl http2;
    server_name ai-music-creator.rinawarptech.com;

    ssl_certificate /etc/ssl/certs/rinawarptech.com.crt;
    ssl_certificate_key /etc/ssl/private/rinawarptech.com.key;

    root /var/www/ai-music-creator.rinawarptech.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API calls
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin Dashboard
server {
    listen 80;
    listen 443 ssl http2;
    server_name admin.rinawarptech.com;

    ssl_certificate /etc/ssl/certs/rinawarptech.com.crt;
    ssl_certificate_key /etc/ssl/private/rinawarptech.com.key;

    root /var/www/admin.rinawarptech.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API calls
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### User Experience Flow

#### 1. Landing on rinawarptech.com

1. User visits rinawarptech.com
2. Sees product showcase with all applications
3. Clicks on "Terminal Pro" → Redirected to terminal.rinawarptech.com
4. Clicks on "Music Creator" → Redirected to ai-music-creator.rinawarptech.com
5. Clicks on "Admin" → Redirected to admin.rinawarptech.com

#### 2. Navigation Between Applications

1. User in any application
2. Clicks on "RinaWarp Technologies" logo → Returns to main website
3. Can switch between applications via main website
4. Maintains authentication across applications

#### 3. Direct Application Access

1. User visits ai-music-creator.rinawarptech.com directly
2. Can access main website via logo/brand
3. Can switch to other applications
4. Maintains session and preferences

### Cross-Application Integration

#### 1. Shared Authentication

```javascript
// Shared authentication service
class RinaWarpAuth {
  static login(credentials) {
    // Authenticate user
    // Set session for all applications
    // Store token in localStorage
  }

  static redirectToApp(appName) {
    const apps = {
      terminal: 'terminal.rinawarptech.com',
      'music-creator': 'ai-music-creator.rinawarptech.com',
      admin: 'admin.rinawarptech.com',
    };

    if (apps[appName]) {
      window.location.href = `https://${apps[appName]}`;
    }
  }

  static getMainWebsite() {
    return 'https://rinawarptech.com';
  }
}
```

#### 2. Shared Navigation Component

```html
<!-- Shared navigation for all applications -->
<nav class="rinawarp-nav">
  <div class="nav-brand">
    <a href="https://rinawarptech.com">
      <img src="/logo.png" alt="RinaWarp Technologies" />
    </a>
  </div>

  <div class="nav-apps">
    <a href="https://terminal.rinawarptech.com" class="nav-app"> 🖥️ Terminal Pro </a>
    <a href="https://ai-music-creator.rinawarptech.com" class="nav-app"> 🎵 Music Creator </a>
    <a href="https://admin.rinawarptech.com" class="nav-app"> ⚙️ Admin </a>
  </div>
</nav>
```

#### 3. Cross-Application Analytics

```javascript
// Shared analytics tracking
class RinaWarpAnalytics {
  static trackAppSwitch(fromApp, toApp) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'app_switch', {
        from_app: fromApp,
        to_app: toApp,
        event_category: 'navigation',
      });
    }
  }

  static trackProductClick(productName) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'product_click', {
        product_name: productName,
        event_category: 'engagement',
      });
    }
  }
}
```

### SEO and Marketing Benefits

#### 1. Main Website SEO

- **Domain Authority**: rinawarptech.com builds authority
- **Product Showcase**: All products in one place
- **Cross-Linking**: Internal links between applications
- **Brand Recognition**: Unified brand presence

#### 2. Application-Specific SEO

- **Terminal**: "AI terminal emulator, developer tools"
- **Music Creator**: "AI music video generator, avatar creation"
- **Admin**: "RinaWarp admin dashboard, management tools"

#### 3. Marketing Strategy

- **Landing Page**: Main website as entry point
- **Product Discovery**: Users find all products easily
- **Cross-Selling**: Promote other products to existing users
- **Unified Branding**: Consistent experience across all apps

### Implementation Steps

#### 1. Update Main Website

1. Deploy the new homepage (rinawarptech-homepage.html)
2. Add product launch buttons
3. Implement routing logic
4. Test all redirects

#### 2. Configure DNS

```
rinawarptech.com → Main website server
terminal.rinawarptech.com → Terminal app server
ai-music-creator.rinawarptech.com → Music creator server
admin.rinawarptech.com → Admin dashboard server
```

#### 3. Update Applications

1. Add shared navigation component
2. Implement cross-application authentication
3. Add analytics tracking
4. Test navigation flow

#### 4. SSL Certificates

1. Get wildcard certificate for \*.rinawarptech.com
2. Configure all subdomains
3. Test HTTPS on all applications

### Result

**A professional company website that:**

- Showcases all your AI-powered products
- Provides seamless navigation between applications
- Maintains unified branding and user experience
- Supports future product expansion
- Optimizes for SEO and marketing

**Your users will experience:**

- Easy discovery of all products
- Seamless switching between applications
- Consistent branding and navigation
- Professional, unified experience
