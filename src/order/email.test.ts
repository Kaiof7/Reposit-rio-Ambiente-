import { afterEach, describe, expect, it, vi } from "vitest";
import { sendOrderEmail } from "./email";

vi.mock("server-only", () => ({}));
afterEach(() => vi.unstubAllGlobals());

const config = { apiKey: "re_test", from: "Loja <onboarding@resend.dev>", to: "dono@exemplo.com" };

describe("order e-mail", () => {
  it("posts a plain-text copy to the store address with a one-line subject", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await sendOrderEmail(config, "Ana\nBcc: x@y.com", "*Pedido*\nModelo: Pix");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body)).toEqual({
      from: config.from,
      to: ["dono@exemplo.com"],
      subject: "Novo pedido: Ana Bcc: x@y.com",
      text: "Pedido\nModelo: Pix",
    });
  });

  it("throws when Resend refuses the e-mail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 403 })));
    await expect(sendOrderEmail(config, "Ana", "x")).rejects.toThrow("403");
  });
});
