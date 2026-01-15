import { useMemo, useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { loadJSON, saveJSON } from "../../../lib/storage";
import type { CostCode, Invoice, InvoiceLineItem, InvoiceMacroLine } from "../invoices.types";

const COSTCODES_KEY = "costCodes";
const INVOICES_KEY = "invoices";
const PROJECTS_KEY = "projects"; // opcional (se não existir, deixa vazio)

type Project = { id: string; name: string };

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function toNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function lineTotal(item: InvoiceLineItem) {
  return (item.qty || 0) * (item.unitPrice || 0);
}

function macroTotal(m: InvoiceMacroLine) {
  return m.items.reduce((sum, it) => sum + lineTotal(it), 0);
}

export function CreateInvoiceTab() {
  const costCodes = loadJSON<CostCode[]>(COSTCODES_KEY, []);
  const projects = loadJSON<Project[]>(PROJECTS_KEY, []);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceName, setInvoiceName] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");

  const [macros, setMacros] = useState<InvoiceMacroLine[]>([
    {
      id: crypto.randomUUID(),
      costCodeId: costCodes[0]?.id ?? "",
      description: "",
      items: [
        { id: crypto.randomUUID(), name: "", qty: 1, unit: "EA", unitPrice: 0 },
      ],
    },
  ]);

  const invoiceTotal = useMemo(() => macros.reduce((sum, m) => sum + macroTotal(m), 0), [macros]);

  function addMacro() {
    setMacros(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        costCodeId: costCodes[0]?.id ?? "",
        description: "",
        items: [{ id: crypto.randomUUID(), name: "", qty: 1, unit: "EA", unitPrice: 0 }],
      },
    ]);
  }

  function removeMacro(macroId: string) {
    setMacros(prev => prev.filter(m => m.id !== macroId));
  }

  function updateMacro(macroId: string, patch: Partial<InvoiceMacroLine>) {
    setMacros(prev => prev.map(m => (m.id === macroId ? { ...m, ...patch } : m)));
  }

  function addItem(macroId: string) {
    setMacros(prev =>
      prev.map(m => {
        if (m.id !== macroId) return m;
        return {
          ...m,
          items: [
            ...m.items,
            { id: crypto.randomUUID(), name: "", qty: 1, unit: "EA", unitPrice: 0 },
          ],
        };
      })
    );
  }

  function removeItem(macroId: string, itemId: string) {
    setMacros(prev =>
      prev.map(m => {
        if (m.id !== macroId) return m;
        return { ...m, items: m.items.filter(i => i.id !== itemId) };
      })
    );
  }

  function updateItem(macroId: string, itemId: string, patch: Partial<InvoiceLineItem>) {
    setMacros(prev =>
      prev.map(m => {
        if (m.id !== macroId) return m;
        return {
          ...m,
          items: m.items.map(i => (i.id === itemId ? { ...i, ...patch } : i)),
        };
      })
    );
  }

  function validate(): string | null {
    if (!invoiceNumber.trim()) return "Invoice Number é obrigatório.";
    if (!invoiceName.trim()) return "Invoice Name é obrigatório.";
    if (!projectId.trim()) return "Project é obrigatório (cadastre ao menos 1 projeto).";
    if (costCodes.length === 0) return "Cadastre Cost Codes antes de criar invoice.";

    for (const m of macros) {
      if (!m.costCodeId) return "Selecione um Cost Code em cada macro line.";
      if (m.items.length === 0) return "Cada macro precisa ter ao menos 1 item.";
      for (const it of m.items) {
        if (!it.name.trim()) return "Todo item precisa ter nome.";
      }
    }
    return null;
  }

  function saveInvoice() {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    const invoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: invoiceNumber.trim(),
      invoiceName: invoiceName.trim(),
      projectId,
      createdAt: new Date().toISOString(),
      macros,
    };

    const all = loadJSON<Invoice[]>(INVOICES_KEY, []);
    saveJSON(INVOICES_KEY, [invoice, ...all]);

    // reset
    setInvoiceNumber("");
    setInvoiceName("");
    setMacros([
      {
        id: crypto.randomUUID(),
        costCodeId: costCodes[0]?.id ?? "",
        description: "",
        items: [{ id: crypto.randomUUID(), name: "", qty: 1, unit: "EA", unitPrice: 0 }],
      },
    ]);

    alert("Invoice criada!");
  }

  return (
    <div className="stack">
      <Card title="Create New Invoice">
        <div className="grid-3 gap">
          <div>
            <label className="label">Invoice Number *</label>
            <Input value={invoiceNumber} placeholder="ex: INV-0001" onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>

          <div>
            <label className="label">Project *</label>
            <select className="select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.length === 0 ? (
                <option value="">(No projects yet)</option>
              ) : (
                projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
              )}
            </select>
          </div>

          <div>
            <label className="label">Invoice Name *</label>
            <Input value={invoiceName} placeholder="ex: Phase 1 - Electrical" onChange={(e) => setInvoiceName(e.target.value)} />
          </div>
        </div>

        <div className="row space-between" style={{ marginTop: 14 }}>
          <div className="muted">RSMeans-style: Macro (Cost Code) → Micro Items</div>
          <div className="total-pill">Total: <b>{money(invoiceTotal)}</b></div>
        </div>
      </Card>

      {macros.map((m, idx) => {
        const macroSum = macroTotal(m);
        const selected = costCodes.find(c => c.id === m.costCodeId);

        return (
          <Card
            key={m.id}
            title={`Macro ${idx + 1} • ${selected ? `${selected.code} — ${selected.title}` : "Select Cost Code"}`}
            right={
              <div className="row gap">
                <div className="muted">Macro total: <b>{money(macroSum)}</b></div>
                {macros.length > 1 && (
                  <button className="link-btn danger" onClick={() => removeMacro(m.id)}>Remove Macro</button>
                )}
              </div>
            }
          >
            <div className="grid-2 gap">
              <div>
                <label className="label">Cost Code *</label>
                <select
                  className="select"
                  value={m.costCodeId}
                  onChange={(e) => updateMacro(m.id, { costCodeId: e.target.value })}
                >
                  {costCodes.length === 0 ? (
                    <option value="">(No cost codes)</option>
                  ) : (
                    costCodes.map(cc => (
                      <option key={cc.id} value={cc.id}>
                        {cc.code} — {cc.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="label">Description</label>
                <Input
                  value={m.description}
                  placeholder="Optional macro description"
                  onChange={(e) => updateMacro(m.id, { description: e.target.value })}
                />
              </div>
            </div>

            <div className="table" style={{ marginTop: 12 }}>
              <div className="table-head" style={{ gridTemplateColumns: "2.2fr 0.7fr 0.7fr 0.8fr 0.8fr 140px" }}>
                <div>Item</div>
                <div>Qty</div>
                <div>Unit</div>
                <div>Unit Price</div>
                <div>Total</div>
                <div>Actions</div>
              </div>

              {m.items.map((it) => {
                const t = lineTotal(it);
                return (
                  <div
                    key={it.id}
                    className="table-row"
                    style={{ gridTemplateColumns: "2.2fr 0.7fr 0.7fr 0.8fr 0.8fr 140px" }}
                  >
                    <div>
                      <Input
                        value={it.name}
                        placeholder="ex: LED recessed light"
                        onChange={(e) => updateItem(m.id, it.id, { name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Input
                        value={String(it.qty)}
                        onChange={(e) => updateItem(m.id, it.id, { qty: toNumber(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Input
                        value={it.unit}
                        placeholder="EA"
                        onChange={(e) => updateItem(m.id, it.id, { unit: e.target.value })}
                      />
                    </div>

                    <div>
                      <Input
                        value={String(it.unitPrice)}
                        onChange={(e) => updateItem(m.id, it.id, { unitPrice: toNumber(e.target.value) })}
                      />
                    </div>

                    <div className="muted" style={{ alignSelf: "center" }}>
                      <b>{money(t)}</b>
                    </div>

                    <div className="row gap">
                      {m.items.length > 1 && (
                        <button className="link-btn danger" onClick={() => removeItem(m.id, it.id)}>Remove</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="row space-between" style={{ marginTop: 10 }}>
              <button className="link-btn" onClick={() => addItem(m.id)}>+ Add item</button>
              <div className="muted">Items: {m.items.length}</div>
            </div>
          </Card>
        );
      })}

      <div className="row space-between">
        <button className="link-btn" onClick={addMacro}>+ Add Macro Line</button>
        <Button onClick={saveInvoice}>Save Invoice</Button>
      </div>
    </div>
  );
}
