import React, { useState } from 'react';

declare global {
  interface Window {
    rw: {
      activate: (
        json: string
      ) => Promise<{ ok: boolean; source?: string; reason?: string }>;
      check: () => Promise<any>;
    };
  }
}

export default function ActivationModal({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const onActivate = async () => {
    setMsg('Verifying…');
    const res = await window.rw.activate(value.trim());
    if (res.ok) {
      setMsg(`Activated (${res.source || 'online'})`);
      setTimeout(onClose, 800);
    } else {
      setMsg(`Failed: ${res.reason || 'unknown'}`);
    }
  };

  return (
    <div
      className="bg-mermaid-ocean/90 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl p-6 shadow-glow max-w-2xl w-full"
      id="activation-modal-title"
      role="document"
    >
      <h2
        className="text-xl font-bold text-mermaid-cyan mb-4"
        id="activation-modal-title"
      >
        Activate Rinawarp Terminal Pro
      </h2>
      <p
        className="text-mermaid-text/80 mb-4"
        id="activation-modal-description"
      >
        Paste the license JSON you received after purchase.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={8}
        className="w-full bg-mermaid-ocean border border-mermaid-cyan/30 rounded-lg px-3 py-2 text-mermaid-text font-mono text-sm resize-none"
        placeholder='{"email":"...","plan":"pro","exp":1700000000,"signature":"..."}'
        aria-label="License JSON input"
        aria-describedby="activation-modal-description"
      />
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition-colors"
          aria-label="Close activation modal"
        >
          Close
        </button>
        <button
          onClick={onActivate}
          className="px-4 py-2 bg-mermaid-cyan hover:bg-mermaid-cyan/80 rounded-lg text-mermaid-ocean font-semibold transition-colors"
          aria-label="Activate license"
        >
          Activate
        </button>
      </div>
      {msg && (
        <p
          className={`mt-3 text-sm ${msg.includes('Activated') ? 'text-green-400' : 'text-red-400'}`}
          aria-live="polite"
        >
          {msg}
        </p>
      )}
    </div>
  );
}
