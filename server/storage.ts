import { executives, clients, type Executive, type Client, type InsertExecutive, type InsertClient } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Executives
  getExecutives(): Promise<Executive[]>;
  getExecutive(id: number): Promise<Executive | undefined>;
  createExecutive(executive: InsertExecutive): Promise<Executive>;
  deleteExecutive(id: number): Promise<void>;

  // Clients
  getClients(): Promise<Array<Client & { executiveName: string; executiveColor: string }>>;
  getClient(id: number): Promise<Client | undefined>;
  getClientsByExecutive(executiveId: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<void>;
  bulkCreateClients(clients: InsertClient[]): Promise<Client[]>;

  // Dashboard stats
  getDashboardStats(): Promise<{
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
  }>;
}

export class DatabaseStorage implements IStorage {
  async getExecutives(): Promise<Executive[]> {
    return await db.select().from(executives).orderBy(executives.id);
  }

  async getExecutive(id: number): Promise<Executive | undefined> {
    const [executive] = await db.select().from(executives).where(eq(executives.id, id));
    return executive || undefined;
  }

  async createExecutive(insertExecutive: InsertExecutive): Promise<Executive> {
    const [executive] = await db
      .insert(executives)
      .values(insertExecutive)
      .returning();
    return executive;
  }

  async deleteExecutive(id: number): Promise<void> {
    // First delete all clients associated with this executive
    await db.delete(clients).where(eq(clients.executiveId, id));
    // Then delete the executive
    await db.delete(executives).where(eq(executives.id, id));
  }

  async getClients(): Promise<Array<Client & { executiveName: string; executiveColor: string }>> {
    const result = await db
      .select({
        id: clients.id,
        name: clients.name,
        executiveId: clients.executiveId,
        proposalSent: clients.proposalSent,
        createdAt: clients.createdAt,
        executiveName: executives.name,
        executiveColor: executives.color,
      })
      .from(clients)
      .leftJoin(executives, eq(clients.executiveId, executives.id))
      .orderBy(desc(clients.createdAt));
    
    return result.map(row => ({
      ...row,
      executiveName: row.executiveName || '',
      executiveColor: row.executiveColor || '#3B82F6',
    }));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientsByExecutive(executiveId: number): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.executiveId, executiveId));
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async bulkCreateClients(insertClients: InsertClient[]): Promise<Client[]> {
    if (insertClients.length === 0) return [];
    
    const createdClients = await db
      .insert(clients)
      .values(insertClients)
      .returning();
    return createdClients;
  }

  async getDashboardStats() {
    const allExecutives = await this.getExecutives();
    const allClients = await this.getClients();
    
    const totalClients = allClients.length;
    const totalProposals = allClients.filter(c => c.proposalSent).length;
    const conversionRate = totalClients > 0 ? (totalProposals / totalClients) * 100 : 0;

    const executiveStats = allExecutives.map(executive => {
      const executiveClients = allClients.filter(c => c.executiveId === executive.id);
      const executiveProposals = executiveClients.filter(c => c.proposalSent);
      const executiveConversionRate = executiveClients.length > 0 
        ? (executiveProposals.length / executiveClients.length) * 100 
        : 0;

      return {
        id: executive.id,
        name: executive.name,
        color: executive.color,
        clientCount: executiveClients.length,
        proposalCount: executiveProposals.length,
        conversionRate: executiveConversionRate,
      };
    });

    return {
      totalClients,
      totalProposals,
      conversionRate,
      executiveStats,
    };
  }
}

export const storage = new DatabaseStorage();
