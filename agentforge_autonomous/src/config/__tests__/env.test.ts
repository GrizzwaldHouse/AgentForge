import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getEnvConfig, getProviderStatus, resetEnvCache } from "@/config/env";

describe("getEnvConfig", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetEnvCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetEnvCache();
  });

  it("returns default values when no env vars set", () => {
    delete process.env.OLLAMA_BASE_URL;
    delete process.env.GROQ_API_KEY;
    delete process.env.DAILY_BUDGET_USD;

    const config = getEnvConfig();
    expect(config.ollamaBaseUrl).toBe("http://127.0.0.1:11434");
    expect(config.groqApiKey).toBeUndefined();
    expect(config.dailyBudgetUsd).toBe(1.0);
  });

  it("reads OLLAMA_BASE_URL from env", () => {
    process.env.OLLAMA_BASE_URL = "http://custom:8080";
    const config = getEnvConfig();
    expect(config.ollamaBaseUrl).toBe("http://custom:8080");
  });

  it("reads API keys from env", () => {
    process.env.GROQ_API_KEY = "gsk_test";
    process.env.CEREBRAS_API_KEY = "csk_test";
    const config = getEnvConfig();
    expect(config.groqApiKey).toBe("gsk_test");
    expect(config.cerebrasApiKey).toBe("csk_test");
  });

  it("treats empty string API keys as undefined", () => {
    process.env.GROQ_API_KEY = "";
    const config = getEnvConfig();
    expect(config.groqApiKey).toBeUndefined();
  });

  it("caches config after first call", () => {
    const config1 = getEnvConfig();
    process.env.OLLAMA_BASE_URL = "http://changed:9999";
    const config2 = getEnvConfig();
    // Should be same object (cached)
    expect(config1).toBe(config2);
  });

  it("throws on invalid budget", () => {
    process.env.DAILY_BUDGET_USD = "not-a-number";
    expect(() => getEnvConfig()).toThrow("DAILY_BUDGET_USD must be a non-negative number");
  });

  it("throws on negative budget", () => {
    process.env.DAILY_BUDGET_USD = "-5";
    expect(() => getEnvConfig()).toThrow("DAILY_BUDGET_USD must be a non-negative number");
  });
});

describe("getProviderStatus", () => {
  beforeEach(() => {
    resetEnvCache();
  });

  afterEach(() => {
    resetEnvCache();
  });

  it("reports ollama as always available", () => {
    const status = getProviderStatus();
    expect(status.ollama).toBe(true);
  });

  it("reports cloud providers based on API key presence", () => {
    process.env.GROQ_API_KEY = "test_key";
    delete process.env.CEREBRAS_API_KEY;

    const status = getProviderStatus();
    expect(status.groq).toBe(true);
    expect(status.cerebras).toBe(false);
  });
});
