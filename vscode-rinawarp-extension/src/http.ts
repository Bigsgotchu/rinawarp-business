import fetch from 'node-fetch';

let baseUrl = 'https://www.rinawarptech.com';

export function getBaseUrl() { return baseUrl; }
export function setBaseUrl(url: string) { baseUrl = url; }

export async function postJson(endpoint: string, payload: any) {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}