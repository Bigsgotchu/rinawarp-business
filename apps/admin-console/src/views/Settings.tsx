import React, { useState } from "react";
import { useAdmin } from "../lib/adminContext";

export const Settings: React.FC = () => {
  const { apiToken, setApiToken } = useAdmin();
  const [localToken, setLocalToken] = useState(apiToken ?? "");

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>

      <section className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Admin API Token</h3>
        <p className="text-xs text-neutral-400 mb-3">
          This token is sent as <code className="font-mono">x-admin-secret</code> to
          locked admin functions. It must match{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> configured in Cloudflare
          Pages for this console project.
        </p>
        <input
          type="password"
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          placeholder="Enter admin token…"
          value={localToken}
          onChange={(e) => setLocalToken(e.target.value)}
        />
        <div className="mt-3 flex gap-2">
          <button
            className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500"
            onClick={() => setApiToken(localToken || null)}
          >
            Save
          </button>
          {apiToken && (
            <button
              className="px-3 py-1.5 text-sm rounded-lg bg-neutral-800 hover:bg-neutral-700"
              onClick={() => {
                setLocalToken("");
                setApiToken(null);
              }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-2">Environment</h3>
        <p className="text-xs text-neutral-400">
          This console is intended for internal use only and should be protected
          with Cloudflare Zero Trust (Access policies) to restrict access to your
          personal identity (e.g. email, SSO, passkey).
        </p>
      </section>
    </div>
  );
};