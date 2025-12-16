#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

function exists(p) {
  return fs.existsSync(path.resolve(p));
}

function header(title) {
  console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.cyan(`🔍 ${title}`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
}

function ok(msg) {
  console.log(chalk.green(`✔ ${msg}`));
}

function warn(msg) {
  console.log(chalk.yellow(`⚠ ${msg}`));
}

function bad(msg) {
  console.log(chalk.red(`✘ ${msg}`));
}

// MAIN SCAN
export function scanRepo() {
  header('RinaWarp Repo Sanity Scan — rinawarp-business');

  // Required top-level folders
  const requiredTop = ['apps', 'services', 'scripts', 'netlify.toml', 'package.json'];

  header('Checking core folders');
  requiredTop.forEach((item) => {
    exists(item) ? ok(`${item} exists`) : bad(`${item} is missing`);
  });

  // Check apps structure
  header('Checking apps folder');
  const apps = ['apps/website', 'apps/rw-terminal'];

  apps.forEach((app) => {
    exists(app) ? ok(`${app} exists`) : bad(`${app} is missing`);
  });

  // Check website structure
  header('Checking website structure');
  const websiteRequired = ['apps/website/src', 'apps/website/public', 'apps/website/dist'];

  websiteRequired.forEach((dir) => {
    exists(dir) ? ok(`${dir} exists`) : warn(`${dir} missing (will prevent build/deploy)`);
  });

  // Required website pages
  const pages = [
    'index.html',
    'terminal-pro.html',
    'music-video-creator.html',
    'pricing.html',
    'download.html',
    'about.html',
    'contact.html',
    'privacy.html',
    'terms.html',
  ];

  header('Checking website pages');
  pages.forEach((page) => {
    const file = `apps/website/public/${page}`;
    exists(file) ? ok(page) : warn(`${page} missing`);
  });

  // Terminal app checks
  header('Checking Terminal Pro app');
  const terminalDist = 'apps/rw-terminal/dist';
  exists(terminalDist)
    ? ok('Terminal Pro dist exists')
    : warn('Terminal Pro dist missing — build required');

  // Services / API checks
  header('Checking backend services');
  const services = ['services/api', 'services/auth-service', 'services/gateway'];

  services.forEach((svc) => {
    exists(svc) ? ok(`${svc} exists`) : bad(`${svc} missing`);
  });

  // Environment variables
  header('Checking environment variables');
  const envs = ['RW_ADMIN_EMAIL', 'RW_ADMIN_PASSWORD'];

  envs.forEach((env) => {
    process.env[env] ? ok(`${env} is set`) : warn(`${env} is NOT set`);
  });

  // Scripts / CLI
  header('Checking CLI scripts');
  const cliFiles = [
    'scripts/rw-cli/rw.js',
    'scripts/rw-cli/commands/build.js',
    'scripts/rw-cli/commands/deploy.js',
    'scripts/rw-cli/commands/verify.js',
    'scripts/rw-cli/commands/scan.js',
  ];

  cliFiles.forEach((file) => {
    exists(file) ? ok(`${file} exists`) : warn(`${file} missing (CLI incomplete)`);
  });

  header('Sanity Scan Complete');
  console.log(chalk.magenta('\nReview warnings and errors above to fix repo issues.\n'));
}

export function scanFix() {
  console.log(chalk.magenta('\n🛠 RinaWarp Auto-Fix Mode Enabled\n'));

  const repairs = [];

  // Website folder repair
  if (!exists('apps/website')) {
    fs.mkdirSync('apps/website', { recursive: true });
    repairs.push('Created apps/website/');
  }
  if (!exists('apps/website/public')) {
    fs.mkdirSync('apps/website/public', { recursive: true });
    repairs.push('Created apps/website/public/');
  }
  if (!exists('apps/website/src')) {
    fs.mkdirSync('apps/website/src', { recursive: true });
    repairs.push('Created apps/website/src/');
  }

  // Default pages creation
  const defaultPages = {
    'index.html': '<!-- TODO: Homepage template -->',
    'terminal-pro.html': '<!-- Missing: Terminal Pro Page -->',
    'music-video-creator.html': '<!-- Missing: MVC Page -->',
    'pricing.html': '<!-- Pricing Page Placeholder -->',
    'download.html': '<!-- Download Page Placeholder -->',
    'about.html': '<!-- About Page Placeholder -->',
    'contact.html': '<!-- Contact Page Placeholder -->',
    'privacy.html': '<!-- Privacy Policy Placeholder -->',
    'terms.html': '<!-- Terms Placeholder -->',
  };

  Object.entries(defaultPages).forEach(([file, content]) => {
    const full = `apps/website/public/${file}`;
    if (!exists(full)) {
      fs.writeFileSync(full, content);
      repairs.push(`Created missing page: ${file}`);
    }
  });

  // dist folder creation
  if (!exists('apps/website/dist')) {
    fs.mkdirSync('apps/website/dist', { recursive: true });
    repairs.push('Created empty website dist folder');
  }

  // Terminal dist folder
  if (!exists('apps/rw-terminal/dist')) {
    fs.mkdirSync('apps/rw-terminal/dist', { recursive: true });
    repairs.push('Created Terminal Pro dist folder');
  }

  // CLI repair
  const cliRequired = [
    'scripts/rw-cli/commands/build.js',
    'scripts/rw-cli/commands/deploy.js',
    'scripts/rw-cli/commands/verify.js',
    'scripts/rw-cli/commands/scan.js',
  ];

  cliRequired.forEach((file) => {
    if (!exists(file)) {
      fs.writeFileSync(file, '// TODO: Implement');
      repairs.push(`Scaffolded missing CLI file: ${file}`);
    }
  });

  // Report
  console.log(chalk.cyan('\n🧩 Auto-Repair Summary\n'));
  repairs.forEach((r) => console.log(chalk.green(`✔ ${r}`)));

  console.log(chalk.green('\n✨ Auto-Fix Mode Completed Successfully!\n'));
}
