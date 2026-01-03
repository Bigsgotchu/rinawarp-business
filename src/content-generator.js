/**
 * Content Generator
 * Generates slide content, speaker notes, voiceover scripts, and social media content
 */

const { logger } = require('./utils/logger');

class ContentGenerator {
  constructor(config) {
    this.config = config;
    this.theme = config.theme || 'default';
    this.audience = config.audience;
    this.title = config.title;
    this.style = config.style || [];
    this.brandElements = config.brandElements || [];
    
    // Slide templates
    this.slideTemplates = {
      title: this.generateTitleSlide,
      intro: this.generateIntroSlide,
      content: this.generateContentSlide,
      feature: this.generateFeatureSlide,
      analogy: this.generateAnalogySlide,
      benefits: this.generateBenefitsSlide,
      demo: this.generateDemoSlide,
      pricing: this.generatePricingSlide,
      cta: this.generateCallToActionSlide,
      summary: this.generateSummarySlide
    };
  }

  /**
   * Generate all slides
   */
  async generateSlides() {
    const slides = [];
    
    for (let i = 0; i < this.config.sections.length; i++) {
      const section = this.config.sections[i];
      const slideType = this.determineSlideType(section, i);
      
      const slide = await this.generateSlide(section, slideType, i);
      slides.push(slide);
      
      logger.debug(`Generated slide ${i + 1}: ${section}`);
    }
    
    return slides;
  }

  /**
   * Generate individual slide
   */
  async generateSlide(section, type, index) {
    const template = this.slideTemplates[type] || this.slideTemplates.content;
    const content = await template.call(this, section, index);
    
    return {
      id: index + 1,
      title: section,
      type,
      content,
      theme: this.theme,
      brand: this.generateBrandElements()
    };
  }

  /**
   * Determine slide type based on section name
   */
  determineSlideType(section, index) {
    const lowerSection = section.toLowerCase();
    
    if (index === 0) return 'title';
    if (lowerSection.includes('title')) return 'title';
    if (lowerSection.includes('pricing')) return 'pricing';
    if (lowerSection.includes('call to action') || lowerSection.includes('cta')) return 'cta';
    if (lowerSection.includes('analogy') || lowerSection.includes('simple')) return 'analogy';
    if (lowerSection.includes('feature') || lowerSection.includes('can do')) return 'feature';
    if (lowerSection.includes('benefit') || lowerSection.includes('love')) return 'benefits';
    if (lowerSection.includes('demo') || lowerSection.includes('quick fix')) return 'demo';
    if (lowerSection.includes('summary') || lowerSection.includes('key')) return 'summary';
    if (lowerSection.includes('intro') || lowerSection.includes('what') || lowerSection.includes('who')) return 'intro';
    
    return 'content';
  }

  /**
   * Generate brand elements
   */
  generateBrandElements() {
    return {
      colors: ['hot-pink', 'coral', 'teal', 'baby-blue', 'black'],
      logo: 'RinaWarp Technologies™',
      symbol: '∞∞',
      tagline: 'Digital Empowerment Simplified'
    };
  }

  /**
   * Generate title slide
   */
  async generateTitleSlide(section, index) {
    return `# ${this.title}
> ${section}

---

## 🎯 **The Future is Now**

**${this.audience} Edition**

*Your journey to digital empowerment starts here*

---

### 🌟 What You'll Discover
- How Terminal Pro transforms complex tasks
- Why thousands love this innovative approach  
- Your step-by-step transformation guide

---

*Powered by RinaWarp Technologies™*`;
  }

