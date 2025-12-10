import fs from "fs";

export function testgen(name) {
  const file = `tests/${name}.test.ts`;

  const template = `
import { describe, it, expect } from "vitest";

describe("${name}", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});
  `;

  fs.writeFileSync(file, template);
  console.log("\n✔ Test file created:", file);
}