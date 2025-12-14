import express from "express";
import bodyParser from "body-parser";
import { handleCommand } from "./tools/handleCommand.js";
import { handleChat } from "./chat/handleChat.js";

const app = express();
app.use(bodyParser.json());

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const { model, messages } = req.body;

    if (model !== "rina-agent") {
      return res.status(400).json({
        error: `Model not found: ${model}`,
      });
    }

    const userMessage = messages[messages.length - 1]?.content ?? "";

    const reply = await handleChat(messages, model);

    res.json({
      id: "rina-local",
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "rina-agent",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: reply,
          },
          finish_reason: "stop",
        },
      ],
    });
  } catch (err) {
    console.error("chat error", err);
    res.status(500).json({ error: "internal_error" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { messages, model } = req.body;
    const reply = await handleChat(messages, model);
    res.json(reply);
  } catch (error) {
    console.error("Chat handler error:", error);
    res.json({
      choices: [{
        message: {
          role: 'assistant',
          content: `Error processing chat request: ${error.message}`
        }
      }]
    });
  }
});

app.post("/tool", async (req, res) => {
  try {
    const result = await handleCommand(req.body);
    res.json(result);
  } catch (error) {
    console.error("Tool handler error:", error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

// OpenAI-compatible models listing for clients that probe /v1/models
app.get("/v1/models", (_req, res) => {
  res.json({
    object: "list",
    data: [
      {
        id: "rina-agent",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "local",
      },
    ],
  });
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🧠 Rina Agent running on http://127.0.0.1:${PORT}`);
});
