import { expand } from "../commands/expand.js";
import { describe, it, expect, vi } from "vitest";

describe("RW Task Expander", () => {
  it("should show original task and expanded steps", () => {
    const consoleSpy = vi.spyOn(console, "log");
    expand("Create a new feature");

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Original Task:"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Create a new feature"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Expanded Atomic Steps:"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Clarify requirements"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Identify affected files"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Validate system dependencies"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Draft solution outline"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Execute Step 1 of implementation"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Request confirmation before Step 2"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Run tests"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Validate success"));

    consoleSpy.mockRestore();
  });
});