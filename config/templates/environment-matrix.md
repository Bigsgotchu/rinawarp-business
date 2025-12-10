# Environment Matrix (Template)

| Service              | Env File                | Deployment Target         |
|----------------------|-------------------------|---------------------------|
| Website              | .env.production         | Cloudflare Pages / Netlify|
| Terminal Pro Backend | secrets/.env.production | VPS / Docker / Node      |
| AI Music Video       | secrets/.env.production | VPS / Node                |
| License Worker       | cloudflare secrets      | Cloudflare Workers        |
| API Gateway          | secrets/.env.production | AWS Lambda / API Gateway  |

