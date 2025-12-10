#!/usr/bin/env node

// RinaWarp Terminal Pro - Email Marketing Campaign
import fs from 'fs';
import path from 'path';

class EmailCampaign {
  constructor() {
    this.templates = this.generateEmailTemplates();
    this.audiences = this.generateAudiences();
  }

  generateEmailTemplates() {
    return {
      welcome: {
        subject: '🧜‍♀️ Welcome to RinaWarp Terminal Pro!',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; }
        .feature { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧜‍♀️ Welcome to RinaWarp Terminal Pro!</h1>
            <p>Your AI-powered terminal experience starts now</p>
        </div>
        <div class="content">
            <h2>Thank you for joining us!</h2>
            <p>You're now part of a community of developers who are revolutionizing their workflow with AI-powered terminal assistance.</p>
            
            <div class="feature">
                <h3>🚀 What's Next?</h3>
                <ul>
                    <li>Download RinaWarp Terminal Pro for your platform</li>
                    <li>Try the FREE version with 10 AI queries per day</li>
                    <li>Explore voice commands and AI assistance</li>
                    <li>Upgrade to Pro for unlimited features</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="https://rinawarptech.com/download.html" class="button">Download Now - FREE</a>
            </div>

            <div class="feature">
                <h3>💡 Pro Tips to Get Started:</h3>
                <ol>
                    <li><strong>Start with voice commands:</strong> Say "Rina, help me with git"</li>
                    <li><strong>Use AI assistance:</strong> Ask "How do I deploy this app?"</li>
                    <li><strong>Customize themes:</strong> Choose from our beautiful themes</li>
                    <li><strong>Set up projects:</strong> Let Rina learn your workflow</li>
                </ol>
            </div>

            <p>Need help? We're here for you:</p>
            <ul>
                <li>📧 Email: support@rinawarptech.com</li>
                <li>💬 Discord: https://discord.gg/rinawarp</li>
                <li>📚 Docs: https://docs.rinawarptech.com</li>
            </ul>
        </div>
        <div class="footer">
            <p>RinaWarp Terminal Pro - The Future of Terminal Development</p>
            <p><a href="https://rinawarptech.com/unsubscribe">Unsubscribe</a> | <a href="https://rinawarptech.com/privacy">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>
                `,
        text: `
🧜‍♀️ Welcome to RinaWarp Terminal Pro!

Thank you for joining us! You're now part of a community of developers who are revolutionizing their workflow with AI-powered terminal assistance.

🚀 What's Next?
- Download RinaWarp Terminal Pro for your platform
- Try the FREE version with 10 AI queries per day
- Explore voice commands and AI assistance
- Upgrade to Pro for unlimited features

Download Now: https://rinawarptech.com/download.html

💡 Pro Tips to Get Started:
1. Start with voice commands: Say "Rina, help me with git"
2. Use AI assistance: Ask "How do I deploy this app?"
3. Customize themes: Choose from our beautiful themes
4. Set up projects: Let Rina learn your workflow

Need help? We're here for you:
- Email: support@rinawarptech.com
- Discord: https://discord.gg/rinawarp
- Docs: https://docs.rinawarptech.com

RinaWarp Terminal Pro - The Future of Terminal Development
                `,
      },

      upgrade: {
        subject: "⚡ Unlock RinaWarp Terminal Pro's Full Potential",
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 30px 0; }
        .plan { border: 2px solid #e9ecef; padding: 20px; border-radius: 10px; text-align: center; }
        .plan.featured { border-color: #667eea; background: #f8f9ff; }
        .plan-name { font-weight: bold; font-size: 1.2rem; margin-bottom: 10px; }
        .plan-price { font-size: 2rem; color: #667eea; font-weight: bold; }
        .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ Ready to Upgrade?</h1>
            <p>Unlock RinaWarp Terminal Pro's full potential</p>
        </div>
        <div class="content">
            <h2>You've been using the FREE version...</h2>
            <p>We hope you're loving RinaWarp Terminal Pro! You've used <strong>X AI queries</strong> this month. Ready to go unlimited?</p>

            <div class="pricing">
                <div class="plan">
                    <div class="plan-name">Professional</div>
                    <div class="plan-price">$29.99</div>
                    <div>/month</div>
                    <ul style="text-align: left; margin-top: 15px;">
                        <li>Unlimited AI queries</li>
                        <li>3 device licenses</li>
                        <li>Advanced voice control</li>
                        <li>Premium themes</li>
                    </ul>
                    <a href="https://rinawarptech.com/pricing.html?plan=professional" class="button">Choose Professional</a>
                </div>
                
                <div class="plan featured">
                    <div class="plan-name">Business</div>
                    <div class="plan-price">$49.99</div>
                    <div>/month</div>
                    <ul style="text-align: left; margin-top: 15px;">
                        <li>Everything in Professional</li>
                        <li>5 device licenses</li>
                        <li>Team collaboration</li>
                        <li>24/7 support</li>
                    </ul>
                    <a href="https://rinawarptech.com/pricing.html?plan=business" class="button">Choose Business</a>
                </div>
                
                <div class="plan">
                    <div class="plan-name">Lifetime</div>
                    <div class="plan-price">$299.99</div>
                    <div>one-time</div>
                    <ul style="text-align: left; margin-top: 15px;">
                        <li>Everything forever</li>
                        <li>Unlimited devices</li>
                        <li>Lifetime updates</li>
                        <li>No recurring fees</li>
                    </ul>
                    <a href="https://rinawarptech.com/pricing.html?plan=lifetime" class="button">Choose Lifetime</a>
                </div>
            </div>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3>🎁 Special Launch Offer!</h3>
                <p>Get <strong>20% OFF</strong> your first month with code: <strong>LAUNCH20</strong></p>
                <p><em>Valid until January 31, 2025</em></p>
            </div>

            <p>Questions? Reply to this email or contact us at support@rinawarptech.com</p>
        </div>
        <div class="footer">
            <p>RinaWarp Terminal Pro - The Future of Terminal Development</p>
            <p><a href="https://rinawarptech.com/unsubscribe">Unsubscribe</a> | <a href="https://rinawarptech.com/privacy">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>
                `,
        text: `
⚡ Ready to Upgrade? Unlock RinaWarp Terminal Pro's full potential

You've been using the FREE version...
We hope you're loving RinaWarp Terminal Pro! You've used X AI queries this month. Ready to go unlimited?

PROFESSIONAL - $29.99/month
- Unlimited AI queries
- 3 device licenses
- Advanced voice control
- Premium themes
Choose: https://rinawarptech.com/pricing.html?plan=professional

BUSINESS - $49.99/month (MOST POPULAR)
- Everything in Professional
- 5 device licenses
- Team collaboration
- 24/7 support
Choose: https://rinawarptech.com/pricing.html?plan=business

LIFETIME - $299.99 one-time
- Everything forever
- Unlimited devices
- Lifetime updates
- No recurring fees
Choose: https://rinawarptech.com/pricing.html?plan=lifetime

🎁 Special Launch Offer!
Get 20% OFF your first month with code: LAUNCH20
Valid until January 31, 2025

Questions? Reply to this email or contact us at support@rinawarptech.com
                `,
      },

      newsletter: {
        subject: '📰 RinaWarp Weekly: AI Terminal Tips & Updates',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .tip { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .update { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📰 RinaWarp Weekly</h1>
            <p>AI Terminal Tips & Updates</p>
        </div>
        <div class="content">
            <h2>This Week's Highlights</h2>
            
            <div class="update">
                <h3>🆕 New Features This Week</h3>
                <ul>
                    <li>Enhanced voice recognition accuracy (15% improvement)</li>
                    <li>New "Mermaid" theme for ocean lovers</li>
                    <li>Faster AI response times (2x speed improvement)</li>
                    <li>New keyboard shortcuts for power users</li>
                </ul>
            </div>

            <div class="tip">
                <h3>💡 Pro Tip: Voice Command Mastery</h3>
                <p>Did you know you can chain voice commands? Try saying:</p>
                <ul>
                    <li>"Rina, create a new React component and open it in VS Code"</li>
                    <li>"Rina, check git status and commit if clean"</li>
                    <li>"Rina, deploy to production and monitor logs"</li>
                </ul>
                <p>Rina understands context and can execute complex workflows!</p>
            </div>

            <div class="tip">
                <h3>🔧 Community Spotlight</h3>
                <p><strong>@sarah_dev</strong> shared: "RinaWarp saved me 3 hours yesterday by automatically setting up my Docker environment. The AI understood exactly what I needed!"</p>
                <p>Share your RinaWarp success stories with #RinaWarpSuccess</p>
            </div>

            <div class="tip">
                <h3>📊 Usage Stats</h3>
                <p>This week our community:</p>
                <ul>
                    <li>Executed 50,000+ AI-assisted commands</li>
                    <li>Saved an average of 2.5 hours per developer</li>
                    <li>Used voice commands 15,000+ times</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="https://rinawarptech.com/dashboard.html" class="button">Open Your Dashboard</a>
            </div>
        </div>
        <div class="footer">
            <p>RinaWarp Terminal Pro - The Future of Terminal Development</p>
            <p><a href="https://rinawarptech.com/unsubscribe">Unsubscribe</a> | <a href="https://rinawarptech.com/privacy">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>
                `,
        text: `
📰 RinaWarp Weekly: AI Terminal Tips & Updates

This Week's Highlights

🆕 New Features This Week
- Enhanced voice recognition accuracy (15% improvement)
- New "Mermaid" theme for ocean lovers
- Faster AI response times (2x speed improvement)
- New keyboard shortcuts for power users

💡 Pro Tip: Voice Command Mastery
Did you know you can chain voice commands? Try saying:
- "Rina, create a new React component and open it in VS Code"
- "Rina, check git status and commit if clean"
- "Rina, deploy to production and monitor logs"
Rina understands context and can execute complex workflows!

🔧 Community Spotlight
@sarah_dev shared: "RinaWarp saved me 3 hours yesterday by automatically setting up my Docker environment. The AI understood exactly what I needed!"
Share your RinaWarp success stories with #RinaWarpSuccess

📊 Usage Stats
This week our community:
- Executed 50,000+ AI-assisted commands
- Saved an average of 2.5 hours per developer
- Used voice commands 15,000+ times

Open Your Dashboard: https://rinawarptech.com/dashboard.html
                `,
      },
    };
  }

  generateAudiences() {
    return {
      free_users: {
        name: 'Free Users',
        description: 'Users on the free plan',
        criteria: "plan = 'free' AND last_active > 7 days ago",
        campaigns: ['welcome', 'upgrade', 'newsletter'],
      },
      pro_users: {
        name: 'Pro Users',
        description: 'Paid subscribers',
        criteria: "plan IN ('professional', 'business', 'lifetime')",
        campaigns: ['newsletter', 'feature_updates'],
      },
      inactive_users: {
        name: 'Inactive Users',
        description: "Haven't used the app in 30+ days",
        criteria: 'last_active < 30 days ago',
        campaigns: ['win_back', 're_engagement'],
      },
      trial_users: {
        name: 'Trial Users',
        description: 'In trial period',
        criteria: 'trial_end_date > NOW()',
        campaigns: ['trial_tips', 'upgrade_reminder'],
      },
    };
  }

  generateEmail(campaignType, audience = null) {
    const template = this.templates[campaignType];
    if (!template) {
      console.log('❌ Invalid campaign type. Available:', Object.keys(this.templates).join(', '));
      return;
    }

    console.log(`\n📧 ${template.subject}`);
    console.log('='.repeat(50));
    console.log('HTML Version:');
    console.log(template.html);
    console.log('\nText Version:');
    console.log(template.text);

    return template;
  }

  saveTemplates() {
    const outputDir = './marketing/email-templates';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    Object.keys(this.templates).forEach((templateType) => {
      const filename = `${outputDir}/${templateType}-template.json`;
      fs.writeFileSync(filename, JSON.stringify(this.templates[templateType], null, 2));
      console.log(`✅ Saved ${templateType} template to ${filename}`);
    });
  }

  generateCampaignSchedule() {
    const schedule = {
      daily: [
        { time: '9:00 AM', audience: 'free_users', campaign: 'welcome', priority: 'high' },
        { time: '2:00 PM', audience: 'trial_users', campaign: 'trial_tips', priority: 'medium' },
      ],
      weekly: [
        { day: 'Monday', audience: 'all_users', campaign: 'newsletter', priority: 'high' },
        { day: 'Wednesday', audience: 'free_users', campaign: 'upgrade', priority: 'medium' },
        { day: 'Friday', audience: 'inactive_users', campaign: 're_engagement', priority: 'low' },
      ],
      monthly: [
        { day: '1st', audience: 'pro_users', campaign: 'feature_updates', priority: 'high' },
        { day: '15th', audience: 'all_users', campaign: 'newsletter', priority: 'medium' },
      ],
    };

    const filename = './marketing/email-schedule.json';
    fs.writeFileSync(filename, JSON.stringify(schedule, null, 2));
    console.log(`✅ Email campaign schedule saved to ${filename}`);

    return schedule;
  }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];
const campaignType = args[1];

const emailCampaign = new EmailCampaign();

switch (command) {
  case 'generate':
    if (campaignType) {
      emailCampaign.generateEmail(campaignType);
    } else {
      console.log('Available campaigns:', Object.keys(emailCampaign.templates).join(', '));
    }
    break;

  case 'save':
    emailCampaign.saveTemplates();
    break;

  case 'schedule':
    emailCampaign.generateCampaignSchedule();
    break;

  case 'audiences':
    console.log('📊 Email Audiences:');
    Object.keys(emailCampaign.audiences).forEach((audience) => {
      const info = emailCampaign.audiences[audience];
      console.log(`\n${audience}:`);
      console.log(`  Name: ${info.name}`);
      console.log(`  Description: ${info.description}`);
      console.log(`  Criteria: ${info.criteria}`);
      console.log(`  Campaigns: ${info.campaigns.join(', ')}`);
    });
    break;

  case 'help':
  default:
    console.log(`
🧜‍♀️ RinaWarp Terminal Pro - Email Marketing

Usage:
  node email-campaign.js <command> [campaign-type]

Commands:
  generate [type]    Generate email template
  save              Save all templates to files
  schedule          Generate campaign schedule
  audiences         Show audience segments
  help              Show this help

Campaign Types:
  welcome          Welcome email for new users
  upgrade          Upgrade promotion email
  newsletter       Weekly newsletter template

Examples:
  node email-campaign.js generate welcome
  node email-campaign.js generate upgrade
  node email-campaign.js save
  node email-campaign.js schedule
  node email-campaign.js audiences
        `);
    break;
}
