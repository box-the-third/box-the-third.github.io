"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { money, totals, zatcaTlv, type Line } from "@/lib/studio/zatca";
import { saveItem } from "@/lib/studio/data";
import { store } from "@/lib/studio/resilience";
import { Field, useAward, useUid } from "../ui";

interface Inv {
  no: string; date: string; seller: string; sellerVat: string; buyer: string; buyerVat: string;
  currency: string; vatRate: number; items: Line[]; notes: string;
}
const KEY = "yas_invoice_v1";
const today = () => new Date().toISOString();
const blank = (): Inv => ({
  no: `INV-${new Date().getFullYear()}-001`, date: today(), seller: "", sellerVat: "", buyer: "", buyerVat: "",
  currency: "SAR", vatRate: 15, items: [{ description: "Service", quantity: 1, unitPrice: 0 }], notes: "Thank you for your business.",
});

export default function InvoiceAgent() {
  const [inv, setInv] = useState<Inv>(blank);
  const [qr, setQr] = useState("");
  const uid = useUid();
  const award = useAward("invoice");
  useEffect(() => { setInv(store.read<Inv>(KEY, blank())); }, []);
  const upd = (p: Partial<Inv>) => { const n = { ...inv, ...p }; setInv(n); store.write(KEY, n); };
  const t = useMemo(() => totals(inv.items, inv.vatRate), [inv.items, inv.vatRate]);
  const tlv = useMemo(() => zatcaTlv(inv.seller || "Seller", inv.sellerVat || "000000000000000", inv.date, t.total, t.vat), [inv.seller, inv.sellerVat, inv.date, t]);
  useEffect(() => { QRCode.toDataURL(tlv, { margin: 1, width: 180 }).then(setQr).catch(() => setQr("")); }, [tlv]);
  const setLine = (i: number, p: Partial<Line>) => upd({ items: inv.items.map((l, k) => (k === i ? { ...l, ...p } : l)) });
  const vatOk = /^3\d{13}3$/.test(inv.sellerVat);

  const save = async () => {
    await saveItem(uid, { kind: "invoice", title: `${inv.no} – ${inv.buyer || "Client"}`, status: "issued", payload: { inv, totals: t } });
    award();
  };

  return (
    <div className="st-split">
      <div className="st-form">
        <Field label="Invoice no."><input value={inv.no} onChange={(e) => upd({ no: e.target.value })} /></Field>
        <Field label="Seller name"><input value={inv.seller} onChange={(e) => upd({ seller: e.target.value })} /></Field>
        <Field label="Seller VAT no. (15 digits, starts and ends with 3)">
          <input value={inv.sellerVat} onChange={(e) => upd({ sellerVat: e.target.value.replace(/\D/g, "").slice(0, 15) })} />
        </Field>
        {inv.sellerVat && !vatOk && <p className="st-note err">VAT number format looks off. ZATCA requires 15 digits, 3xxxxxxxxxxxxx3.</p>}
        <Field label="Client"><input value={inv.buyer} onChange={(e) => upd({ buyer: e.target.value })} /></Field>
        <Field label="Client VAT no. (optional)"><input value={inv.buyerVat} onChange={(e) => upd({ buyerVat: e.target.value })} /></Field>
        <div className="st-row">
          <Field label="Currency"><input value={inv.currency} onChange={(e) => upd({ currency: e.target.value.toUpperCase().slice(0, 3) })} /></Field>
          <Field label="VAT %"><input type="number" value={inv.vatRate} onChange={(e) => upd({ vatRate: +e.target.value })} /></Field>
        </div>
        {inv.items.map((l, i) => (
          <div key={i} className="st-line">
            <input placeholder="Description" value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} />
            <input type="number" min={0} value={l.quantity} onChange={(e) => setLine(i, { quantity: +e.target.value })} />
            <input type="number" min={0} value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: +e.target.value })} />
            {inv.items.length > 1 && <button className="st-x" onClick={() => upd({ items: inv.items.filter((_, k) => k !== i) })}>×</button>}
          </div>
        ))}
        <button className="st-btn ghost" onClick={() => upd({ items: [...inv.items, { description: "", quantity: 1, unitPrice: 0 }] })}>+ Line</button>
        <Field label="Notes"><textarea rows={2} value={inv.notes} onChange={(e) => upd({ notes: e.target.value })} /></Field>
        <div className="st-row">
          <button className="st-btn" onClick={save}>Issue and save</button>
          <button className="st-btn ghost" onClick={() => window.print()}>Print / PDF</button>
          <button className="st-btn ghost" onClick={() => upd({ ...blank(), seller: inv.seller, sellerVat: inv.sellerVat })}>New</button>
        </div>
      </div>

      <div className="st-paper-wrap">
        <div id="cv-paper" className="st-invoice">
          <header><h3>Tax Invoice <small>فاتورة ضريبية</small></h3><div>{inv.no}<br />{new Date(inv.date).toLocaleDateString("en-GB")}</div></header>
          <div className="inv-parties">
            <div><b>Seller</b><br />{inv.seller || "—"}<br />VAT {inv.sellerVat || "—"}</div>
            <div><b>Client</b><br />{inv.buyer || "—"}<br />{inv.buyerVat && `VAT ${inv.buyerVat}`}</div>
          </div>
          <table>
            <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
            <tbody>{inv.items.map((l, i) => (
              <tr key={i}><td>{l.description}</td><td>{l.quantity}</td><td>{money(l.unitPrice, inv.currency)}</td><td>{money(l.quantity * l.unitPrice, inv.currency)}</td></tr>
            ))}</tbody>
          </table>
          <div className="inv-tot">
            <div>{qr && /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} alt="ZATCA QR" width={120} height={120} />}</div>
            <dl>
              <dt>Subtotal</dt><dd>{money(t.subtotal, inv.currency)}</dd>
              <dt>VAT ({inv.vatRate}%)</dt><dd>{money(t.vat, inv.currency)}</dd>
              <dt><b>Total</b></dt><dd><b>{money(t.total, inv.currency)}</b></dd>
            </dl>
          </div>
          <p className="inv-notes">{inv.notes}</p>
        </div>
      </div>
    </div>
  );
}
