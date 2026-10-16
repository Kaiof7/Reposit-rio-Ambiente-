import jsQR from "jsqr";
import { expect, it } from "vitest";
import { buildPixPayload } from "@/order/pix";
import { qrMatrix } from "./qr";

// Rasterize the matrix with a quiet zone and read it back with a decoder.
function decode(matrix: boolean[][]) {
  const scale = 4;
  const quiet = 4;
  const size = (matrix.length + quiet * 2) * scale;
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
  matrix.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (!dark) return;
      for (let y = 0; y < scale; y++)
        for (let x = 0; x < scale; x++) {
          const offset = (((r + quiet) * scale + y) * size + (c + quiet) * scale + x) * 4;
          pixels.fill(0, offset, offset + 3);
        }
    }),
  );
  return jsQR(pixels, size, size)?.data;
}

it("produces QR codes a reader decodes back to the same text", () => {
  const pix = buildPixPayload({ key: "+5511912345678", name: "Barbearia do Zé", city: "São Paulo" });
  expect(decode(qrMatrix(pix))).toBe(pix);
  expect(decode(qrMatrix("https://g.page/r/CabcDEF123/review"))).toBe("https://g.page/r/CabcDEF123/review");
});
