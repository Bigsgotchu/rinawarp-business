// ✅ scripts/inject-csp.js
import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('dist/index.html');

if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Allow inline styles & scripts (safe for dev/electron)
  const csp = `
  default-src 'self';
  script-src 'self' https://js.stripe.com https://checkout.stripe.com https://static.cloudflareinsights.com 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob: https://*.stripe.com;
  connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://*.rinawarptech.com;
  frame-src https://js.stripe.com https://checkout.stripe.com;
  base-uri 'self';
  form-action 'self' https://checkout.stripe.com;
  `;

  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '');

  html = html.replace(
    '</head>',
    `<meta http-equiv="Content-Security-Policy" content="${csp.replace(/\s+/g, ' ')}"></head>`
  );

  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(
    '✅ Injected relaxed Content Security Policy into dist/index.html'
  );
} else {
  console.warn('⚠️ dist/index.html not found – did you run vite build?');
}
