import { useMemo, useState } from "react";
import { Shell } from "../../components/Shell";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { AddCustomerModal } from "./AddCustomerModal";
import type { Customer, Project } from "./customers.types";

export function CustomersPage() {
  const [open, setOpen] = useState(false);

  // mock projects
  const projects: Project[] = useMemo(() => ([
    { id: "p1", name: "Skyline Villa" },
    { id: "p2", name: "Portobello" },
  ]), []);

  const [customers, setCustomers] = useState<Customer[]>([]);

  return (
    <Shell>
      <div className="page">
        <div className="page-header row">
          <h1>Customers</h1>
          <Button onClick={() => setOpen(true)}>Add New Customer</Button>
        </div>

        <Card title={`All Customers (${customers.length})`}>
          {customers.length === 0 ? (
            <div className="muted">Nenhum customer ainda.</div>
          ) : (
            <ul className="list">
              {customers.map((c) => (
                <li key={c.id} className="list-item">
                  <div>
                    <div><b>{c.name}</b> {c.companyName ? <span className="muted">• {c.companyName}</span> : null}</div>
                    <div className="muted">{c.email} • {c.phone} • {c.address}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <AddCustomerModal
          open={open}
          onClose={() => setOpen(false)}
          projects={projects}
          onSave={(customer) => {
            setCustomers((p) => [customer, ...p]);
            setOpen(false);
          }}
        />
      </div>
    </Shell>
  );
}
