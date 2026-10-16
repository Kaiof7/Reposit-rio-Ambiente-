import qrcode from "qrcode-generator";

// Module matrix for a QR code (true = dark). Medium error correction keeps
// the code readable on a printed plaque with some wear.
export function qrMatrix(text: string) {
  const qr = qrcode(0, "M");
  qr.addData(text, "Byte");
  qr.make();
  const size = qr.getModuleCount();
  return Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, col) => qr.isDark(row, col)));
}
