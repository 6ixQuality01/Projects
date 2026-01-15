import { SetupCompanyPage } from "../features/company/SetupCompanyPage";
import { CompanyInfoPage } from "../features/company/CompanyInfoPage";
import { HomePage } from "../features/home/HomePage";
import { CustomersPage } from "../features/customers/CustomersPage";
import { InvoicesPage } from "../features/invoices/InvoicesPage";

export const routes = [
  { path: "/setup-company", element: <SetupCompanyPage /> }, // first login (Setup da Empresa)
  { path: "/company", element: <CompanyInfoPage /> },        // Company Information
  { path: "/home", element: <HomePage /> },                  // Tasks + Calendar
  { path: "/customers", element: <CustomersPage /> },        // Add New Customer modal
  { path: "/invoices", element: <InvoicesPage /> },          // tabs: cost codes / create new / created
];
