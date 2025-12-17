import React from "react";
import "./rina-chat.css";

export default function RinaTypingIndicator() {
  return (
    <div className="typing">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="typing-label">Rina is thinking…</span>
    </div>
  );
}