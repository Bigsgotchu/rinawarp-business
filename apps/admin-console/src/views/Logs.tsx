import React, { useEffect, useState } from "react";
import { useAdmin } from "../lib/adminContext";
import { createApiClient, LogEntry } from "../lib/api";

export const Logs: React.FC = () => {
  const { apiToken } = useAdmin();
  const api = createApiClient(apiToken);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiToken) return;
    setLoading(true);
    setError(null);
    api
      .getLogs()
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiToken]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Worker & System Logs</h2>

      {error && (
        <div className="mb-3 text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden text-xs">
        <div className="max-h-[480px] overflow-auto font-mono">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border-b border-neutral-800 px-3 py-2 flex gap-2"
            >
              <div className="text-neutral-500 min-w-[145px]">
                {new Date(log.timestamp).toLocaleString()}
              </div>
              <div className="text-neutral-400 min-w-[170px]">
                {log.source}
              </div>
              <div
                className={
                  "min-w-[60px] " +
                  (log.level === "error"
                    ? "text-red-400"
                    : log.level === "warn"
                    ? "text-yellow-400"
                    : "text-neutral-400")
                }
              >
                {log.level.toUpperCase()}
              </div>
              <div className="flex-1 text-neutral-200">{log.message}</div>
            </div>
          ))}
          {!logs.length && (
            <div className="px-3 py-3 text-neutral-500">
              No logs received yet.
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="mt-3 text-xs text-neutral-500">Loading logs…</div>
      )}
    </div>
  );
};