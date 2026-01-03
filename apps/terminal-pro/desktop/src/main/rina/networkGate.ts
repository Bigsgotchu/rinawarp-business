import type { ClientRequestArgs } from 'node:http';
import { URL } from 'node:url';

export class NetworkGate {
  private offline = false;
  private allowHosts = new Set<string>();

  public setOffline(offline: boolean): void {
    this.offline = offline;
  }

  public setAllowHosts(hosts: string[]): void {
    this.allowHosts = new Set(hosts.map((h) => h.toLowerCase()));
  }

  public assertAllowedUrl(urlLike: string): void {
    if (!this.offline) return;

    const u = new URL(urlLike);
    const host = u.host.toLowerCase();

    if (!this.allowHosts.has(host)) {
      throw new Error(`Network is offline; blocked request to ${host}`);
    }
  }

  public assertAllowedRequestOptions(opts: ClientRequestArgs): void {
    if (!this.offline) return;

    const host = String((opts as any).host || (opts as any).hostname || '').toLowerCase();
    if (host && !this.allowHosts.has(host)) {
      throw new Error(`Network is offline; blocked request to ${host}`);
    }
  }
}
