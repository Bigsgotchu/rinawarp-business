import React from "react";
import TerminalShell from "./Layout/TerminalShell";

// This is a wrapper component that will contain the existing terminal functionality
const TerminalView = () => {
  return (
    <div id="terminal-container" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* The existing terminal will be mounted here via the traditional JS approach */}
      <div id="terminal-content" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default function App() {
  return <TerminalShell TerminalView={TerminalView} />;
}