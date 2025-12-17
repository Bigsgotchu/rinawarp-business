// Social Media Campaign Starter
// This script helps you post optimized content across all platforms

import fs from 'fs';

console.log('🚀 RinaWarp Social Media Campaign Starter');
console.log('==========================================\n');

// Read the social media content
const socialContent = fs.readFileSync('SOCIAL-MEDIA-CONTENT.md', 'utf8');

// Extract Twitter posts
const twitterPosts =
  socialContent.match(/### Post \d+ \(.*?\)\n```twitter\n(.*?)\n```/gs) || [];
const linkedinPosts =
  socialContent.match(/### Post \d+ \(.*?\)\n```bash\n(.*?)\n```/gs) || [];
const redditPosts =
  socialContent.match(/### r\/.*?\n```bash\n(.*?)\n```/gs) || [];

console.log('📱 TWITTER/X CAMPAIGN');
console.log('=====================');
console.log('Post these tweets in order, 1 per day:\n');

twitterPosts.forEach((post, index) => {
  const content = post.match(/```twitter\n(.*?)\n```/s)?.[1] || '';
  if (content) {
    console.log(`Day ${index + 1}:`);
    console.log(content);
    console.log('');
  }
});

console.log('\n💼 LINKEDIN CAMPAIGN');
console.log('====================');
console.log('Post these on LinkedIn, 1 per week:\n');

linkedinPosts.forEach((post, index) => {
  const content = post.match(/```bash\n(.*?)\n```/s)?.[1] || '';
  if (content) {
    console.log(`Week ${index + 1}:`);
    console.log(content);
    console.log('');
  }
});

console.log('\n🔴 REDDIT CAMPAIGN');
console.log('==================');
console.log('Post in these subreddits:\n');

redditPosts.forEach((post, index) => {
  const content = post.match(/```bash\n(.*?)\n```/s)?.[1] || '';
  if (content) {
    console.log(`Post ${index + 1}:`);
    console.log(content);
    console.log('');
  }
});

console.log('\n🎯 IMMEDIATE ACTIONS');
console.log('====================');
console.log('1. Copy the Twitter posts and schedule them');
console.log('2. Post the LinkedIn content this week');
console.log('3. Submit to Reddit and Hacker News');
console.log('4. Share on your personal social media');
console.log('5. Ask friends to share and engage');
console.log('\n📊 EXPECTED RESULTS');
console.log('===================');
console.log('Week 1: 100+ new visitors');
console.log('Week 2: 500+ new visitors');
console.log('Week 3: 1,000+ new visitors');
console.log('Week 4: 2,000+ new visitors');
console.log('\n🚀 Ready to launch your traffic campaign!');
