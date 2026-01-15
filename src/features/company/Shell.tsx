import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <div className="content">
        <Topbar />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
