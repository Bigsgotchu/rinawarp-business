import React from "react";
import "./rina-chat.css";

export default function RinaChatMessage({ sender, text }) {
  const isRina = sender === "rina";

  return (
    <div className={`chat-message ${isRina ? "rina" : "user"}`}>
      <div className="bubble">{text}</div>
    </div>
  );
}