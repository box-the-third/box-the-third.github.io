// Invoice maths (ported from the Fawtara project) + ZATCA Phase-1 QR payload.
export type Line = { description: string; quantity: number; unitPrice: number };
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function totals(items: Line[], vatRate: number) {
  const subtotal = r2(items.reduce((s, i) => s + (+i.quantity || 0) * (+i.unitPrice || 0), 0));
  const vat = r2((subtotal * (+vatRate || 0)) / 100);
  return { subtotal, vat, total: r2(subtotal + vat) };
}

export const money = (n: number, cur = "SAR") => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(n || 0);
  } catch {
    return `${(n || 0).toFixed(2)} ${cur}`;
  }
};

const enc = new TextEncoder();
const tlv = (tag: number, val: string) => {
  const v = enc.encode(val);
  return Uint8Array.from([tag, v.length, ...v]);
};

/** ZATCA TLV: 1 seller, 2 VAT no, 3 ISO timestamp, 4 total, 5 VAT; base64. */
export function zatcaTlv(seller: string, vatNo: string, iso: string, total: number, vat: number): string {
  const parts = [tlv(1, seller), tlv(2, vatNo), tlv(3, iso), tlv(4, total.toFixed(2)), tlv(5, vat.toFixed(2))];
  const buf = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  parts.forEach((p) => {
    buf.set(p, o);
    o += p.length;
  });
  let bin = "";
  buf.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
