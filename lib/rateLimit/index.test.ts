import { describe, expect, it, vi } from "vitest";
import { clientIp, createRateLimiter } from "./index";

describe("createRateLimiter", () => {
  it("allows requests up to the max within a window, then blocks", () => {
    const checkRateLimit = createRateLimiter(60_000, 3);

    expect(checkRateLimit("1.2.3.4").allowed).toBe(true);
    expect(checkRateLimit("1.2.3.4").allowed).toBe(true);
    expect(checkRateLimit("1.2.3.4").allowed).toBe(true);
    const blocked = checkRateLimit("1.2.3.4");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks each key independently", () => {
    const checkRateLimit = createRateLimiter(60_000, 1);

    expect(checkRateLimit("1.1.1.1").allowed).toBe(true);
    expect(checkRateLimit("1.1.1.1").allowed).toBe(false);
    expect(checkRateLimit("2.2.2.2").allowed).toBe(true);
  });

  it("resets the count once the window has elapsed", () => {
    vi.useFakeTimers();
    try {
      const checkRateLimit = createRateLimiter(1000, 1);
      expect(checkRateLimit("1.1.1.1").allowed).toBe(true);
      expect(checkRateLimit("1.1.1.1").allowed).toBe(false);

      vi.advanceTimersByTime(1001);
      expect(checkRateLimit("1.1.1.1").allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("clientIp", () => {
  it("takes the first address from a comma-separated x-forwarded-for header", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(clientIp(request)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip, then unknown", () => {
    const withRealIp = new Request("https://example.com", { headers: { "x-real-ip": "198.51.100.9" } });
    expect(clientIp(withRealIp)).toBe("198.51.100.9");

    const withNeither = new Request("https://example.com");
    expect(clientIp(withNeither)).toBe("unknown");
  });
});
