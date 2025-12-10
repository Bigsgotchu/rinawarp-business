import React from "react";

type Props = {
  label: string;
  value: string;
  hint?: string;
};

export const StatCard: React.FC<Props> = ({ label, value, hint }) => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
    <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
  </div>
);