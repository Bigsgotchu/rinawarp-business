export function lintPrompt(prompt) {
  console.log("\n🔍 RinaWarp Prompt Linter\n");

  const warnings = [];

  if (prompt.length < 10) warnings.push("Prompt is too short.");
  if (!/[.!?]/.test(prompt)) warnings.push("Prompt has no clear end punctuation.");
  if (prompt.includes("and also") || prompt.includes("while also")) warnings.push("Contains merged tasks — should be atomic.");

  if (/fix/i.test(prompt) && /build/i.test(prompt)) warnings.push("Mixing repair and build tasks is risky.");
  if (prompt.split(" ").length > 70) warnings.push("Prompt is very long — consider breaking it into steps.");

  if (warnings.length === 0) {
    console.log("✔ Prompt is clean and safe.\n");
  } else {
    console.log("⚠ Potential issues found:\n");
    warnings.forEach(w => console.log(" - " + w));
  }
}