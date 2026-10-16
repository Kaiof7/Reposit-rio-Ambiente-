import { expect, it } from "vitest";
import { formatPrice } from "./format";

it("formats integer cents as Brazilian reais", () => {
  // Intl uses a no-break space between the symbol and the value.
  expect(formatPrice(1990).replace(/\s/g, " ")).toBe("R$ 19,90");
  expect(formatPrice(123456).replace(/\s/g, " ")).toBe("R$ 1.234,56");
});
