// src/components/RinaChat.jsx
import { useState } from 'react';

function RinaChat() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleAsk = async () => {
    const res = await window.electronAPI.askRina(input);
    setResponse(res);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧠 Rina AI Assistant</h2>
      <textarea
        rows={4}
        style={{ width: '100%' }}
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br />
      <button onClick={handleAsk}>Ask Rina</button>
      <pre>{response}</pre>
    </div>
  );
}

export default RinaChat;
