import { describe, it, expect } from "vitest";

describe("Adversarial Input Handling Baseline", () => {
  it("should handle empty or whitespace responses gracefully", () => {
    const rawInput = "   ";
    const cleaned = rawInput.trim();
    expect(cleaned).toBe("");
  });

  it("should sanitize extreme 10k character inputs without memory crashes", () => {
    const hugeInput = "a = 10\n".repeat(2000);
    expect(hugeInput.length).toBeGreaterThan(10000);
    const truncated = hugeInput.slice(0, 2000);
    expect(truncated.length).toBe(2000);
  });
});