  /**
   * Generate intro slide
   */
  async generateIntroSlide(section, index) {
    const isWhat = section.toLowerCase().includes('what');
    const isWho = section.toLowerCase().includes('who');
    
    if (isWhat) {
      return `# What is Terminal Pro?

> ${section}

---

## 💡 **A Digital Superpower in Your Hands**

Think of Terminal Pro as your personal tech assistant that:

- **Speaks your language** - No complex jargon or confusing commands
- **Handles the hard stuff** - Does the technical work so you don't have to
- **Gets things done fast** - From quick fixes to complex builds

---

### ✨ It's Like Having a Tech Expert
- **On your team 24/7**
- **Understands your goals** 
- **Makes complex simple**

*Ready to unlock your potential?*`;
    }
    
    if (isWho) {
      return `# Who Is Terminal Pro For?

> ${section}

---

## 🎯 **Perfect for You If You:**

- ✅ Want to get things done without learning complex tech
- ✅ Need results fast without the overwhelm  
- ✅ Prefer simple explanations over technical documentation
- ✅ Value your time and want efficient solutions

---

### 🚀 **You're in Great Company**
- Entrepreneurs who want to focus on their business
- Creators who need tech to work seamlessly  
- Professionals who want to automate the boring stuff
- Anyone ready to level up their digital game

*No technical background required*`;
    }
    
    return `# ${section}

> Discover the power within

---

## 🌟 **Your Gateway to Digital Mastery**

This presentation will guide you through:

- **What Terminal Pro is** and why it matters
- **How it works** in simple, clear terms
- **What you can achieve** with this amazing tool
- **Your next steps** to get started

---

### 🎯 **Let's Begin Your Journey**

*Everything you need to know, explained simply*`;
  }

  /**
   * Generate feature slide
   */
  async generateFeatureSlide(section, index) {
    return `# What Terminal Pro Can Do

> ${section}

---

## 🔥 **Real Solutions for Real People**

### Quick Fix Mode ⚡
- **Instant problem solving** - Tell it what's broken, it fixes it
- **No guesswork** - Just describe the issue in plain English
- **Fast results** - Get back to what matters quickly

### Explain Anything 📚
- **Complex made simple** - Break down any technical topic
- **Your learning pace** - Ask questions, get clear answers
- **Build understanding** - Learn while you solve problems

### Do It For Me 🤖
- **Full automation** - Handle entire workflows for you
- **Smart execution** - Makes decisions so you don't have to
- **Quality results** - Professional outcomes every time

---

### ✨ **The Power is Yours**
*Every feature designed to make your life easier*`;
  }

  /**
   * Generate content slide
   */
  async generateContentSlide(section, index) {
    return `# ${section}

> ${section}

---

## 💎 **Key Points**

### 🔹 Point One
Clear explanation that speaks directly to you

### 🔹 Point Two  
Simple breakdown of the important concepts

### 🔹 Point Three
Actionable insights you can use right away

---

### 💡 **Why This Matters**
Understanding this helps you make better decisions and achieve your goals faster.

*Each element designed for maximum clarity and impact*`;
  }

  /**
   * Generate analogy slide
   */
  async generateAnalogySlide(section, index) {
    return `# The Simple Analogy

> ${section}

---

## 🎯 **Think of It Like This:**

### 🚗 **Your Car's GPS System**
- **GPS tells you** "Turn right in 500 feet"
- **You don't need to know** how GPS satellites work
- **You just get** where you want to go faster

### 💻 **Terminal Pro is Your Digital GPS**
- **It tells you** "Run this command to fix that"
- **You don't need to know** all the technical details
- **You just get** your problems solved efficiently

---

### ✨ **The Result:**
**You focus on your goals while the tech handles the complexity**

*It's that simple - and that's the beauty of it*`;
  }

  /**
   * Generate benefits slide
   */
  async generateBenefitsSlide(section, index) {
    return `# Why People Love Terminal Pro

> ${section}

---

## 💝 **What Users Are Saying:**

### ⏰ **"I save 5+ hours per week"**
*"What used to take me hours now takes minutes. I can finally focus on my actual work."*

### 🧠 **"It actually explains things clearly"**
*"Finally, someone who can break down complex tech into words I understand."*

### 🚀 **"It handles the boring stuff"**
*"No more getting stuck on setup or configuration. I just tell it what I need."*

### 🎯 **"Results are professional quality"**
*"Every solution feels like it came from an expert. The quality is incredible."*

---

### 🏆 **The Bottom Line:**
**Your time is valuable - Terminal Pro respects that**

*Join thousands who've already transformed their digital experience*`;
  }

