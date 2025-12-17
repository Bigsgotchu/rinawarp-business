#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const basicPath = path.join(process.cwd(), "test-results-basic.json");
  const fullPath = path.join(process.cwd(), "test-results-comprehensive.json");

  const basic = JSON.parse(fs.readFileSync(basicPath, "utf8"));
  const full = JSON.parse(fs.readFileSync(fullPath, "utf8"));

  const prompt = `
You are a senior QA engineer for a desktop Electron app called RinaWarp Terminal Pro.

Here are two JSON test result payloads: one basic, one comprehensive.
Analyze:

- Which areas of the system are most risky?
- Any tests that indicate flaky behavior?
- Any missing test categories you can infer?
- Top 5 recommendations before shipping a major release.

Basic results:
${JSON.stringify(basic, null, 2)}

Comprehensive results:
${JSON.stringify(full, null, 2)}
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a senior QA engineer analyzing test results." },
      { role: "user", content: prompt }
    ]
  });

  const content = res.choices[0].message.content;
  const out = [
    "# AI QA Summary — RinaWarp Terminal Pro",
    "",
    content,
  ].join("\n");

  const outPath = path.join(process.cwd(), "AI-QA-REPORT.md");
  fs.writeFileSync(outPath, out, "utf8");
  console.log(`✅ AI QA report written to ${outPath}`);
}

main().catch((err) => {
  console.error("AI QA failed:", err);
  process.exit(0); // don't break CI if AI fails
});