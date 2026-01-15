import { useState } from "react";
import { Shell } from "../../components/Shell";
import { CostCodesTab } from "./tabs/CostCodesTab";
import { CreateInvoiceTab } from "./tabs/CreateInvoiceTab";
import { InvoicesCreatedTab } from "./tabs/InvoicesCreatedTab";

type TabKey = "create" | "created" | "costcodes";

export function InvoicesPage() {
  const [tab, setTab] = useState<TabKey>("create");

  return (
    <Shell>
      <div className="page">
        <div className="page-header">
          <h1>Invoices</h1>
          <p className="muted">Create, manage, and track invoices with RSMeans-style itemization.</p>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>Create New</button>
          <button className={`tab ${tab === "created" ? "active" : ""}`} onClick={() => setTab("created")}>Invoices Created</button>
          <button className={`tab ${tab === "costcodes" ? "active" : ""}`} onClick={() => setTab("costcodes")}>Cost Codes</button>
        </div>

        {tab === "costcodes" && <CostCodesTab />}
        {tab === "create" && <CreateInvoiceTab />}
        {tab === "created" && <InvoicesCreatedTab />}
      </div>
    </Shell>
  );
}