  /**
   * Generate demo slide
   */
  async generateDemoSlide(section, index) {
    return `# Quick Fix Mode in Action

> ${section}

---

## 🎬 **Watch This:**

### Scenario: "My website is down"
**What you say:**
> "My website shows an error. Can you fix it?"

**What Terminal Pro does:**
1. 🔍 **Diagnoses** the problem automatically
2. 🛠️ **Fixes** the core issue  
3. ✅ **Verifies** everything works
4. 📊 **Reports** back what was done

### Result: **Problem solved in under 2 minutes**

---

### 💡 **The Magic:**
- **No technical knowledge required**
- **Clear communication** throughout
- **Professional results** every time

*Ready to see it in action?*`;
  }

  /**
   * Generate pricing slide
   */
  async generatePricingSlide(section, index) {
    return `# Getting Started

> ${section}

---

## 💎 **Choose Your Path**

### 🚀 **Starter**
- Quick fixes and explanations
- Perfect for trying it out
- *Best for occasional use*

### ⚡ **Professional** 
- Full automation and workflows
- Advanced features included
- *Most popular choice*

### 🏆 **Enterprise**
- Custom solutions and support
- Priority assistance
- *For power users*

---

### 🎁 **Ready to Begin?**
- **30-day guarantee** - Love it or get a full refund
- **Instant access** - Start using it immediately
- **Free onboarding** - We help you get set up

*Choose the plan that fits your goals*`;
  }

  /**
   * Generate call to action slide
   */
  async generateCallToActionSlide(section, index) {
    return `# Ready to Transform Your Digital Life?

> ${section}

---

## 🚀 **Your Next Step**

### 🎯 **Don't Wait - Your Competition Isn't**

While others struggle with complex tech, you'll be:

- ✅ **Solving problems** in minutes, not hours
- ✅ **Understanding concepts** with crystal clear explanations  
- ✅ **Automating workflows** like a pro
- ✅ **Focusing on what matters** while tech handles the rest

---

### 🔥 **Take Action Today**

**Start your 30-day journey now**
- Instant access to Terminal Pro
- Step-by-step onboarding included
- 30-day money-back guarantee

---

### 💎 **Your Digital Transformation Starts Now**

*Join thousands who've already made the switch*`;
  }

  /**
   * Generate summary slide
   */
  async generateSummarySlide(section, index) {
    return `# Key Features Summary

> ${section}

---

## 🌟 **What Makes Terminal Pro Special**

### ⚡ **Lightning Fast Results**
- Problems solved in minutes, not hours
- Instant explanations when you need them
- Quick fixes for everyday challenges

### 🧠 **Clear Communication**
- Complex tech explained simply
- No jargon or confusing terminology
- Learning happens naturally

### 🤖 **Full Automation**
- End-to-end workflow handling
- Smart decision making built in
- Professional results every time

---

### 🎯 **The Bottom Line**
**Terminal Pro gives you digital superpowers**

*No technical background required - just results you can feel*`;
  }

  /**
   * Generate speaker notes for all slides
   */
  async generateSpeakerNotes(slides) {
    let speakerNotes = '# Speaker Notes\n\n';
    
    slides.forEach((slide, index) => {
      speakerNotes += `## Slide ${index + 1}: ${slide.title}\n\n`;
      speakerNotes += `**Main Points:**\n`;
      speakerNotes += `- Start with enthusiasm and confidence\n`;
      speakerNotes += `- Make eye contact with audience\n`;
      speakerNotes += `- Pause for emphasis on key points\n`;
      speakerNotes += `- Ask rhetorical questions to engage\n\n`;
      speakerNotes += `**Key Messages:**\n`;
      speakerNotes += `- ${slide.title} builds toward the main goal\n`;
      speakerNotes += `- Connect back to audience's needs\n`;
      speakerNotes += `- Emphasize the benefits and value\n\n`;
      speakerNotes += `---\n\n`;
    });
    
    return speakerNotes;
  }

