import { URL } from 'node:url';
export class NetworkGate {
    offline = false;
    allowHosts = new Set();
    setOffline(offline) {
        this.offline = offline;
    }
    setAllowHosts(hosts) {
        this.allowHosts = new Set(hosts.map((h) => h.toLowerCase()));
    }
    assertAllowedUrl(urlLike) {
        if (!this.offline)
            return;
        const u = new URL(urlLike);
        const host = u.host.toLowerCase();
        if (!this.allowHosts.has(host)) {
            throw new Error(`Network is offline; blocked request to ${host}`);
        }
    }
    assertAllowedRequestOptions(opts) {
        if (!this.offline)
            return;
        const host = String(opts.host || opts.hostname || '').toLowerCase();
        if (host && !this.allowHosts.has(host)) {
            throw new Error(`Network is offline; blocked request to ${host}`);
        }
    }
}
