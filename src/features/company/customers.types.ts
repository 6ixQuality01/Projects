export type Project = {
  id: string;
  name: string;
};

export type Customer = {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  projectIds: string[]; // multi-select (pode ser mais de um projeto)
};
