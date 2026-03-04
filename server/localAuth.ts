import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { Express, Request, Response, NextFunction } from "express";

// Augment express-session to allow userId
declare module "express-session" {
    interface SessionData {
        userId: string | null;
    }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocalUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
}

interface StoredUser extends LocalUser {
    passwordHash: string;
    passwordSalt: string;
}

// ─── File-backed storage ──────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function readUsers(): StoredUser[] {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    } catch {
        return [];
    }
}

function writeUsers(users: StoredUser[]) {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// ─── Password helpers ─────────────────────────────────────────────────────────

function hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
    return crypto.randomBytes(16).toString("hex");
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function findByEmail(email: string) {
    return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function sanitize(u: StoredUser): LocalUser {
    const { passwordHash: _h, passwordSalt: _s, ...rest } = u;
    return rest;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function isLocallyAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const session = req.session as any;
    if (!session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    next();
}

// ─── Route registration ───────────────────────────────────────────────────────

export function registerLocalAuthRoutes(app: Express) {
    // Register
    app.post("/api/auth/register", (req: Request, res: Response) => {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password || !firstName) {
            return res.status(400).json({ message: "Email, password and first name are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existing = findByEmail(email);
        if (existing) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const salt = generateSalt();
        const user: StoredUser = {
            id: crypto.randomUUID(),
            email: email.toLowerCase().trim(),
            firstName: firstName.trim(),
            lastName: (lastName || "").trim(),
            passwordHash: hashPassword(password, salt),
            passwordSalt: salt,
            createdAt: new Date().toISOString(),
        };

        const users = readUsers();
        users.push(user);
        writeUsers(users);

        (req.session as any).userId = user.id;

        return res.status(201).json(sanitize(user));
    });

    // Login
    app.post("/api/auth/login", (req: Request, res: Response) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const hash = hashPassword(password, user.passwordSalt);
        if (hash !== user.passwordHash) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        (req.session as any).userId = user.id;
        return res.json(sanitize(user));
    });

    // Get current user
    app.get("/api/auth/user", (req: Request, res: Response) => {
        const session = req.session as any;
        if (!session?.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const users = readUsers();
        const user = users.find((u) => u.id === session.userId);
        if (!user) {
            session.userId = null;
            return res.status(401).json({ message: "User not found" });
        }

        return res.json(sanitize(user));
    });

    // Logout
    app.post("/api/auth/logout", (req: Request, res: Response) => {
        req.session.destroy(() => {
            res.json({ ok: true });
        });
    });

    // Also handle GET logout for redirect flows
    app.get("/api/logout", (req: Request, res: Response) => {
        req.session.destroy(() => {
            res.redirect("/auth");
        });
    });
}
