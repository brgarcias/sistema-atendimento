import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const executives = pgTable("executives", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  executiveId: integer("executive_id").notNull(),
  proposalSent: boolean("proposal_sent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const executivesRelations = relations(executives, ({ many }) => ({
  clients: many(clients),
}));

export const clientsRelations = relations(clients, ({ one }) => ({
  executive: one(executives, {
    fields: [clients.executiveId],
    references: [executives.id],
  }),
}));

export const insertExecutiveSchema = createInsertSchema(executives).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export type InsertExecutive = z.infer<typeof insertExecutiveSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Executive = typeof executives.$inferSelect;
export type Client = typeof clients.$inferSelect;
