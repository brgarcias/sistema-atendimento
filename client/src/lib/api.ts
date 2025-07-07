import { apiRequest } from "./queryClient";
import type { Executive, Client, InsertExecutive, InsertClient } from "@shared/schema";

export interface ClientWithExecutive extends Client {
  executiveName: string;
  executiveColor: string;
}

export interface DashboardStats {
  totalClients: number;
  totalProposals: number;
  conversionRate: number;
  executiveStats: Array<{
    id: number;
    name: string;
    color: string;
    clientCount: number;
    proposalCount: number;
    conversionRate: number;
  }>;
}

// Executive API functions
export async function getExecutives(): Promise<Executive[]> {
  const response = await apiRequest("GET", "/api/executives");
  return response.json();
}

export async function createExecutive(executive: InsertExecutive): Promise<Executive> {
  const response = await apiRequest("POST", "/api/executives", executive);
  return response.json();
}

export async function deleteExecutive(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/executives/${id}`);
}

export async function getNextExecutive(): Promise<Executive> {
  const response = await apiRequest("GET", "/api/executives/next");
  return response.json();
}

// Client API functions
export async function getClients(): Promise<ClientWithExecutive[]> {
  const response = await apiRequest("GET", "/api/clients");
  return response.json();
}

export async function createClient(client: InsertClient): Promise<Client> {
  const response = await apiRequest("POST", "/api/clients", client);
  return response.json();
}

export async function updateClient(id: number, updates: Partial<Client>): Promise<Client> {
  const response = await apiRequest("PATCH", `/api/clients/${id}`, updates);
  return response.json();
}

export async function deleteClient(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/clients/${id}`);
}

export async function bulkCreateClients(file: File, executiveId: number): Promise<{ message: string; clients: Client[] }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('executiveId', executiveId.toString());

  const response = await fetch("/api/clients/bulk-upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const text = (await response.text()) || response.statusText;
    throw new Error(`${response.status}: ${text}`);
  }

  return response.json();
}

export async function bulkCreateClientsManual(names: string[], executiveId: number): Promise<{ message: string; clients: Client[] }> {
  const response = await apiRequest("POST", "/api/clients/bulk-manual", { names, executiveId });
  return response.json();
}

// Dashboard API functions
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiRequest("GET", "/api/dashboard/stats");
  return response.json();
}
