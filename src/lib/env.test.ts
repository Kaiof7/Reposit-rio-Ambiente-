import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminCredentials, getDatabaseUrl, getLogLevel, getOrderEmailConfig, hasDatabase } from "./env";
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

describe("database and panel environment", () => {
  it("treats a missing database URL as no database and rejects non-Postgres URLs without echoing them", () => {
    vi.stubEnv("DATABASE_URL", undefined);
    expect(hasDatabase()).toBe(false);
    vi.stubEnv("DATABASE_URL", "https://app:sensitive-test-value@example.invalid/db");
    expect(() => getDatabaseUrl()).toThrow("DATABASE_URL");
    expect(() => getDatabaseUrl()).not.toThrow("sensitive-test-value");
    vi.stubEnv("DATABASE_URL", "postgresql://app:dev@localhost:5432/app");
    expect(hasDatabase()).toBe(true);
    expect(getDatabaseUrl()).toBe("postgresql://app:dev@localhost:5432/app");
  });

  it("keeps the panel closed without a valid e-mail and a 12+ character password", () => {
    vi.stubEnv("ADMIN_EMAIL", " Dono@Exemplo.com ");
    vi.stubEnv("ADMIN_PASSWORD", undefined);
    expect(getAdminCredentials()).toBeNull();
    vi.stubEnv("ADMIN_PASSWORD", "curta");
    expect(getAdminCredentials()).toBeNull();
    vi.stubEnv("ADMIN_PASSWORD", "senha-bem-longa");
    expect(getAdminCredentials()).toEqual({ email: "dono@exemplo.com", password: "senha-bem-longa" });
    vi.stubEnv("ADMIN_EMAIL", "nao-e-email");
    expect(getAdminCredentials()).toBeNull();
    vi.stubEnv("ADMIN_EMAIL", undefined);
    expect(getAdminCredentials()).toBeNull();
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

describe("order e-mail environment", () => {
  it("is off without an API key and sends to ADMIN_EMAIL unless ORDER_EMAIL_TO is set", () => {
    vi.stubEnv("ADMIN_EMAIL", "Dono@Exemplo.com");
    vi.stubEnv("ORDER_EMAIL_TO", "");
    vi.stubEnv("ORDER_EMAIL_FROM", "");
    vi.stubEnv("RESEND_API_KEY", "");
    expect(getOrderEmailConfig()).toBeNull();
    vi.stubEnv("RESEND_API_KEY", "re_test");
    expect(getOrderEmailConfig()).toEqual({
      apiKey: "re_test",
      from: "Sua Plaquinha NFC <onboarding@resend.dev>",
      to: "dono@exemplo.com",
    });
    vi.stubEnv("ORDER_EMAIL_TO", "pedidos@exemplo.com");
    expect(getOrderEmailConfig()?.to).toBe("pedidos@exemplo.com");
    vi.stubEnv("ORDER_EMAIL_TO", "not-an-email");
    expect(getOrderEmailConfig()).toBeNull();
  });
});
