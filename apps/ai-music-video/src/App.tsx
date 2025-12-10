import React from 'react';
import RinaChatConsole from './components/RinaChatConsole';

function App() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top, var(--aimvc-neon-blue)0, transparent 45%), var(--aimvc-midnight)",
        color: "var(--brand-text)",
      }}
    >
      <RinaChatConsole />
    </div>
  );
}

export default App;
