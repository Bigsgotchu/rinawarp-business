import { blueprint } from "../commands/blueprint.js";
import { describe, it, expect, vi } from "vitest";

describe("RW Blueprint Generator", () => {
  it("should generate architecture diagram", () => {
    const consoleSpy = vi.spyOn(console, "log");
    blueprint();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Generating Architecture Blueprint"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("terminal --> api --> gateway"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("website --> api"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("admin --> gateway"));

    consoleSpy.mockRestore();
  });
});