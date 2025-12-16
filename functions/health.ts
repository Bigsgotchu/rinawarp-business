// Cloudflare Pages Function for health endpoint
interface Env {
  npm_package_version?: string;
  CF_ENV?: string;
}

interface Context {
  env: Env;
  request: Request;
}

export const onRequestGet = async (context: Context): Promise<Response> => {
  // Cloudflare env hints + GitHub runner envs (when deployed via CI)
  const version = context.env?.npm_package_version || process.env.npm_package_version || null;
  const commit =
    process.env.GITHUB_SHA?.slice(0, 7) || (context.request.headers.get('x-commit') ?? null);
  const branch = process.env.CF_BRANCH || process.env.GITHUB_REF_NAME || null;
  const envName =
    context.env?.CF_ENV ||
    process.env.CF_ENV ||
    (context.request.url.includes('pages.dev') ? 'preview' : 'production');

  const body = {
    status: 'ok',
    version,
    commit,
    branch,
    env: envName,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
};
