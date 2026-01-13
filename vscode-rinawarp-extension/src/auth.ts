import * as vscode from "vscode";
import { getBaseUrl, postJson } from "./http";

export async function login(ctx: vscode.ExtensionContext, email: string, password: string) {
  const base = getBaseUrl();
  const res = await postJson<{ ok: boolean; token?: string; error?: string }>(`${base}/api/vscode/login`, {
    email,
    password,
  });
  if (!res.ok || !res.token) throw new Error(res.error ?? "Login failed");
  await ctx.secrets.store("rinawarp.token", res.token);
  return res.token;
}

export async function getStoredToken(ctx: vscode.ExtensionContext): Promise<string | undefined> {
  return ctx.secrets.get("rinawarp.token");
}

export async function clearToken(ctx: vscode.ExtensionContext): Promise<void> {
  await ctx.secrets.delete("rinawarp.token");
}
