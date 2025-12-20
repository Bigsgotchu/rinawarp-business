async function testOllama() {
  try {
    console.log("Testing Ollama connection with optimized settings...");
    
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5-coder:1.5b-base",
        prompt: "Hello, who are you?",
        stream: false,
        num_ctx: 2048,
        num_predict: 256,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    const json = await response.json();
    console.log("Response JSON:", JSON.stringify(json, null, 2));
    
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testOllama();
