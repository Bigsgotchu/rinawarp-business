/**
 * Advanced Email Service
 * Multi-provider email service with template support
 */

import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'smtp';
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      switch (this.provider) {
      case 'sendgrid':
        this.transporter = nodemailer.createTransporter({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY,
          },
        });
        break;

      case 'ses':
        this.transporter = nodemailer.createTransporter({
          SES: {
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
        break;

      case 'gmail':
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });
        break;

      default: // SMTP fallback
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST || 'localhost',
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }

      console.log(
        `✅ Email service initialized with provider: ${this.provider}`
      );
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  async sendEmail(options) {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const {
      to,
      subject,
      text,
      html,
      from = process.env.EMAIL_FROM || 'noreply@rinawarptech.com',
      attachments = [],
    } = options;

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
        attachments,
      });

      console.log(`✅ Email sent successfully to ${to}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Email sending failed to ${to}:`, error);
      throw error;
    }
  }

  async sendTemplateEmail(templateName, data, options) {
    const template = this.getEmailTemplate(templateName, data);

    return this.sendEmail({
      ...options,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  getEmailTemplate(templateName, data) {
    const templates = {
      welcome: {
        subject: 'Welcome to RinaWarp Terminal Pro! 🧜‍♀️',
        text: `Welcome ${data.name || 'there'}! 

Thank you for joining RinaWarp Terminal Pro. You now have access to:

🤖 AI-powered command assistance
🎤 Voice control features  
🎨 Beautiful terminal themes
⚡ Lightning-fast performance

Get started by downloading the desktop app: ${data.downloadUrl || 'https://rinawarptech.com/download'}

Happy coding!
The RinaWarp Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0066cc;">Welcome to RinaWarp Terminal Pro! 🧜‍♀️</h1>
            <p>Welcome ${data.name || 'there'}!</p>
            <p>Thank you for joining RinaWarp Terminal Pro. You now have access to:</p>
            <ul>
              <li>🤖 AI-powered command assistance</li>
              <li>🎤 Voice control features</li>
              <li>🎨 Beautiful terminal themes</li>
              <li>⚡ Lightning-fast performance</li>
            </ul>
            <p>Get started by downloading the desktop app:</p>
            <a href="${data.downloadUrl || 'https://rinawarptech.com/download'}" 
               style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Download Now
            </a>
            <p>Happy coding!<br>The RinaWarp Team</p>
          </div>
        `,
      },

      licenseGenerated: {
        subject: 'Your RinaWarp Terminal Pro License 🎉',
        text: `Hello ${data.name || 'there'}!

Your RinaWarp Terminal Pro license has been generated:

License Key: ${data.licenseKey}
Plan: ${data.plan}
Expires: ${data.expires || 'Never (Lifetime)'}

Download the desktop app: ${data.downloadUrl || 'https://rinawarptech.com/download'}

Installation Instructions:
1. Download and install the app
2. Enter your license key when prompted
3. Start enjoying AI-powered terminal assistance!

Need help? Reply to this email or visit our support page.

Best regards,
The RinaWarp Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0066cc;">Your RinaWarp Terminal Pro License 🎉</h1>
            <p>Hello ${data.name || 'there'}!</p>
            <p>Your RinaWarp Terminal Pro license has been generated:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <p><strong>License Key:</strong> <code style="background: #e0e0e0; padding: 4px 8px;">${data.licenseKey}</code></p>
              <p><strong>Plan:</strong> ${data.plan}</p>
              <p><strong>Expires:</strong> ${data.expires || 'Never (Lifetime)'}</p>
            </div>
            <p>Download the desktop app:</p>
            <a href="${data.downloadUrl || 'https://rinawarptech.com/download'}" 
               style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Download Now
            </a>
            <h3>Installation Instructions:</h3>
            <ol>
              <li>Download and install the app</li>
              <li>Enter your license key when prompted</li>
              <li>Start enjoying AI-powered terminal assistance!</li>
            </ol>
            <p>Need help? Reply to this email or visit our support page.</p>
            <p>Best regards,<br>The RinaWarp Team</p>
          </div>
        `,
      },

      paymentConfirmation: {
        subject: 'Payment Confirmed - RinaWarp Terminal Pro ✅',
        text: `Hello ${data.name || 'there'}!

Your payment has been confirmed and your account has been upgraded.

Plan: ${data.plan}
Amount: ${data.amount}
Transaction ID: ${data.transactionId}

You now have access to all premium features! Your license will be sent in a separate email.

Thank you for your purchase!

Best regards,
The RinaWarp Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0066cc;">Payment Confirmed - RinaWarp Terminal Pro ✅</h1>
            <p>Hello ${data.name || 'there'}!</p>
            <p>Your payment has been confirmed and your account has been upgraded.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <p><strong>Plan:</strong> ${data.plan}</p>
              <p><strong>Amount:</strong> ${data.amount}</p>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            </div>
            <p>You now have access to all premium features! Your license will be sent in a separate email.</p>
            <p>Thank you for your purchase!</p>
            <p>Best regards,<br>The RinaWarp Team</p>
          </div>
        `,
      },
    };

    const template = templates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    return template;
  }

  async verifyConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