  /**
   * Generate voiceover scripts
   */
  async generateVoiceover(slides) {
    let voiceover = '# Voiceover Scripts\n\n';
    
    // 60-second version
    voiceover += '## 60-Second Version\n\n';
    voiceover += `[Upbeat, confident music begins]\n\n`;
    voiceover += `Hi there! Welcome to the future of digital empowerment. I'm here to introduce you to Terminal Pro - your personal tech superpower.\n\n`;
    voiceover += `Imagine having a tech expert in your pocket, ready to solve problems, explain concepts, and automate workflows whenever you need them. That's exactly what Terminal Pro delivers.\n\n`;
    voiceover += `Whether you're an entrepreneur, creator, or professional, Terminal Pro speaks your language. No complex jargon, no overwhelming technical documentation - just clear, simple solutions that get results.\n\n`;
    voiceover += `From quick fixes to complete automation, Terminal Pro handles the tech while you focus on what matters most - your goals and dreams.\n\n`;
    voiceover += `Ready to unlock your digital potential? Join thousands who've already transformed their digital experience. Your 30-day journey starts now.\n\n`;
    voiceover += `[Music fades - RinaWarp Technologies logo appears]`;
    
    // 30-second version
    voiceover += '\n\n## 30-Second Version\n\n';
    voiceover += `[Energetic music]\n\n`;
    voiceover += `Meet Terminal Pro - your digital superpower! No more struggling with complex tech or overwhelming documentation.\n\n`;
    voiceover += `Just tell it what you need, and Terminal Pro handles the rest - quick fixes, clear explanations, full automation. It's like having a tech expert on your team 24/7.\n\n`;
    voiceover += `Ready to transform your digital life? Start your 30-day journey today!\n\n`;
    voiceover += `[RinaWarp logo]`;
    
    return voiceover;
  }

  /**
   * Generate social media content
   */
  async generateSocialContent(slides) {
    let socialContent = '# Social Media Content Pack\n\n';
    
    // TikTok version
    socialContent += '## TikTok Hook (15 seconds)\n\n';
    socialContent += `**Hook:** "POV: You just discovered the tech tool that will change everything"\n\n`;
    socialContent += `**Script:**\n`;
    socialContent += `1. "Wait until you see what this AI can do..."\n`;
    socialContent += `2. [Show Terminal Pro in action]\n`;
    socialContent += `3. "No technical knowledge needed"\n`;
    socialContent += `4. "Link in bio to try it yourself"\n\n`;
    
    // Instagram carousel
    socialContent += '## Instagram Carousel (7-10 cards)\n\n';
    socialContent += `**Card 1:** Title slide with bold text "Terminal Pro"\n`;
    socialContent += `**Card 2:** "What is it?" with simple explanation\n`;
    socialContent += `**Card 3:** "Who is it for?" with target audience\n`;
    socialContent += `**Card 4:** "What can it do?" with key features\n`;
    socialContent += `**Card 5:** "Quick Demo" with before/after\n`;
    socialContent += `**Card 6:** "Social Proof" with testimonials\n`;
    socialContent += `**Card 7:** "Pricing" with plans\n`;
    socialContent += `**Card 8:** "Call to Action" with next steps\n\n`;
    
    // Twitter/X version
    socialContent += '## Twitter/X Thread\n\n';
    socialContent += `Tweet 1: "🧵 Thread: How I found the AI tool that changed everything"\n\n`;
    socialContent += `Tweet 2: "I was spending hours on tech problems that should take minutes. Then I discovered Terminal Pro..."\n\n`;
    socialContent += `Tweet 3: "It's like having a tech expert on your team 24/7. No jargon, just results. 🚀"\n\n`;
    socialContent += `Tweet 4: "Demo this ➡️ [show quick fix in action] ⬅️ Problem solved in 2 minutes"\n\n`;
    socialContent += `Tweet 5: "The best part? It actually teaches you while it works. Win-win. 🎓"\n\n`;
    socialContent += `Tweet 6: "Ready to stop wasting time on tech? Link below 👇"\n\n`;
    
    return socialContent;
  }
}

module.exports = ContentGenerator;