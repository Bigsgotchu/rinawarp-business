import * as vscode from "vscode";
import nodeFetch from "node-fetch";

const fetch = nodeFetch;

export type Json = Record<string, unknown>;

export async function postJson<T>(url: string, body: Json): Promise<T> {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status} ${resp.statusText}: ${text.slice(0, 500)}`);
  }

  return (await resp.json()) as T;
}

export function getBaseUrl(): string {
  const cfg = vscode.workspace.getConfiguration("rinawarp");
  return cfg.get<string>("baseUrl", "http://127.0.0.1:8787");
}