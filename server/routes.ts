import type { Express } from "express";
import { createServer, type Server } from "http";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import {
  insertExecutiveSchema,
  insertClientSchema,
  Client,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

const allowedExtensions = [".txt", ".csv", ".xlsx", ".xls"];
const allowedMimeTypes = [
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    const isExtensionValid = allowedExtensions.includes(ext);
    const isMimeTypeValid = allowedMimeTypes.includes(mimetype);

    if (isExtensionValid && isMimeTypeValid) {
      cb(null, true);
    } else {
      cb(new Error("Only .txt, .csv, .xlsx, and .xls files are allowed"));
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
      const normalizedName = validatedData.name.trim().toLowerCase();

      // Busca se já existe algum cliente com o mesmo nome (case-insensitive)
      const existingClients = await storage.getClients();
      const existingClient = existingClients.find(
        (client) => client.name.trim().toLowerCase() === normalizedName
      );

      if (existingClient) {
        return res.status(400).json({
          message: `Cliente "${validatedData.name}" já está sendo atendido por ${existingClient.executiveName}`,
        });
      }

      const client = await storage.createClient({
        ...validatedData,
        name: validatedData.name.trim(),
      });

      return res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }

      console.error("Error creating client:", error);
      return res.status(500).json({ message: "Failed to create client" });
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

  async function validateAndFilterNames(names: string[], executiveId: number) {
    const trimmedNames = names
      .map((name) => name.trim())
      .filter((n) => n.length > 0);
    const uniqueNames = Array.from(new Set(trimmedNames));

    const existingClients = await storage.getClients();
    const existingNamesSet = new Set(
      existingClients.map((c) => c.name.toLowerCase())
    );

    const validClientsData = [];
    const duplicatesInDatabase: string[] = [];

    for (const name of uniqueNames) {
      if (existingNamesSet.has(name.toLowerCase())) {
        const existingClient = existingClients.find(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        );
        if (existingClient) {
          duplicatesInDatabase.push(
            `Cliente "${name}" já existe no sistema, atendido por ${existingClient.executiveName}`
          );
        }
      } else {
        validClientsData.push({
          name,
          executiveId,
          proposalSent: false,
        });
      }
    }

    return { validClientsData, duplicatesInDatabase };
  }

  // Rota de upload por arquivo
  app.post(
    "/api/clients/bulk-upload",
    (req, res, next) =>
      upload.single("file")(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
      }),
    async (req, res) => {
      try {
        if (!req.file)
          return res.status(400).json({ message: "No file uploaded" });

        const { executiveId } = req.body;
        if (!executiveId)
          return res.status(400).json({ message: "Executive ID is required" });

        const executive = await storage.getExecutive(executiveId);
        if (!executive)
          return res.status(400).json({ message: "Executive not found" });

        let names: string[] = [];
        const ext = path.extname(req.file.originalname).toLowerCase();

        if (ext === ".txt" || ext === ".csv") {
          const fileContent = req.file.buffer.toString("utf-8");
          names = fileContent.split("\n").flatMap((line) =>
            line
              .split(/[,;]/)
              .map((name) => name.trim())
              .filter((name) => name.length > 0)
          );
        } else if (ext === ".xlsx" || ext === ".xls") {
          const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          names = rows
            .map((row) => (Array.isArray(row) ? row[0] : null))
            .filter(
              (name) => typeof name === "string" && name.trim().length > 0
            )
            .map((name) => name.trim());
        } else {
          return res
            .status(400)
            .json({ message: "Unsupported file extension" });
        }

        if (names.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid names found in file" });
        }

        const { validClientsData, duplicatesInDatabase } =
          await validateAndFilterNames(names, parseInt(executiveId));

        let createdClients: Client[] = [];
        if (validClientsData.length > 0) {
          createdClients = await storage.bulkCreateClients(validClientsData);
        }

        const message =
          createdClients.length > 0
            ? `${createdClients.length} cliente(s) criado(s) com sucesso`
            : "Nenhum cliente foi criado, todos já existem no sistema";

        return res.status(201).json({
          message,
          clients: createdClients,
          duplicates: duplicatesInDatabase,
        });
      } catch (error) {
        console.error("Error processing file upload:", error);
        res.status(500).json({ message: "Erro ao processar o arquivo" });
      }
    }
  );

  // Rota de envio manual
  app.post("/api/clients/bulk-manual", async (req, res) => {
    try {
      const { names, executiveId }: { names: string[]; executiveId: number } =
        req.body;

      if (!names || !Array.isArray(names) || names.length === 0) {
        return res.status(400).json({ message: "Names array is required" });
      }

      if (!executiveId) {
        return res.status(400).json({ message: "Executive ID is required" });
      }

      const executive = await storage.getExecutive(executiveId);
      if (!executive) {
        return res.status(400).json({ message: "Executive not found" });
      }

      const { validClientsData, duplicatesInDatabase } =
        await validateAndFilterNames(names, executiveId);

      let createdClients: Client[] = [];
      if (validClientsData.length > 0) {
        createdClients = await storage.bulkCreateClients(validClientsData);
      }

      const message =
        createdClients.length > 0
          ? `${createdClients.length} cliente(s) criado(s) com sucesso`
          : "Nenhum cliente foi criado, todos já existem no sistema";

      return res.status(201).json({
        message,
        clients: createdClients,
        duplicates: duplicatesInDatabase,
      });
    } catch (error) {
      console.error("Error creating clients:", error);
      res.status(500).json({ message: "Erro interno ao criar clientes" });
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
  app.get("/api/executives/next/:id", async (req, res) => {
    try {
      const executives = await storage.getExecutives();
      if (executives.length === 0) {
        return res.status(400).json({ message: "No executives available" });
      }

      const currentId = parseInt(req.params.id);
      if (isNaN(currentId)) {
        return res.status(400).json({ message: "Invalid executive ID" });
      }
      const sortedExecutives = executives.sort((a, b) => a.id - b.id);

      let nextExecutive;
      if (!currentId) {
        nextExecutive = sortedExecutives[0];
      } else {
        const currentIndex = sortedExecutives.findIndex(
          (e) => e.id === currentId
        );
        if (currentIndex === -1) {
          nextExecutive = sortedExecutives[0];
        } else {
          const nextIndex = (currentIndex + 1) % sortedExecutives.length;
          nextExecutive = sortedExecutives[nextIndex];
        }
      }

      res.json(nextExecutive);
    } catch (error) {
      console.error("Error getting next executive:", error);
      res.status(500).json({ message: "Failed to get next executive" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
