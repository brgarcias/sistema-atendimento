import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExecutiveSchema, insertClientSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/plain" || file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Only .txt and .csv files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Executive routes
  app.get("/api/executives", async (req, res) => {
    try {
      const executives = await storage.getExecutives();
      res.json(executives);
    } catch (error) {
      console.error("Error fetching executives:", error);
      res.status(500).json({ message: "Failed to fetch executives" });
    }
  });

  app.post("/api/executives", async (req, res) => {
    try {
      const validatedData = insertExecutiveSchema.parse(req.body);

      // Check if executive with this name already exists
      const existingExecutives = await storage.getExecutives();
      const nameExists = existingExecutives.some(
        (exec) => exec.name.toLowerCase() === validatedData.name.toLowerCase()
      );

      if (nameExists) {
        return res
          .status(400)
          .json({ message: "Executivo já existe na lista" });
      }

      const executive = await storage.createExecutive(validatedData);
      res.status(201).json(executive);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating executive:", error);
        res.status(500).json({ message: "Failed to create executive" });
      }
    }
  });

  app.delete("/api/executives/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid executive ID" });
      }

      // Check if this is the last executive
      const executives = await storage.getExecutives();
      if (executives.length <= 1) {
        return res
          .status(400)
          .json({ message: "Deve haver pelo menos um executivo" });
      }

      const executive = await storage.getExecutive(id);
      if (!executive) {
        return res.status(404).json({ message: "Executive not found" });
      }

      await storage.deleteExecutive(id);
      res.json({ message: "Executive deleted successfully" });
    } catch (error) {
      console.error("Error deleting executive:", error);
      res.status(500).json({ message: "Failed to delete executive" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);

      // Check if client with this name already exists
      const existingClients = await storage.getClients();
      const nameExists = existingClients.some(
        (client) =>
          client.name.toLowerCase() === validatedData.name.toLowerCase()
      );

      if (nameExists) {
        const existingClient = existingClients.find(
          (c) => c.name.toLowerCase() === validatedData.name.toLowerCase()
        );
        return res.status(400).json({
          message: `Cliente "${validatedData.name}" já está sendo atendido por ${existingClient?.executiveName}`,
        });
      }

      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating client:", error);
        res.status(500).json({ message: "Failed to create client" });
      }
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const client = await storage.updateClient(id, req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      await storage.deleteClient(id);
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Bulk upload route
  app.post(
    "/api/clients/bulk-upload",
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const { executiveId } = req.body;
        if (!executiveId) {
          return res.status(400).json({ message: "Executive ID is required" });
        }

        const executive = await storage.getExecutive(parseInt(executiveId));
        if (!executive) {
          return res.status(400).json({ message: "Executive not found" });
        }

        const fileContent = req.file.buffer.toString("utf-8");
        const names = fileContent
          .split("\n")
          .map((name) => name.trim())
          .filter((name) => name.length > 0);

        if (names.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid names found in file" });
        }

        const clientsData = names.map((name) => ({
          name,
          executiveId: parseInt(executiveId),
          proposalSent: false,
        }));

        const createdClients = await storage.bulkCreateClients(clientsData);
        res.status(201).json({
          message: `${createdClients.length} clients created successfully`,
          clients: createdClients,
        });
      } catch (error) {
        console.error("Error processing file upload:", error);
        res.status(500).json({ message: "Failed to process file upload" });
      }
    }
  );

  // Manual bulk upload route
  app.post("/api/clients/bulk-manual", async (req, res) => {
    try {
      const { names, executiveId } = req.body;

      if (!names || !Array.isArray(names) || names.length === 0) {
        return res.status(400).json({ message: "Names array is required" });
      }

      if (!executiveId) {
        return res.status(400).json({ message: "Executive ID is required" });
      }

      const executive = await storage.getExecutive(parseInt(executiveId));
      if (!executive) {
        return res.status(400).json({ message: "Executive not found" });
      }

      const clientsData = names.map((name) => ({
        name: name.trim(),
        executiveId: parseInt(executiveId),
        proposalSent: false,
      }));

      const createdClients = await storage.bulkCreateClients(clientsData);
      res.status(201).json({
        message: `${createdClients.length} clients created successfully`,
        clients: createdClients,
      });
    } catch (error) {
      console.error("Error creating clients:", error);
      res.status(500).json({ message: "Failed to create clients" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Round-robin assignment helper
  app.get("/api/executives/next", async (req, res) => {
    try {
      const executives = await storage.getExecutives();
      if (executives.length === 0) {
        return res.status(400).json({ message: "No executives available" });
      }

      // Simple round-robin: get executive with least clients
      const stats = await storage.getDashboardStats();
      const leastBusyExecutive = stats.executiveStats.reduce((min, exec) =>
        exec.clientCount < min.clientCount ? exec : min
      );

      const executive = await storage.getExecutive(leastBusyExecutive.id);
      res.json(executive);
    } catch (error) {
      console.error("Error getting next executive:", error);
      res.status(500).json({ message: "Failed to get next executive" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
