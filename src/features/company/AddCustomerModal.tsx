import { useMemo, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { MultiSelect } from "../../components/ui/MultiSelect";
import type { Customer, Project } from "./customers.types";

export function AddCustomerModal({
  open,
  onClose,
  projects,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onSave: (customer: Customer) => void;
}) {
  const [form, setForm] = useState<Customer>(() => ({
    id: crypto.randomUUID(),
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    projectIds: [],
  }));

  const canSave = useMemo(() => {
    return form.name.trim() && form.email.trim() && form.phone.trim() && form.address.trim() && form.projectIds.length > 0;
  }, [form]);

  function onChange<K extends keyof Customer>(key: K, value: Customer[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Customer" subtitle="Create a customer profile and assign projects">
      <div className="form-grid">
        <div>
          <label className="label">Customer Name *</label>
          <Input value={form.name} placeholder="Enter full name" onChange={(e) => onChange("name", e.target.value)} />
        </div>

        <div>
          <label className="label">Customer Company</label>
          <Input value={form.companyName ?? ""} placeholder="Company name" onChange={(e) => onChange("companyName", e.target.value)} />
        </div>

        <div>
          <label className="label">Email *</label>
          <Input value={form.email} placeholder="email@company" onChange={(e) => onChange("email", e.target.value)} />
        </div>

        <div>
          <label className="label">Phone *</label>
          <Input value={form.phone} placeholder="(XXX) XXX-XXXX" onChange={(e) => onChange("phone", e.target.value)} />
        </div>

        <div className="span-2">
          <label className="label">Address *</label>
          <Input value={form.address} placeholder="Street, City, State, ZIP" onChange={(e) => onChange("address", e.target.value)} />
        </div>

        <div className="span-2">
          <label className="label">Project *</label>
          <MultiSelect
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
            value={form.projectIds}
            placeholder="Select one or more projects"
            onChange={(vals) => onChange("projectIds", vals)}
          />
        </div>
      </div>

      <div className="modal-actions">
        <button className="link-btn" onClick={onClose}>Cancel</button>
        <Button disabled={!canSave} onClick={() => onSave(form)}>Save Customer</Button>
      </div>
    </Modal>
  );
}
