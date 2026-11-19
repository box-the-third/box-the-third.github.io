"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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

type Totals = ReturnType<typeof totals>;

/** The invoice itself. Rendered twice: as the on-screen preview and as a print-only copy. */
function InvoiceSheet({ inv, t, qr }: { inv: Inv; t: Totals; qr: string }) {
  const date = new Date(inv.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <div className="st-invoice">
      <header className="inv-head">
        <div>
          <div className="inv-brand">{inv.seller || "Your business name"}</div>
          {inv.sellerVat && <div className="inv-sub">VAT No. {inv.sellerVat}</div>}
        </div>
        <div className="inv-title">
          <h3>Tax Invoice</h3>
          <div className="inv-ar" lang="ar" dir="rtl">فاتورة ضريبية</div>
        </div>
      </header>

      <section className="inv-meta">
        <div className="inv-billto">
          <span className="inv-label">Bill to</span>
          <strong>{inv.buyer || "Client name"}</strong>
          {inv.buyerVat && <span>VAT No. {inv.buyerVat}</span>}
        </div>
        <dl className="inv-facts">
          <dt>Invoice no.</dt><dd>{inv.no}</dd>
          <dt>Issue date</dt><dd>{date}</dd>
          <dt>Currency</dt><dd>{inv.currency}</dd>
        </dl>
      </section>

      <table className="inv-table">
        <thead>
          <tr><th className="c-idx">#</th><th>Description</th><th className="num">Qty</th><th className="num">Unit price</th><th className="num">Amount</th></tr>
        </thead>
        <tbody>
          {inv.items.map((l, i) => (
            <tr key={i}>
              <td className="c-idx">{i + 1}</td>
              <td>{l.description || "—"}</td>
              <td className="num">{l.quantity}</td>
              <td className="num">{money(l.unitPrice, inv.currency)}</td>
              <td className="num">{money(l.quantity * l.unitPrice, inv.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="inv-bottom">
        <div className="inv-qr">
          {qr && /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} alt="ZATCA e-invoice QR code" width={104} height={104} />}
          <span>Scan to verify<br />ZATCA e-invoice QR</span>
        </div>
        <dl className="inv-sum">
          <div><dt>Subtotal</dt><dd>{money(t.subtotal, inv.currency)}</dd></div>
          <div><dt>VAT ({inv.vatRate}%)</dt><dd>{money(t.vat, inv.currency)}</dd></div>
          <div className="inv-due"><dt>Total due</dt><dd>{money(t.total, inv.currency)}</dd></div>
        </dl>
      </section>

      {inv.notes && (
        <section className="inv-notes">
          <span className="inv-label">Notes</span>
          <p>{inv.notes}</p>
        </section>
      )}

      <footer className="inv-foot">
        <span>{inv.seller || "Your business name"}{inv.sellerVat && ` · VAT No. ${inv.sellerVat}`}</span>
        <span>{inv.no}</span>
      </footer>
    </div>
  );
}

/** Print only the invoice: the print-only copy sits directly under <body>, so nothing else takes up pages. */
const printInvoice = () => {
  const root = document.documentElement;
  const done = () => root.classList.remove("print-invoice");
  root.classList.add("print-invoice");
  window.addEventListener("afterprint", done, { once: true });
  window.print();
};

export default function InvoiceAgent() {
  const [inv, setInv] = useState<Inv>(blank);
  const [qr, setQr] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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
          <button className="st-btn ghost" onClick={printInvoice}>Print / PDF</button>
          <button className="st-btn ghost" onClick={() => upd({ ...blank(), seller: inv.seller, sellerVat: inv.sellerVat })}>New</button>
        </div>
      </div>

      <div className="st-paper-wrap">
        <InvoiceSheet inv={inv} t={t} qr={qr} />
      </div>
      {mounted && createPortal(<div id="inv-print"><InvoiceSheet inv={inv} t={t} qr={qr} /></div>, document.body)}
    </div>
  );
}
