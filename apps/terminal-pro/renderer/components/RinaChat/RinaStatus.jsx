import React from 'react';

export default function RinaStatus({ rina }) {
  if (!rina) return null;

  return (
    <div className="rina-status">
      <div>🧠 Intent: {rina.intent}</div>
      <div>🎭 Tone: {rina.tone}</div>
      <div>🫀 Emotion: {rina.emotion}</div>
      <div>🗂️ Project: {rina.project}</div>
    </div>
  );
}
