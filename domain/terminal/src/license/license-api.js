// RinaWarp Terminal - License API Endpoints
// Handles license generation, validation, and management

import LicenseGenerator from './license-generator.js';

class LicenseAPI {
  constructor() {
    this.licenseGenerator = new LicenseGenerator();
  }

  // Generate license after successful payment
  async generateLicenseFromPayment(paymentData) {
    try {
      const { plan, customerEmail, customerName } = paymentData;

      const license = this.licenseGenerator.generateLicenseKey(
        plan,
        customerEmail,
        customerName
      );

      console.log(
        `✅ License generated: ${license.licenseKey} for ${customerEmail}`
      );

      return {
        success: true,
        license: license,
      };
    } catch (error) {
      console.error('❌ License generation failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Validate license key
  async validateLicense(licenseKey) {
    try {
      const result = this.licenseGenerator.validateLicense(licenseKey);
      return result;
    } catch (error) {
      console.error('❌ License validation failed:', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  // Get license statistics
  async getLicenseStats() {
    try {
      const stats = this.licenseGenerator.getLicenseStats();
      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error('❌ License stats failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Revoke license
  async revokeLicense(licenseKey) {
    try {
      const result = this.licenseGenerator.revokeLicense(licenseKey);
      return result;
    } catch (error) {
      console.error('❌ License revocation failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Extract plan from Stripe price ID
  extractPlanFromPriceId(priceId) {
    const planMapping = {
      price_1S8wXFG2ToGP7Chn32ULvGaA: 'professional',
      price_1S8wXGG2ToGP7ChnTQP5PUEa: 'business',
      price_1S8wXGG2ToGP7ChnR6FN4V76: 'lifetime',
    };

    return planMapping[priceId] || 'professional';
  }

  // Generate license for successful payment
  async handleSuccessfulPayment(stripeSession) {
    try {
      const customerEmail =
        stripeSession.customer_details?.email || 'unknown@example.com';
      const customerName =
        stripeSession.customer_details?.name || 'Unknown Customer';
      const plan = this.extractPlanFromPriceId(
        stripeSession.metadata?.plan || ''
      );

      const licenseResult = await this.generateLicenseFromPayment({
        plan,
        customerEmail,
        customerName,
      });

      if (licenseResult.success) {
        // Send email notification
        await this.sendLicenseEmail(licenseResult.license, customerEmail);

        return licenseResult;
      } else {
        throw new Error(licenseResult.error);
      }
    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Send license email (placeholder - integrate with your email service)
  async sendLicenseEmail(license, customerEmail) {
    try {
      // This would integrate with your email service (SendGrid, Mailgun, etc.)
      console.log(`📧 License email would be sent to ${customerEmail}`);
      console.log(`   License Key: ${license.licenseKey}`);
      console.log(`   Plan: ${license.plan}`);
      console.log(`   Expires: ${license.expiresAt}`);

      // For now, just log the email content
      const emailContent = {
        to: customerEmail,
        subject: 'Your RinaWarp Terminal License',
        html: this.generateLicenseEmailHTML(license),
      };

      console.log('Email content:', emailContent);

      return { success: true };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate license email HTML
  generateLicenseEmailHTML(license) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #008B8B, #FF1493); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .license-key { background: #2c3e50; color: white; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
                .button { background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🧜‍♀️ Welcome to RinaWarp Terminal!</h1>
                    <p>Your license is ready</p>
                </div>
                <div class="content">
                    <h2>Thank you for your purchase!</h2>
                    <p>Your RinaWarp Terminal license has been generated and is ready to use.</p>
                    
                    <h3>License Details:</h3>
                    <ul>
                        <li><strong>Plan:</strong> ${license.plan.charAt(0).toUpperCase() + license.plan.slice(1)}</li>
                        <li><strong>Customer:</strong> ${license.customerName}</li>
                        <li><strong>Email:</strong> ${license.customerEmail}</li>
                        <li><strong>Expires:</strong> ${new Date(license.expiresAt).toLocaleDateString()}</li>
                    </ul>
                    
                    <div class="license-key">${license.licenseKey}</div>
                    
                    <p><strong>How to activate:</strong></p>
                    <ol>
                        <li>Download RinaWarp Terminal from the link below</li>
                        <li>Install the application</li>
                        <li>Enter your license key when prompted</li>
                        <li>Start using your AI-powered terminal!</li>
                    </ol>
                    
                    <a href="https://rinawarptech.com/download.html" class="button">Download RinaWarp Terminal</a>
                    
                    <p><strong>Need help?</strong> Contact us at support@rinawarptech.com</p>
                </div>
                <div class="footer">
                    <p>© 2025 RinaWarp Technologies. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
  }
}

export default LicenseAPI;
