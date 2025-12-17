// tests/utils/api-request.js
import chalk from "chalk";

export async function apiRequest({
  base,
  path,
  method = "GET",
  body,
  token,
  timeoutMs = 15000,
}) {
  const url = `${base}${path}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(id);
    console.log(chalk.red(`  ✘ Request failed: ${url}`));
    console.log(chalk.red(`    ${err.message}`));
    return { ok: false, error: err };
  }

  clearTimeout(id);

  let json = null;
  try {
    const text = await res.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON is allowed
  }

  return {
    ok: res.ok,
    status: res.status,
    headers: res.headers,
    json,
  };
}