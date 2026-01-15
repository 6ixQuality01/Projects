import { useEffect, useMemo, useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { loadJSON, saveJSON } from "../../../lib/storage";
import type { CostCode } from "../invoices.types";

const COSTCODES_KEY = "costCodes";

type EditableRow = CostCode & { isEditing?: boolean };

export function CostCodesTab() {
  const [rows, setRows] = useState<EditableRow[]>(() => loadJSON<CostCode[]>(COSTCODES_KEY, []).map(r => ({ ...r })));

  // New cost code form
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    saveJSON(COSTCODES_KEY, rows.map(({ isEditing, ...rest }) => rest));
  }, [rows]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => a.code.localeCompare(b.code));
  }, [rows]);

  function addCostCode() {
    const code = newCode.trim();
    const title = newTitle.trim();
    if (!code || !title) return;

    // prevent duplicates by code
    const exists = rows.some(r => r.code.toLowerCase() === code.toLowerCase());
    if (exists) {
      alert("Já existe um Cost Code com esse código.");
      return;
    }

    setRows(prev => [
      { id: crypto.randomUUID(), code, title },
      ...prev,
    ]);
    setNewCode("");
    setNewTitle("");
  }

  function startEdit(id: string) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, isEditing: true } : r)));
  }

  function cancelEdit(id: string) {
    // reload row from persisted storage (simple cancel strategy)
    const persisted = loadJSON<CostCode[]>(COSTCODES_KEY, []);
    const persistedRow = persisted.find(p => p.id === id);
    setRows(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        if (!persistedRow) return { ...r, isEditing: false };
        return { ...persistedRow, isEditing: false };
      })
    );
  }

  function saveEdit(id: string) {
    const row = rows.find(r => r.id === id);
    if (!row) return;

    const code = row.code.trim();
    const title = row.title.trim();
    if (!code || !title) {
      alert("Preencha Code e Title.");
      return;
    }

    const dup = rows.some(r => r.id !== id && r.code.toLowerCase() === code.toLowerCase());
    if (dup) {
      alert("Já existe outro Cost Code com esse código.");
      return;
    }

    setRows(prev => prev.map(r => (r.id === id ? { ...r, code, title, isEditing: false } : r)));
  }

  function removeRow(id: string) {
    if (!confirm("Remover este Cost Code?")) return;
    setRows(prev => prev.filter(r => r.id !== id));
  }

  function updateRow(id: string, patch: Partial<CostCode>) {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div className="stack">
      <Card title="Cost Codes">
        <div className="row gap">
          <div style={{ flex: 1 }}>
            <label className="label">Code</label>
            <Input value={newCode} placeholder="ex: 09 29 00" onChange={(e) => setNewCode(e.target.value)} />
          </div>
          <div style={{ flex: 2 }}>
            <label className="label">Title</label>
            <Input value={newTitle} placeholder="ex: Gypsum Board" onChange={(e) => setNewTitle(e.target.value)} />
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <Button onClick={addCostCode} disabled={!newCode.trim() || !newTitle.trim()}>
              Add
            </Button>
          </div>
        </div>

        <div className="table">
          <div className="table-head">
            <div>Code</div>
            <div>Title</div>
            <div style={{ width: 220 }}>Actions</div>
          </div>

          {sortedRows.length === 0 ? (
            <div className="muted" style={{ padding: 12 }}>Nenhum Cost Code ainda.</div>
          ) : (
            sortedRows.map((r) => (
              <div className="table-row" key={r.id}>
                <div>
                  {r.isEditing ? (
                    <Input value={r.code} onChange={(e) => updateRow(r.id, { code: e.target.value })} />
                  ) : (
                    <span>{r.code}</span>
                  )}
                </div>
                <div>
                  {r.isEditing ? (
                    <Input value={r.title} onChange={(e) => updateRow(r.id, { title: e.target.value })} />
                  ) : (
                    <span>{r.title}</span>
                  )}
                </div>
                <div className="row gap">
                  {!r.isEditing ? (
                    <>
                      <button className="link-btn" onClick={() => startEdit(r.id)}>Edit</button>
                      <button className="link-btn danger" onClick={() => removeRow(r.id)}>Delete</button>
                    </>
                  ) : (
                    <>
                      <button className="link-btn" onClick={() => saveEdit(r.id)}>Save</button>
                      <button className="link-btn" onClick={() => cancelEdit(r.id)}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
