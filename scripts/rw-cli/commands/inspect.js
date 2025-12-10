import fs from "fs";
import path from "path";

export function inspect() {
  console.log("\n🔎 RinaWarp Repo Inspector\n");

  const findings = [];

  function scan(dir) {
    fs.readdirSync(dir).forEach(file => {
      const full = path.join(dir, file);

      if (fs.statSync(full).isDirectory()) {
        scan(full);
      } else if (file.endsWith(".ts") || file.endsWith(".js")) {
        const content = fs.readFileSync(full, "utf8");

        if (content.includes("..")) {
          findings.push("Relative path climbing in " + full);
        }
        if (!content.includes("export") && !content.includes("import")) {
          findings.push("Possibly unused file: " + full);
        }
      }
    });
  }

  scan(".");

  if (findings.length === 0) {
    console.log("✔ No issues found.\n");
  } else {
    console.log("⚠ Findings:\n");
    findings.forEach(f => console.log(" - " + f));
  }
}