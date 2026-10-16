import { describe, expect, it } from "vitest";
import { defaultDestinationFor, nfcSchema, normalizeNfcUrl } from "./nfc";

describe("normalizeNfcUrl", () => {
  it("keeps full web links", () => {
    expect(normalizeNfcUrl(" https://g.page/r/CabcDEF123/review ", "avaliacao-google")).toBe("https://g.page/r/CabcDEF123/review");
    expect(normalizeNfcUrl("http://exemplo.com.br/cardapio?mesa=2", "cardapio")).toBe("http://exemplo.com.br/cardapio?mesa=2");
  });

  it("adds https to bare domains", () => {
    expect(normalizeNfcUrl("padariapaoquente.com.br", "site")).toBe("https://padariapaoquente.com.br/");
    expect(normalizeNfcUrl("www.instagram.com/barbeariadoze", "instagram")).toBe("https://www.instagram.com/barbeariadoze");
  });

  it("turns Instagram handles into profile links only for Instagram", () => {
    expect(normalizeNfcUrl("@barbearia.do.ze", "instagram")).toBe("https://www.instagram.com/barbearia.do.ze/");
    expect(normalizeNfcUrl("barbeariadoze", "instagram")).toBe("https://www.instagram.com/barbeariadoze/");
    expect(normalizeNfcUrl("@barbeariadoze", "site")).toBeNull();
  });

  it("rejects what is not a web address", () => {
    for (const value of ["", "   ", "meu site", "padaria", "javascript:alert(1)", "mailto:ze@exemplo.com", "ftp://exemplo.com", "https://localhost"]) {
      expect(normalizeNfcUrl(value, "outro")).toBeNull();
    }
  });
});

describe("nfcSchema", () => {
  it("outputs the normalized link", () => {
    expect(nfcSchema.parse({ destination: "instagram", url: "@barbeariadoze" })).toEqual({
      destination: "instagram",
      url: "https://www.instagram.com/barbeariadoze/",
    });
  });

  it("explains empty and invalid links on the url field", () => {
    const empty = nfcSchema.safeParse({ destination: "site", url: " " });
    expect(empty.error?.issues.map((issue) => [issue.path, issue.message])).toEqual([[["url"], "Informe o link que será gravado no chip."]]);
    const invalid = nfcSchema.safeParse({ destination: "site", url: "meu site" });
    expect(invalid.error?.issues[0].message).toMatch(/não parece válido/);
  });

  it("rejects unknown destinations", () => {
    expect(nfcSchema.safeParse({ destination: "tiktok", url: "https://exemplo.com" }).success).toBe(false);
  });
});

it("suggests the destination that matches the model", () => {
  expect(defaultDestinationFor("avaliacao-google")).toBe("avaliacao-google");
  expect(defaultDestinationFor("instagram")).toBe("instagram");
  expect(defaultDestinationFor("pix")).toBe("outro");
});
