import { useMemo, useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { loadJSON, saveJSON } from "../../../lib/storage";
import type { CostCode, Invoice } from "../invoices.types";

const INVOICES_KEY = "invoices";
const COSTCODES_KEY = "costCodes";
const PROJECTS_KEY = "projects";

type Project = { id: string; name: string };

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function lineTotal(qty: number, unitPrice: number) {
  return (qty || 0) * (unitPrice || 0);
}

function invoiceTotal(inv: Invoice) {
  return inv.macros.reduce((sum, m) => {
    const macroSum = m.items.reduce((s, it) => s + lineTotal(it.qty, it.unitPrice), 0);
    return sum + macroSum;
  }, 0);
}

function printInvoiceHTML(inv: Invoice, costCodes: CostCode[], projects: Project[]) {
  const ccMap = new Map(costCodes.map(c => [c.id, `${c.code} — ${c.title}`]));
  const proj = projects.find(p => p.id === inv.projectId)?.name ?? inv.projectId;

  const rows = inv.macros.map((m) => {
    const macroLabel = ccMap.get(m.costCodeId) ?? "—";
    const itemsHTML = m.items.map(it => {
      const t = lineTotal(it.qty, it.unitPrice);
      return `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${it.name}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${it.qty}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${it.unit}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${money(it.unitPrice)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;"><b>${money(t)}</b></td>
        </tr>
      `;
    }).join("");

    const macroSum = m.items.reduce((s, it) => s + lineTotal(it.qty, it.unitPrice), 0);

    return `
      <div style="margin:16px 0 10px 0;">
        <div style="display:flex;justify-content:space-between;gap:12px;">
          <div>
            <div style="font-weight:700;">${macroLabel}</div>
            <div style="color:#666;font-size:12px;">${m.description || ""}</div>
          </div>
          <div style="font-weight:700;">Macro total: ${money(macroSum)}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:12px;">
          <thead>
            <tr style="text-align:left;">
              <th style="padding:6px 8px;border-bottom:2px solid #ddd;">Item</th>
              <th style="padding:6px 8px;border-bottom:2px solid #ddd;text-align:right;">Qty</th>
              <th style="padding:6px 8px;border-bottom:2px solid #ddd;">Unit</th>
              <th style="padding:6px 8px;border-bottom:2px solid #ddd;text-align:right;">Unit Price</th>
              <th style="padding:6px 8px;border-bottom:2px solid #ddd;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>
    `;
  }).join("");

  const total = invoiceTotal(inv);

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice ${inv.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 28px; color: #111; }
        .top { display:flex; justify-content:space-between; gap: 16px; }
        .muted { color:#666; }
        .box { border:1px solid #ddd; border-radius:10px; padding:12px; }
        @media print {
          button { display:none; }
          body { margin: 10mm; }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print()" style="padding:8px 12px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer;">Print</button>

      <div class="top" style="margin-top:12px;">
        <div>
          <h2 style="margin:0;">Invoice</h2>
          <div class="muted">Created: ${new Date(inv.createdAt).toLocaleString()}</div>
        </div>
        <div style="text-align:right;">
          <div><b>${inv.invoiceNumber}</b></div>
          <div class="muted">${inv.invoiceName}</div>
          <div class="muted">Project: ${proj}</div>
        </div>
      </div>

      <div class="box" style="margin-top:16px;">
        <div style="display:flex;justify-content:space-between;">
          <div><b>Line Items</b></div>
          <div><b>Total: ${money(total)}</b></div>
        </div>
        ${rows}
      </div>
    </body>
  </html>
  `;
}

export function InvoicesCreatedTab() {
  const [query, setQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadJSON<Invoice[]>(INVOICES_KEY, []));
  const costCodes = loadJSON<CostCode[]>(COSTCODES_KEY, []);
  const projects = loadJSON<Project[]>(PROJECTS_KEY, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(inv =>
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.invoiceName.toLowerCase().includes(q)
    );
  }, [invoices, query]);

  function removeInvoice(id: string) {
    if (!confirm("Remover esta invoice?")) return;
    const next = invoices.filter(i => i.id !== id);
    setInvoices(next);
    saveJSON(INVOICES_KEY, next);
  }

  function onPrint(inv: Invoice) {
    const html = printInvoiceHTML(inv, costCodes, projects);
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) {
      alert("Popup bloqueado. Permita popups para imprimir.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="stack">
      <Card title="Invoices Created" right={<div className="muted">{filtered.length} total</div>}>
        <label className="label">Search</label>
        <Input value={query} placeholder="Search by invoice number or name" onChange={(e) => setQuery(e.target.value)} />

        <div className="table" style={{ marginTop: 12 }}>
          <div className="table-head" style={{ gridTemplateColumns: "1fr 1.2fr 1fr 0.9fr 220px" }}>
            <div>Invoice #</div>
            <div>Name</div>
            <div>Project</div>
            <div>Total</div>
            <div>Actions</div>
          </div>

          {filtered.length === 0 ? (
            <div className="muted" style={{ padding: 12 }}>Nenhuma invoice encontrada.</div>
          ) : (
            filtered.map(inv => {
              const proj = projects.find(p => p.id === inv.projectId)?.name ?? inv.projectId;
              const total = invoiceTotal(inv);

              return (
                <div className="table-row" key={inv.id} style={{ gridTemplateColumns: "1fr 1.2fr 1fr 0.9fr 220px" }}>
                  <div><b>{inv.invoiceNumber}</b></div>
                  <div>{inv.invoiceName}</div>
                  <div className="muted">{proj}</div>
                  <div><b>{money(total)}</b></div>
                  <div className="row gap">
                    <button className="link-btn" onClick={() => onPrint(inv)}>Print</button>
                    <button className="link-btn danger" onClick={() => removeInvoice(inv.id)}>Delete</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
