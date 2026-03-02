import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type StepStatus = "idle" | "processing" | "completed" | "error" | "waiting_input";
export type SessionStatus = "new" | "running" | "completed" | "error";

export interface LogEntry {
  timestamp: string;
  message: string;
  level: "info" | "success" | "warning" | "error";
}

export interface AgentStep {
  id: number;
  name: string;
  shortName: string;
  description: string;
  status: StepStatus;
  isInteractive: boolean;
  logs: LogEntry[];
  artifact: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "system" | "agent";
  content: string;
  timestamp: string;
  stepId?: number;
  formType?: "credentials" | "table_approval" | null;
}

export interface PipelineSession {
  id: string;
  status: SessionStatus;
  currentStep: number;
  steps: AgentStep[];
  messages: ChatMessage[];
  intent: string | null;
  sourceType: string | null;
  tables: string[];
  createdAt: string;
}

export const AGENT_DEFINITIONS: Omit<AgentStep, "status" | "logs" | "artifact" | "startedAt" | "completedAt">[] = [
  { id: 1, name: "Master Control Agent", shortName: "MCA", description: "Parses natural language into structured pipeline plan", isInteractive: false },
  { id: 2, name: "Credentials Agent", shortName: "CRED", description: "Collects source connection credentials", isInteractive: true },
  { id: 3, name: "Validation Agent", shortName: "VALI", description: "Tests each source connection", isInteractive: false },
  { id: 4, name: "Metadata Agent", shortName: "META", description: "Extracts schema and sample data", isInteractive: false },
  { id: 5, name: "Strategy Agent", shortName: "STRAT", description: "Determines optimal ingestion strategy", isInteractive: false },
  { id: 6, name: "Schema Mapping", shortName: "SCHEMA", description: "Generates Delta table DDL statements", isInteractive: false },
  { id: 7, name: "Table Creation", shortName: "TABLE", description: "Creates Databricks Delta tables", isInteractive: true },
  { id: 8, name: "Migration Plan", shortName: "MIGRATE", description: "Produces final migration plan", isInteractive: false },
];
