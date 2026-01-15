import { useMemo, useState } from "react";
import { Shell } from "../../components/Shell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { saveJSON } from "../../lib/storage";
import type { Company } from "./company.types";

export function SetupCompanyPage() {
  const [form, setForm] = useState<Company>(() => ({
    id: crypto.randomUUID(),
    name: "",
    email: "",
    phone: "",
    address: "",
    logoUrl: "",
  }));

  const canSave = useMemo(() => {
    return form.name.trim() && form.email.trim() && form.phone.trim() && form.address.trim();
  }, [form]);

  function onChange<K extends keyof Company>(key: K, value: Company[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function onSave() {
    if (!canSave) return;
    saveJSON("company", form);
    alert("Empresa salva!");
  }

  return (
    <Shell>
      <div className="page">
        <div className="page-header">
          <h1>Setup da Empresa</h1>
          <p>Preencha os dados da sua empresa no primeiro login.</p>
        </div>

        <div className="grid-2">
          <div className="card">
            <label className="label">Nome da Empresa</label>
            <Input value={form.name} placeholder="Nome da Empresa" onChange={(e) => onChange("name", e.target.value)} />

            <label className="label">Email</label>
            <Input value={form.email} placeholder="Email" onChange={(e) => onChange("email", e.target.value)} />

            <label className="label">Telefone</label>
            <Input value={form.phone} placeholder="Telefone" onChange={(e) => onChange("phone", e.target.value)} />

            <label className="label">Endereço</label>
            <Input value={form.address} placeholder="Endereço" onChange={(e) => onChange("address", e.target.value)} />
          </div>

          <div className="card">
            <label className="label">Logo da Empresa</label>
            <div className="upload-box">
              <div className="upload-icon">☁︎</div>
              <div>Upload logo</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  onChange("logoUrl", url);
                }}
              />
            </div>

            <label className="label">URL da imagem</label>
            <Input
              value={form.logoUrl ?? ""}
              placeholder="https://..."
              onChange={(e) => onChange("logoUrl", e.target.value)}
            />
          </div>
        </div>

        <div className="actions">
          <Button disabled={!canSave} onClick={onSave}>Salvar</Button>
        </div>
      </div>
    </Shell>
  );
}
