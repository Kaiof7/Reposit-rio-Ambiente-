import { afterEach, describe, expect, it, vi } from "vitest";
import { getLogLevel } from "./env";
import { findWhatsAppNumber, getWhatsAppNumber } from "./public-env";

vi.mock("server-only", () => ({}));
afterEach(() => vi.unstubAllEnvs());

describe("server environment", () => {
  it("defaults the log level and rejects invalid values", () => {
    vi.stubEnv("LOG_LEVEL", undefined);
    expect(getLogLevel()).toBe("info");
    vi.stubEnv("LOG_LEVEL", "not-a-level");
    expect(() => getLogLevel()).toThrow("LOG_LEVEL");
  });
});

describe("public environment", () => {
  it("accepts Brazilian numbers with country code and DDD", () => {
    for (const value of ["5511912345678", "551133334444"]) {
      vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", value);
      expect(getWhatsAppNumber()).toBe(value);
    }
  });

  it("rejects missing or badly formatted numbers without echoing them", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", undefined);
    expect(() => getWhatsAppNumber()).toThrow("NEXT_PUBLIC_WHATSAPP_NUMBER");
    for (const value of ["+55 11 91234-5678", "11912345678", "5511"]) {
      vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", value);
      expect(() => getWhatsAppNumber()).toThrow("NEXT_PUBLIC_WHATSAPP_NUMBER");
      expect(() => getWhatsAppNumber()).not.toThrow(value);
    }
  });

  it("returns null instead of throwing when the page only needs to know", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", undefined);
    expect(findWhatsAppNumber()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "invalido");
    expect(findWhatsAppNumber()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5511912345678");
    expect(findWhatsAppNumber()).toBe("5511912345678");
  });
});
