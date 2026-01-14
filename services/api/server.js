import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5656;
// ✅ FIXED: Use 127.0.0.1 so it connects properly to Ollama
const MODEL_URL = "http://127.0.0.1:11434/api/generate"; // Ollama endpoint

// --- Simple memory store ---
let memory = {
  currentProject: null,
  recentTasks: []
};

// --- Helper: list project files ---
function getProjectFiles() {
  try {
    const files = fs.readdirSync(process.cwd());
    return files.filter(f => !f.startsWith(".")).slice(0, 25);
  } catch {
    return [];
  }
}

// --- Main RinaWarp handler ---
app.post("/context", async (req, res) => {
  const { prompt } = req.body;
  const files = getProjectFiles();

  const body = {
    model: "rina", // your Ollama model name
    prompt: `
You are RinaWarp, an adaptive terminal assistant helping complete a development project.
Project files: ${files.join(", ")}.
Memory: ${JSON.stringify(memory)}.
User request: ${prompt}
Your goal: respond clearly and specify next actionable steps to finish this task effectively.
    `
  };

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    res.send(text);
  } catch (err) {
    console.error("Bridge error:", err);
    res.status(500).send("Error connecting to model");
  }
});

// --- Safe command execution sandbox (placeholder) ---
app.post("/run", async (req, res) => {
  const { command } = req.body;
  console.log("Executing:", command);
  res.send(`Pretending to run: ${command}`); // sandboxed for now
});

app.listen(PORT, () => {
  console.log(`🛰️ RinaWarp Bridge active → http://localhost:${PORT}`);
});

