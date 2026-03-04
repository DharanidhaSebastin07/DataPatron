import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { registerLocalAuthRoutes } from "./localAuth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session middleware (simple in-memory sessions — fine for local/dev)
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "datapatron-dev-secret-change-in-prod",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // set to true when using HTTPS in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Local auth routes (register, login, logout, user)
  registerLocalAuthRoutes(app);

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
