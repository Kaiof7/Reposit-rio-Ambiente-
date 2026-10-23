import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createSessionToken, credentialsMatch, isValidSessionToken, SESSION_MAX_AGE_SECONDS } from "./admin-session";

vi.mock("server-only", () => ({}));

const admin = { email: "dono@exemplo.com", password: "senha-de-teste-123" };
const now = 1_800_000_000_000;

describe("admin session", () => {
  it("accepts the exact e-mail (any case, trimmed) and password together", () => {
    expect(credentialsMatch(admin, admin)).toBe(true);
    expect(credentialsMatch({ email: " Dono@Exemplo.COM ", password: admin.password }, admin)).toBe(true);
    expect(credentialsMatch({ email: admin.email, password: "senha-de-teste-12" }, admin)).toBe(false);
    expect(credentialsMatch({ email: "outro@exemplo.com", password: admin.password }, admin)).toBe(false);
    expect(credentialsMatch({ email: "", password: "" }, admin)).toBe(false);
  });

  it("validates its own token until it expires", () => {
    const token = createSessionToken(admin, now);
    expect(isValidSessionToken(token, admin, now + 1000)).toBe(true);
    expect(isValidSessionToken(token, admin, now + SESSION_MAX_AGE_SECONDS * 1000)).toBe(false);
  });

  it("does not sign with the raw password, so a leaked cookie is costly to crack", () => {
    const [expiresAt, signature] = createSessionToken(admin, now).split(".");
    const rawKeySignature = createHmac("sha256", admin.password).update(`painel:${admin.email}:${expiresAt}`).digest("base64url");
    expect(signature).not.toBe(rawKeySignature);
  });

  it("rejects tokens after the password or e-mail change, and tampered tokens", () => {
    const token = createSessionToken(admin, now);
    expect(isValidSessionToken(token, { ...admin, password: "outra-senha-qualquer" }, now)).toBe(false);
    expect(isValidSessionToken(token, { ...admin, email: "novo@exemplo.com" }, now)).toBe(false);
    const [expiresAt, signature] = token.split(".");
    expect(isValidSessionToken(`${Number(expiresAt) + 1}.${signature}`, admin, now)).toBe(false);
    for (const bad of [undefined, "", "abc", `${expiresAt}.`, `${token}.extra`]) {
      expect(isValidSessionToken(bad, admin, now)).toBe(false);
    }
  });
});
