/**
 * Export Formatters
 * Handles export to Google Slides, PPTX, Canva, and other formats
 */

const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./utils/logger');
const ThemeEngine = require('./theme-engine');

class ExportFormatters {
  constructor(config, slides) {
    this.config = config;
    this.slides = slides;
    this.theme = new ThemeEngine(config.theme, config);
    this.outputPath = config.output;
  }

  /**
   * Generate all export formats
   */
  async generateAllExports() {
    const formats = [];
    
    for (const format of this.config.export) {
      try {
        logger.info(`📊 Generating ${format} export...`);
        await this.generateFormat(format);
        formats.push(format);
        logger.success(`✅ ${format} export completed`);
      } catch (error) {
        logger.error(`❌ Failed to generate ${format}:`, error.message);
      }
    }
    
    return formats;
  }

  /**
   * Generate specific format
   */
  async generateFormat(format) {
    switch (format) {
      case 'google-slides':
        return await this.generateGoogleSlides();
      case 'pptx':
        return await this.generatePPTX();
      case 'canva':
        return await this.generateCanva();
      case 'pdf':
        return await this.generatePDF();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate Google Slides import format
   */
  async generateGoogleSlides() {
    let importContent = '# Google Slides Import Instructions\n\n';
    importContent += '## 🎯 How to Import to Google Slides\n\n';
    importContent += '1. **Copy each slide content** from below\n';
    importContent += '2. **Open Google Slides** in your browser\n';
    importContent += '3. **Create new presentation** or open existing\n';
    importContent += '4. **Paste content** into each slide\n';
    importContent += '5. **Apply theme** using the CSS provided\n\n';
    importContent += '---\n\n';
    
    // Add CSS
    importContent += '## 🎨 Theme CSS (Copy to "Slide > Change background > Image")\n\n';
    importContent += '```css\n';
    importContent += this.theme.generateGoogleSlidesCSS();
    importContent += '```\n\n';
    importContent += '---\n\n';
    
    // Add slides
    this.slides.forEach((slide, index) => {
      importContent += `## Slide ${index + 1}: ${slide.title}\n\n`;
      
      // Convert markdown to Google Slides format
      const slidesContent = this.convertMarkdownToGoogleSlides(slide.content);
      importContent += slidesContent;
      
      importContent += '\n---\n\n';
    });
    
    // Add usage instructions
    importContent += '## 📝 Formatting Tips\n\n';
    importContent += '- **Headers**: Use Heading 1 (H1) for slide titles\n';
    importContent += '- **Body text**: Use regular text with bullet points\n';
    importContent += '- **Highlights**: Use the gradient text effect for emphasis\n';
    importContent += '- **Colors**: Apply the RinaWarp color palette provided\n';
    importContent += '- **Fonts**: Use Poppins for headers, Montserrat for body text\n\n';
    
    importContent += '## 🔧 Advanced Customization\n\n';
    importContent += '- **Background images**: Use the generated background patterns\n';
    importContent += '- **Animations**: Add entrance animations for engagement\n';
    importContent += '- **Transitions**: Use smooth transitions between slides\n';
    importContent += '- **Speaker notes**: Add notes using the speaker notes file\n\n';
    
    const filepath = path.join(this.outputPath, 'google-slides-import.txt');
    await fs.writeFile(filepath, importContent, 'utf8');
    
    return 'google-slides';
  }

  /**
   * Convert markdown content to Google Slides format
   */
  convertMarkdownToGoogleSlides(content) {
    let slidesContent = '';
    
    // Split content into sections
    const sections = content.split('---');
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('# ')) {
          // Main title - use for slide title
          slidesContent += `**SLIDE TITLE:** ${trimmedLine.substring(2)}\n\n`;
        } else if (trimmedLine.startsWith('## ')) {
          // Section header
          slidesContent += `**Header:** ${trimmedLine.substring(3)}\n`;
        } else if (trimmedLine.startsWith('### ')) {
          // Sub header
          slidesContent += `**Sub-header:** ${trimmedLine.substring(4)}\n`;
        } else if (trimmedLine.startsWith('- ')) {
          // Bullet point
          slidesContent += `• ${trimmedLine.substring(2)}\n`;
        } else if (trimmedLine.startsWith('> ')) {
          // Quote/emphasis
          slidesContent += `"${trimmedLine.substring(2)}"\n`;
        } else if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*')) {
          // Emphasis
          slidesContent += `*${trimmedLine.substring(1, trimmedLine.length - 1)}*\n`;
        } else if (trimmedLine.length > 0) {
          // Regular content
          slidesContent += `${trimmedLine}\n`;
        }
      });
      
      slidesContent += '\n';
    });
    
    return slidesContent;
  }

  /**
   * Generate PPTX format (basic structure)
   */
  async generatePPTX() {
    let pptxContent = '# PowerPoint Export\n\n';
    pptxContent += '## 📊 PPTX Structure\n\n';
    pptxContent += 'This export provides a structured outline for creating PowerPoint slides.\n\n';
    
    // Add slide structure
    this.slides.forEach((slide, index) => {
      pptxContent += `### Slide ${index + 1}: ${slide.title}\n\n`;
      pptxContent += `**Layout Type:** ${slide.type}\n`;
      pptxContent += `**Theme:** RinaWarp Mermaid\n\n`;
      
      // Extract main content points
      const contentPoints = this.extractContentPoints(slide.content);
      pptxContent += `**Content Points:**\n`;
      contentPoints.forEach(point => {
        pptxContent += `- ${point}\n`;
      });
      
      pptxContent += '\n**Visual Elements:**\n';
      pptxContent += '- RinaWarp Mermaid gradient background\n';
      pptxContent += '- Infinity symbol in headers\n';
      pptxContent += '- Holographic text effects\n';
      pptxContent += '- Neon accent colors\n\n';
      
      pptxContent += '---\n\n';
    });
    
    const filepath = path.join(this.outputPath, 'powerpoint-structure.md');
    await fs.writeFile(filepath, pptxContent, 'utf8');
    
    return 'pptx';
  }

  /**
   * Generate Canva import format
   */
  async generateCanva() {
    let canvaContent = '# Canva Import Instructions\n\n';
    canvaContent += '## 🎨 Canva Design Guide\n\n';
    canvaContent += 'Import this content into Canva to create stunning presentations.\n\n';
    
    // Add design specifications
    canvaContent += '## 📐 Design Specifications\n\n';
    canvaContent += '**Canvas Size:** 1920 x 1080 px (16:9)\n';
    canvaContent += '**Background:** RinaWarp Mermaid gradient\n';
    canvaContent += '**Primary Font:** Poppins\n';
    canvaContent += '**Secondary Font:** Montserrat\n';
    canvaContent += '**Color Palette:** Hot pink, coral, teal, baby blue, black\n\n';
    
    // Add slide templates
    canvaContent += '## 🎭 Slide Templates\n\n';
    
    const templates = [
      'Title Slide Template',
      'Content Slide Template', 
      'Quote Slide Template',
      'Feature Slide Template',
      'CTA Slide Template'
    ];
    
    for (const template of templates) {
      canvaContent += '- **' + template + '**: Create in Canva or use built-in templates\n';
    }
    
    canvaContent += '\n---\n\n';
    
    // Add slides with Canva-specific formatting
    this.slides.forEach((slide, index) => {
      canvaContent += `## Canva Slide ${index + 1}: ${slide.title}\n\n`;
      
      const canvaContentFormatted = this.formatForCanva(slide.content);
      canvaContent += canvaContentFormatted;
      
      canvaContent += '\n**Canva Elements to Add:**\n';
      canvaContent += '- Infinity symbols (text elements)\n';
      canvaContent += '- RinaWarp gradient backgrounds\n';
      canvaContent += '- Neon glow effects (Canva effects)\n';
      canvaContent += '- Modern icons from icon library\n\n';
      
      canvaContent += '---\n\n';
    });
    
    const filepath = path.join(this.outputPath, 'canva-import-guide.md');
    await fs.writeFile(filepath, canvaContent, 'utf8');
    
    return 'canva';
  }

  /**
   * Format content for Canva
   */
  formatForCanva(content) {
    let formatted = '';
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        formatted += `**SLIDE TITLE:** ${trimmed.substring(2)}\n\n`;
      } else if (trimmed.startsWith('## ')) {
        formatted += `Header: ${trimmed.substring(3)}\n`;
      } else if (trimmed.startsWith('### ')) {
        formatted += `Subheader: ${trimmed.substring(4)}\n`;
      } else if (trimmed.startsWith('- ')) {
        formatted += `• ${trimmed.substring(2)}\n`;
      } else if (trimmed.length > 0) {
        formatted += `${trimmed}\n`;
      }
    });
    
    return formatted;
  }

  /**
   * Generate PDF format (basic)
   */
  async generatePDF() {
    let pdfContent = '# PDF Export Guide\n\n';
    pdfContent += '## 📄 PDF Creation Instructions\n\n';
    pdfContent += 'Convert your presentation to PDF for sharing and printing.\n\n';
    
    // Add conversion steps
    pdfContent += '### Method 1: Google Slides to PDF\n';
    pdfContent += '1. Open your Google Slides presentation\n';
    pdfContent += '2. File > Download > PDF Document (.pdf)\n';
    pdfContent += '3. Choose "Paper size: 16:9" and "Include speaker notes"\n\n';
    
    pdfContent += '### Method 2: PowerPoint to PDF\n';
    pdfContent += '1. Open your PowerPoint presentation\n';
    pdfContent += '2. File > Export > Create PDF/XPS\n';
    pdfContent += '3. Select "Optimize for: Print (higher quality)"\n\n';
    
    pdfContent += '### Method 3: Canva to PDF\n';
    pdfContent += '1. Complete your Canva presentation\n';
    pdfContent += '2. Download > PDF Print\n';
    pdfContent += '3. Select "PDF (Print)" for best quality\n\n';
    
    const filepath = path.join(this.outputPath, 'pdf-export-guide.md');
    await fs.writeFile(filepath, pdfContent, 'utf8');
    
    return 'pdf';
  }

  /**
   * Extract main content points from slide content
   */
  extractContentPoints(content) {
    const points = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        points.push(trimmed.substring(2));
      } else if (trimmed.startsWith('### ')) {
        points.push(trimmed.substring(4));
      }
    });
    
    return points;
  }
}

module.exports = ExportFormatters;