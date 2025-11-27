/**
 * Google Slides API Integration for Kilo Presentation Generator
 * Provides direct Google Slides creation capability
 */

const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');

class GoogleSlidesAPI {
  constructor(credentialsPath = './google-oauth-credentials.json') {
    this.credentialsPath = credentialsPath;
    this.scopes = [
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/drive'
    ];
    this.oauth2Client = null;
    this.slidesService = null;
  }

  /**
   * Initialize OAuth2 client with credentials
   */
  async initialize() {
    try {
      const credentials = await fs.readFile(this.credentialsPath, 'utf8');
      const clientConfig = JSON.parse(credentials);
      
      this.oauth2Client = new google.auth.OAuth2(
        clientConfig.installed.client_id,
        clientConfig.installed.client_secret,
        clientConfig.installed.redirect_uris[0]
      );

      this.slidesService = google.slides({ version: 'v1', auth: this.oauth2Client });
      this.driveService = google.drive({ version: 'v3', auth: this.oauth2Client });
      
      console.log('✅ Google Slides API initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Slides API:', error.message);
      return false;
    }
  }

  /**
   * Generate OAuth URL for user consent
   */
  generateAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(authCode) {
    try {
      const { tokens } = await this.oauth2Client.getToken(authCode);
      this.oauth2Client.setCredentials(tokens);
      
      console.log('✅ OAuth tokens obtained');
      return tokens;
    } catch (error) {
      console.error('❌ Failed to get OAuth tokens:', error.message);
      throw error;
    }
  }

  /**
   * Set stored tokens for authentication
   */
  async setStoredTokens(tokens) {
    this.oauth2Client.setCredentials(tokens);
    console.log('✅ Stored tokens loaded');
  }

  /**
   * Create a new Google Slides presentation from Kilo content
   */
  async createPresentation(slidesContent, title = 'Kilo Generated Presentation') {
    try {
      if (!this.oauth2Client.credentials.access_token) {
        throw new Error('Not authenticated. Please authenticate first.');
      }

      console.log('🎯 Creating Google Slides presentation...');

      // Create new presentation
      const createRequest = {
        requestBody: {
          title: title
        }
      };

      const presentationResponse = await this.slidesService.presentations.create(createRequest);
      const presentationId = presentationResponse.data.presentationId;
      
      console.log(`📊 Created presentation: ${presentationId}`);

      // Add slides and content
      await this.addSlidesToPresentation(presentationId, slidesContent);

      // Share the presentation (make it viewable)
      await this.sharePresentation(presentationId);

      const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;
      console.log(`✨ Presentation created: ${presentationUrl}`);

      return {
        presentationId,
        presentationUrl,
        title
      };

    } catch (error) {
      console.error('❌ Failed to create presentation:', error.message);
      throw error;
    }
  }

  /**
   * Add slides to existing presentation
   */
  async addSlidesToPresentation(presentationId, slidesContent) {
    const requests = [];
    
    slidesContent.forEach((slide, index) => {
      // Add slide
      requests.push({
        createSlide: {
          objectId: `slide_${index + 1}`,
          slideLayoutReference: {
            predefinedLayout: 'TITLE_AND_BODY'
          }
        }
      });

      // Add title
      if (slide.title) {
        requests.push({
          createShape: {
            objectId: `title_${index + 1}`,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: `slide_${index + 1}`,
              size: {
                height: { magnitude: 1.5, unit: 'INCH' },
                width: { magnitude: 10, unit: 'INCH' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 0.5,
                translateY: 0.5
              }
            }
          }
        });

        requests.push({
          insertText: {
            objectId: `title_${index + 1}`,
            text: slide.title
          }
        });
      }

      // Add content bullets
      if (slide.content && slide.content.bullets) {
        slide.content.bullets.forEach((bullet, bulletIndex) => {
          requests.push({
            createShape: {
              objectId: `bullet_${index + 1}_${bulletIndex}`,
              shapeType: 'TEXT_BOX',
              elementProperties: {
                pageObjectId: `slide_${index + 1}`,
                size: {
                  height: { magnitude: 0.5, unit: 'INCH' },
                  width: { magnitude: 9, unit: 'INCH' }
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: 1,
                  translateY: 2.5 + (bulletIndex * 0.6)
                }
              }
            }
          });

          requests.push({
            insertText: {
              objectId: `bullet_${index + 1}_${bulletIndex}`,
              text: `• ${bullet}`
            }
          });
        });
      }
    });

    // Execute all requests
    const batchRequest = {
      presentationId: presentationId,
      requestBody: {
        requests: requests
      }
    };

    await this.slidesService.presentations.batchUpdate(batchRequest);
    console.log(`📝 Added ${slidesContent.length} slides to presentation`);
  }

  /**
   * Share presentation (make it viewable)
   */
  async sharePresentation(presentationId) {
    try {
      await this.driveService.permissions.create({
        fileId: presentationId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
      console.log('🔓 Presentation shared publicly');
    } catch (error) {
      console.warn('⚠️ Could not share presentation:', error.message);
    }
  }

  /**
   * Convert Kilo slide content to Google Slides format
   */
  convertKiloToGoogleSlides(slides) {
    return slides.map(slide => {
      const googleSlide = {
        title: slide.title || 'Untitled',
        content: {
          bullets: []
        }
      };

      // Extract bullet points from markdown content
      const contentLines = slide.content.split('\n');
      contentLines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
          googleSlide.content.bullets.push(trimmed.substring(2));
        } else if (trimmed.startsWith('### ')) {
          googleSlide.content.bullets.push(trimmed.substring(4));
        }
      });

      return googleSlide;
    });
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated() {
    return this.oauth2Client && this.oauth2Client.credentials.access_token;
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      console.log('🔄 Access token refreshed');
      return credentials;
    } catch (error) {
      console.error('❌ Failed to refresh token:', error.message);
      throw error;
    }
  }

  /**
   * Get presentation metadata
   */
  async getPresentation(presentationId) {
    try {
      const response = await this.slidesService.presentations.get({
        presentationId: presentationId
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get presentation:', error.message);
      throw error;
    }
  }
}

module.exports = GoogleSlidesAPI;