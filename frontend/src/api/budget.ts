import type { Budget } from "@/@types";
import { api } from ".";

export const fetchBudget = (month: string) =>
  api.get("/budget", { params: { month } }).then((r) => r.data.data as Budget);

export const saveBudget = (body: { month: string; amount: string }) =>
  api.put("/budget", body).then((r) => r.data.data.budget as Budget);

export const removeBudget = (month: string) =>
  api.delete("/budget", { params: { month } }).then(() => month);
