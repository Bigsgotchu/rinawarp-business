// Basic Tier Marketing Campaign - Launch Strategy
class BasicTierCampaign {
  constructor() {
    this.campaigns = {
      launch: {
        name: 'Basic Tier Launch',
        duration: '30 days',
        budget: '$5,000',
        target: 'Price-sensitive developers',
        channels: ['Twitter', 'Reddit', 'Hacker News', 'Dev.to', 'LinkedIn'],
      },
      conversion: {
        name: 'Free to Basic Conversion',
        duration: 'Ongoing',
        budget: '$2,000/month',
        target: 'Free tier users',
        channels: ['In-app notifications', 'Email', 'Website popups'],
      },
      upsell: {
        name: 'Basic to Professional Upsell',
        duration: 'Ongoing',
        budget: '$1,000/month',
        target: 'Basic tier users',
        channels: ['Email', 'In-app', 'Usage notifications'],
      },
    };
  }

  // Generate launch content
  generateLaunchContent() {
    return {
      socialMedia: {
        twitter: [
          '🚀 NEW: RinaWarp Terminal Pro Basic Tier!',
          'Just $19.99/month for 100 AI queries, command macros, and voice control!',
          'Perfect for individual developers who need more than free but want to save money.',
          'Try it now: rinawarptech.com #AI #Terminal #Productivity',
        ],
        linkedin: [
          'Introducing RinaWarp Terminal Pro Basic Tier - The Perfect Middle Ground',
          "For developers who need more than 10 AI queries but don't need the full Professional suite.",
          'Features: 100 AI queries, 5 command macros, basic voice control, 2 device licenses',
          'Pricing: $19.99/month (vs $79.99 for Professional)',
          'Learn more: rinawarptech.com',
        ],
        reddit: [
          'r/programming: RinaWarp Terminal Pro now has a Basic tier at $19.99/month',
          'r/webdev: New Basic tier for RinaWarp Terminal Pro - 100 AI queries for $19.99',
          'r/MachineLearning: AI-powered terminal with affordable Basic tier',
        ],
      },
      email: {
        subject: '🎉 New Basic Tier - More AI, Less Cost!',
        body: `
Hi [Name],

Great news! We've launched a new Basic tier for RinaWarp Terminal Pro that gives you:

✅ 100 AI queries per month (10x more than free)
✅ 5 command macros for automation
✅ Basic voice control
✅ 2 device licenses
✅ Email support

All for just $19.99/month - that's 75% less than Professional!

Perfect for individual developers who need more than free but want to save money.

[Get Basic Tier Now] | [Compare Plans] | [View Pricing]

Best regards,
The RinaWarp Team
                `,
      },
      website: {
        popup:
          '🎉 NEW: Basic Tier at $19.99/month! 100 AI queries, 5 macros, voice control. Perfect for individual developers!',
        banner: 'Introducing Basic Tier - More AI, Less Cost! Starting at $19.99/month',
      },
    };
  }

  // Generate conversion strategies
  generateConversionStrategies() {
    return {
      freeToBasic: {
        triggers: [
          'User hits 10 AI query limit',
          'User tries to create a macro',
          'User tries to use voice control',
          'User visits pricing page 3+ times',
        ],
        messages: [
          "You've used all 10 free AI queries this month. Upgrade to Basic for 100 queries!",
          'Command macros are available in Basic tier and above. Upgrade now!',
          'Voice control is available in Basic tier and above. Try it for $19.99/month!',
          "You've been exploring our pricing. Basic tier gives you 10x more AI queries for just $19.99!",
        ],
        offers: ['First month 50% off', 'Free trial for 7 days', 'Money-back guarantee'],
      },
      basicToProfessional: {
        triggers: [
          'User hits 100 AI query limit',
          'User tries to create 6th macro',
          'User tries to use VS Code extension',
          'User needs 3rd device license',
        ],
        messages: [
          "You've used all 100 AI queries this month. Upgrade to Professional for unlimited!",
          "You've reached your 5 macro limit. Professional gives you unlimited macros!",
          'VS Code integration is available in Professional tier. Upgrade now!',
          'You need more device licenses. Professional includes 3 licenses!',
        ],
        offers: [
          'Upgrade discount: 20% off first month',
          'Free VS Code extension with upgrade',
          'Priority support included',
        ],
      },
    };
  }

  // Generate content calendar
  generateContentCalendar() {
    return {
      week1: {
        focus: 'Launch Announcement',
        content: [
          'Social media launch posts',
          'Email to existing users',
          "Blog post: 'Why we created Basic tier'",
          'Press release to tech blogs',
        ],
      },
      week2: {
        focus: 'Feature Education',
        content: [
          "Tutorial: 'Getting started with Basic tier'",
          "Video: '5 ways Basic tier saves you time'",
          "Case study: 'How Basic tier helped a developer'",
          "Comparison: 'Basic vs Free vs Professional'",
        ],
      },
      week3: {
        focus: 'Conversion Optimization',
        content: [
          'A/B test pricing page',
          'Optimize free tier upgrade prompts',
          'Create usage-based upgrade triggers',
          'Test different messaging',
        ],
      },
      week4: {
        focus: 'Scale & Optimize',
        content: [
          'Analyze conversion data',
          'Double down on what works',
          "Plan next month's strategy",
          'Gather user feedback',
        ],
      },
    };
  }

  // Generate metrics to track
  generateMetrics() {
    return {
      conversion: {
        freeToBasic: {
          target: '20%',
          current: '0%',
          metric: 'Free users who upgrade to Basic',
        },
        basicToProfessional: {
          target: '30%',
          current: '0%',
          metric: 'Basic users who upgrade to Professional',
        },
      },
      revenue: {
        basicTier: {
          target: '$7,996/month',
          current: '$0/month',
          metric: 'Monthly recurring revenue from Basic tier',
        },
        total: {
          target: '$217,983/month',
          current: '$0/month',
          metric: 'Total monthly recurring revenue',
        },
      },
      engagement: {
        basicUsers: {
          target: '200 users',
          current: '0 users',
          metric: 'Active Basic tier subscribers',
        },
        satisfaction: {
          target: '4.5/5',
          current: '0/5',
          metric: 'Basic tier user satisfaction',
        },
      },
    };
  }

  // Generate launch checklist
  generateLaunchChecklist() {
    return {
      technical: [
        '✅ Basic tier pricing updated on website',
        '✅ Backend supports Basic tier payments',
        '✅ Feature limits implemented',
        '✅ Usage tracking working',
        '✅ Payment flow tested',
        '⏳ Stripe products created for Basic tier',
        '⏳ Analytics tracking Basic tier conversions',
        '⏳ Email notifications for Basic tier signups',
      ],
      marketing: [
        '✅ Social media content created',
        '✅ Email templates ready',
        '✅ Website popups configured',
        '⏳ Press release sent to tech blogs',
        '⏳ Reddit posts scheduled',
        '⏳ LinkedIn campaign launched',
        '⏳ Twitter campaign launched',
        '⏳ Dev.to article published',
      ],
      content: [
        '✅ Pricing page updated',
        '✅ Feature comparison created',
        '⏳ Tutorial videos recorded',
        '⏳ Case studies written',
        '⏳ Blog posts published',
        '⏳ Documentation updated',
      ],
    };
  }
}

// Export for use
export default BasicTierCampaign;
