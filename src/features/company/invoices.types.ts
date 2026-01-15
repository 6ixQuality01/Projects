export type CostCode = {
  id: string;
  code: string;   // número do código (RSMeans style)
  title: string;  // título
};

export type InvoiceLineItem = {
  id: string;
  name: string;        // item micro
  qty: number;
  unit: string;        // ex: "EA", "SF"
  unitPrice: number;
};

export type InvoiceMacroLine = {
  id: string;
  costCodeId: string;    // macro tem um cost code
  description: string;   // description do macro
  items: InvoiceLineItem[];
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  projectId: string;
  invoiceName: string;
  createdAt: string; // ISO date
  macros: InvoiceMacroLine[];
};
