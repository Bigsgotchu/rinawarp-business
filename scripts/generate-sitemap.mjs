#!/usr/bin/env node
/**
 * Generate sitemap.xml by scanning the built site.
 * Input  : BUILD_DIR (default apps/website/dist-website)
 * BaseURL: PAGES_BASE_URL (e.g., https://rinawarp-business.pages.dev) — optional; if missing, uses relative paths (valid for Pages).
 */
import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const BUILD_DIR = process.env.BUILD_DIR || 'apps/website/dist-website';
const BASE = (process.env.PAGES_BASE_URL || '').replace(/\/+$/, '');

if (!existsSync(BUILD_DIR)) {
  console.error(`[sitemap] build dir not found: ${BUILD_DIR}. Ensure your build ran.`);
  process.exit(1);
}

function walk(dir, out = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p, out);
    } else if (ent.isFile() && ent.name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(BUILD_DIR);

function urlFor(file) {
  // Convert /index.html → / ; about/index.html → /about/ ; foo.html → /foo.html
  const rel = relative(BUILD_DIR, file).split('\\').join('/');
  if (rel.endsWith('/index.html')) {
    return '/' + rel.replace(/\/index\.html$/, '/');
  }
  if (rel === 'index.html') {
    return '/';
  }
  return '/' + rel;
}

function priorityFor(pathname) {
  return pathname === '/' ? '1.0' : pathname.split('/').filter(Boolean).length <= 1 ? '0.8' : '0.6';
}

const urls = files.map((f) => {
  const locPath = urlFor(f);
  const loc = BASE ? BASE + locPath : locPath;
  const lastmod = statSync(f).mtime.toISOString();
  const priority = priorityFor(locPath);
  return { loc, lastmod, priority };
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) =>
    [
      '  <url>',
      `    <loc>${escapeXml(u.loc)}</loc>`,
      `    <lastmod>${u.lastmod}</lastmod>`,
      `    <priority>${u.priority}</priority>`,
      '  </url>',
    ].join('\n'),
  ),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(BUILD_DIR, 'sitemap.xml'), xml);
console.log(`[sitemap] Wrote ${join(BUILD_DIR, 'sitemap.xml')} (${urls.length} URLs)`);

function escapeXml(s) {
  return s.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
}
