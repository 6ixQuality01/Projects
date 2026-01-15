export type Task = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  repeat?: "daily" | "weekly";
};
