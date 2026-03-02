import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/sessions", (_req, res) => {
    const session = storage.createSession();
    res.json(session);
  });

  app.get("/api/sessions/:id", (req, res) => {
    const session = storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  });

  app.post("/api/sessions/:id/start", (req, res) => {
    const session = storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const { intent } = req.body;
    if (!intent || typeof intent !== "string") {
      return res.status(400).json({ message: "Intent is required" });
    }
    storage.startPipeline(req.params.id, intent);
    res.json({ ok: true });
  });

  app.post("/api/sessions/:id/credentials", (req, res) => {
    const session = storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const { credentials } = req.body;
    if (!credentials) {
      return res.status(400).json({ message: "Credentials are required" });
    }
    storage.submitCredentials(req.params.id, credentials);
    res.json({ ok: true });
  });

  app.post("/api/sessions/:id/table-approval", (req, res) => {
    const session = storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const { approvals } = req.body;
    if (!approvals) {
      return res.status(400).json({ message: "Approvals are required" });
    }
    storage.submitTableApproval(req.params.id, approvals);
    res.json({ ok: true });
  });

  return httpServer;
}
