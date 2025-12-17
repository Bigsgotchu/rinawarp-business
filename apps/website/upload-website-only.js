#!/usr/bin/env node
// RinaWarp Terminal Pro - Upload Website Only (Fast)
// Uploads only the essential website files, not the app bundles

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: 'us-east-1',
});

// Essential files to upload (website only)
const essentialFiles = [
  'index.html',
  'pricing.html',
  'license-system.js',
  'version.json',
  'README.md',
  'INSTALLATION-GUIDE.md',
  'DEPLOYMENT-INSTRUCTIONS.md',
  'WEBSITE-README.md',
  'DEPLOYMENT-INFO.txt',
];

// Directories to upload (without node_modules)
const essentialDirs = [
  'web',
  'windows/RinaWarp-Terminal-Pro-Windows/app',
  'linux/rinawarp-terminal-pro',
];

async function uploadWebsiteOnly() {
  const deployDir = process.argv[2];

  if (!deployDir) {
    console.error('❌ Please provide deployment directory');
    console.log('Usage: node upload-website-only.js <deployment-directory>');
    process.exit(1);
  }

  if (!fs.existsSync(deployDir)) {
    console.error(`❌ Directory not found: ${deployDir}`);
    process.exit(1);
  }

  console.log('🚀 Uploading RinaWarp Terminal Pro Website (Fast Mode)...');
  console.log(`📁 Source: ${deployDir}`);
  console.log('🪣 Bucket: rinawarp-downloads');
  console.log('');

  try {
    // Upload essential files
    console.log('📄 Uploading essential files...');
    for (const file of essentialFiles) {
      const filePath = path.join(deployDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`  📄 ${file}`);
        await uploadFile(filePath, file);
      }
    }

    // Upload essential directories (excluding node_modules)
    console.log('📁 Uploading essential directories...');
    for (const dir of essentialDirs) {
      const dirPath = path.join(deployDir, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`  📁 ${dir}`);
        await uploadDirectory(dirPath, dir, true); // Skip node_modules
      }
    }

    // Create a simple download page for the macOS app
    console.log('🍎 Creating macOS download page...');
    const macosDownloadPage = `
<!DOCTYPE html>
<html>
<head>
    <title>RinaWarp Terminal Pro - macOS Download</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .download-btn { background: #007AFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px; }
    </style>
</head>
<body>
    <h1>🧜‍♀️ RinaWarp Terminal Pro - macOS</h1>
    <p>Download the macOS application</p>
    <a href="https://rinawarp-downloads.s3.amazonaws.com/macos/RinaWarp Terminal Pro.app" class="download-btn">Download macOS App</a>
    <p><small>Note: The macOS app is large (~1.8GB). Download may take a few minutes.</small></p>
</body>
</html>`;

    await uploadString(macosDownloadPage, 'macos/index.html', 'text/html');

    console.log('');
    console.log('✅ Website upload complete!');
    console.log('🌐 Your website is now available at:');
    console.log('   https://rinawarp-downloads.s3.amazonaws.com');
    console.log('');
    console.log('🧪 Test your website:');
    console.log('   1. Open https://rinawarp-downloads.s3.amazonaws.com');
    console.log('   2. Test all buttons and functionality');
    console.log('   3. Verify downloads work');
    console.log('');
    console.log('📱 Available downloads:');
    console.log('   - Web version: https://rinawarp-downloads.s3.amazonaws.com/web/');
    console.log('   - Windows: https://rinawarp-downloads.s3.amazonaws.com/windows/');
    console.log('   - Linux: https://rinawarp-downloads.s3.amazonaws.com/linux/');
    console.log('   - macOS: https://rinawarp-downloads.s3.amazonaws.com/macos/');
    console.log('');
    console.log('🎉 RinaWarp Terminal Pro website is live! 🧜‍♀️✨');
  } catch (error) {
    console.error('❌ Upload failed:', error.message);

    if (error.code === 'CredentialsError') {
      console.log('');
      console.log('🔑 AWS Credentials Issue:');
      console.log('   You need to configure AWS credentials first.');
      console.log('');
      console.log('Option 1: Set environment variables');
      console.log('   export AWS_ACCESS_KEY_ID=your_access_key');
      console.log('   export AWS_SECRET_ACCESS_KEY=your_secret_key');
      console.log('');
      console.log('Option 2: Use manual upload (see QUICK-UPLOAD-GUIDE.md)');
    }

    process.exit(1);
  }
}

async function uploadDirectory(dirPath, prefix, skipNodeModules = false) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const file of files) {
    // Skip node_modules and other large directories
    if (skipNodeModules && (file.name === 'node_modules' || file.name === '.git')) {
      continue;
    }

    const fullPath = path.join(dirPath, file.name);
    const key = `${prefix}/${file.name}`;

    if (file.isDirectory()) {
      await uploadDirectory(fullPath, key, skipNodeModules);
    } else {
      await uploadFile(fullPath, key);
    }
  }
}

async function uploadFile(filePath, key) {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: 'rinawarp-downloads',
    Key: key,
    Body: fileContent,
    ContentType: getContentType(filePath),
  };

  await s3Client.send(new PutObjectCommand(params));
}

async function uploadString(content, key, contentType) {
  const params = {
    Bucket: 'rinawarp-downloads',
    Key: key,
    Body: content,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.zip': 'application/zip',
    '.app': 'application/octet-stream',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
  };
  return types[ext] || 'application/octet-stream';
}

// Run the upload
uploadWebsiteOnly();
