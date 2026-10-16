// Static Pix QR code ("Pix copia e cola") in the BR Code / EMV MPM format
// published by Banco Central do Brasil. Used only for the on-screen preview;
// the seller makes the final artwork (PRODUCT.md).

export const PIX_KEY_TYPES = {
  cpf: { label: "CPF", placeholder: "000.000.000-00", inputMode: "numeric" },
  cnpj: { label: "CNPJ", placeholder: "00.000.000/0000-00", inputMode: "numeric" },
  celular: { label: "Celular", placeholder: "(11) 91234-5678", inputMode: "tel" },
  email: { label: "E-mail", placeholder: "voce@exemplo.com", inputMode: "email" },
  aleatoria: { label: "Chave aleatória", placeholder: "123e4567-e89b-12d3-a456-426614174000", inputMode: "text" },
} as const;

export type PixKeyType = keyof typeof PIX_KEY_TYPES;

export const PIX_NAME_MAX = 25;
export const PIX_CITY_MAX = 15;

const digits = (value: string) => value.replace(/\D/g, "");

function checkDigit(numbers: number[], weights: number[]) {
  const sum = numbers.reduce((total, digit, index) => total + digit * weights[index], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export function isValidCpf(value: string) {
  const n = [...digits(value)].map(Number);
  if (n.length !== 11 || n.every((digit) => digit === n[0])) return false;
  return checkDigit(n.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]) === n[9]
    && checkDigit(n.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) === n[10];
}

export function isValidCnpj(value: string) {
  const n = [...digits(value)].map(Number);
  if (n.length !== 14 || n.every((digit) => digit === n[0])) return false;
  const first = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  return checkDigit(n.slice(0, 12), first) === n[12] && checkDigit(n.slice(0, 13), [6, ...first]) === n[13];
}

// Returns the key in the format the Pix directory uses, or null if invalid.
export function normalizePixKey(type: PixKeyType, raw: string): string | null {
  const value = raw.trim();
  switch (type) {
    case "cpf":
      return isValidCpf(value) ? digits(value) : null;
    case "cnpj":
      return isValidCnpj(value) ? digits(value) : null;
    case "celular": {
      const phone = digits(value);
      const national = phone.length >= 12 && phone.startsWith("55") ? phone.slice(2) : phone;
      return /^[1-9]{2}9?\d{8}$/.test(national) ? `+55${national}` : null;
    }
    case "email": {
      const email = value.toLowerCase();
      return email.length <= 77 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
    }
    case "aleatoria":
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value.toLowerCase() : null;
  }
}

// BR Code text fields: plain ASCII without accents, single spaces.
export function toBrCodeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

// CRC16/CCITT-FALSE (poly 0x1021, init 0xFFFF), as the BR Code manual requires.
export function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Expects an already normalized key. No amount: the payer types it.
export function buildPixPayload({ key, name, city }: { key: string; name: string; city: string }) {
  const body = [
    field("00", "01"),
    field("26", field("00", "br.gov.bcb.pix") + field("01", key)),
    field("52", "0000"),
    field("53", "986"),
    field("58", "BR"),
    field("59", toBrCodeText(name).slice(0, PIX_NAME_MAX)),
    field("60", toBrCodeText(city).slice(0, PIX_CITY_MAX)),
    field("62", field("05", "***")),
  ].join("");
  const withCrcId = `${body}6304`;
  return withCrcId + crc16(withCrcId);
}
