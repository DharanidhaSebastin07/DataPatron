import { type User, type InsertUser, type PipelineSession, type AgentStep, type ChatMessage, type LogEntry, AGENT_DEFINITIONS } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSession(): PipelineSession;
  getSession(id: string): PipelineSession | undefined;
  startPipeline(id: string, intent: string): void;
  submitCredentials(id: string, credentials: Record<string, string>): void;
  submitTableApproval(id: string, approvals: { tableName: string; action: string; customName?: string }[]): void;
}

const PROCESSING_LOGS: Record<number, { message: string; level: LogEntry["level"]; delay: number }[]> = {
  1: [
    { message: "Initializing Master Control Agent...", level: "info", delay: 0 },
    { message: "Loading LLM for intent parsing...", level: "info", delay: 600 },
    { message: "Analyzing natural language request...", level: "info", delay: 1400 },
    { message: "Identifying source systems...", level: "info", delay: 2200 },
    { message: "Detecting table references...", level: "info", delay: 3000 },
    { message: "Determining ingestion mode and schedule...", level: "info", delay: 3600 },
    { message: "Building pipeline skeletons...", level: "info", delay: 4200 },
    { message: "Validating source type support...", level: "info", delay: 4800 },
    { message: "Creating one pipeline entry per table...", level: "info", delay: 5400 },
    { message: "Pipeline plan generated successfully", level: "success", delay: 6000 },
  ],
  2: [
    { message: "Loading credential handler module...", level: "info", delay: 0 },
    { message: "Detecting source type from pipeline plan...", level: "info", delay: 500 },
    { message: "Source type identified: Azure SQL", level: "info", delay: 1000 },
    { message: "Preparing credential collection form...", level: "info", delay: 1500 },
    { message: "Awaiting user credentials...", level: "warning", delay: 2000 },
  ],
  3: [
    { message: "Initializing Connection Validation Agent...", level: "info", delay: 0 },
    { message: "Loading driver auto-detection module...", level: "info", delay: 600 },
    { message: "Testing connection to Azure SQL source...", level: "info", delay: 1200 },
    { message: "Attempting ODBC Driver 18...", level: "info", delay: 2000 },
    { message: "Driver loaded successfully", level: "success", delay: 2800 },
    { message: "Establishing secure connection...", level: "info", delay: 3400 },
    { message: "Connection established", level: "success", delay: 4000 },
    { message: "Running health check queries...", level: "info", delay: 4600 },
    { message: "Querying INFORMATION_SCHEMA...", level: "info", delay: 5200 },
    { message: "Connection validation: PASSED", level: "success", delay: 5800 },
  ],
  4: [
    { message: "Initializing Metadata Extraction Agent...", level: "info", delay: 0 },
    { message: "Connecting to validated source...", level: "info", delay: 700 },
    { message: "Querying INFORMATION_SCHEMA.TABLES...", level: "info", delay: 1400 },
    { message: "Discovered tables: orders, products", level: "info", delay: 2200 },
    { message: "Extracting schema for [orders]...", level: "info", delay: 3000 },
    { message: "Fetching sample rows: SELECT TOP 5 * FROM orders", level: "info", delay: 3800 },
    { message: "Extracting schema for [products]...", level: "info", delay: 4600 },
    { message: "Fetching sample rows: SELECT TOP 5 * FROM products", level: "info", delay: 5200 },
    { message: "Metadata extraction complete", level: "success", delay: 5800 },
  ],
  5: [
    { message: "Initializing Pipeline Strategy Agent...", level: "info", delay: 0 },
    { message: "Analyzing metadata for ingestion strategy...", level: "info", delay: 700 },
    { message: "Scanning columns for watermark candidates...", level: "info", delay: 1400 },
    { message: "Found watermark column: updated_at (type: datetime)", level: "info", delay: 2200 },
    { message: "Determining write strategy: incremental + merge", level: "info", delay: 3000 },
    { message: "Calculating parallelism based on row count...", level: "info", delay: 3800 },
    { message: "Parallelism set to 4 (< 10,000 rows)", level: "info", delay: 4400 },
    { message: "Detecting partition columns...", level: "info", delay: 5000 },
    { message: "Strategy optimization complete", level: "success", delay: 5600 },
  ],
  6: [
    { message: "Initializing Schema Mapping Agent...", level: "info", delay: 0 },
    { message: "Inferring Databricks Delta column types...", level: "info", delay: 800 },
    { message: "Mapping: order_id (int) -> BIGINT", level: "info", delay: 1400 },
    { message: "Mapping: customer_name (str) -> STRING", level: "info", delay: 1800 },
    { message: "Mapping: order_date (date) -> DATE", level: "info", delay: 2200 },
    { message: "Mapping: total_amount (float) -> DOUBLE", level: "info", delay: 2600 },
    { message: "Detecting primary keys...", level: "info", delay: 3200 },
    { message: "Primary key detected: order_id", level: "info", delay: 3800 },
    { message: "Adding governance columns: ingestion_ts, source_system", level: "info", delay: 4400 },
    { message: "Generating CREATE TABLE DDL...", level: "info", delay: 5000 },
    { message: "Schema mapping complete", level: "success", delay: 5600 },
  ],
  7: [
    { message: "Initializing Table Creation Agent...", level: "info", delay: 0 },
    { message: "Loading schema definitions...", level: "info", delay: 600 },
    { message: "Preparing DDL preview for user review...", level: "info", delay: 1200 },
    { message: "Awaiting user approval for table names...", level: "warning", delay: 1800 },
  ],
  8: [
    { message: "Initializing Migration Plan Generator...", level: "info", delay: 0 },
    { message: "Loading credentials from CRED output...", level: "info", delay: 700 },
    { message: "Loading table creation status...", level: "info", delay: 1400 },
    { message: "Loading strategy definitions...", level: "info", delay: 2000 },
    { message: "Consolidating migration entries...", level: "info", delay: 2800 },
    { message: "Generating migration_plan.json...", level: "info", delay: 3600 },
    { message: "Writing manifest file...", level: "info", delay: 4200 },
    { message: "Migration plan generated successfully", level: "success", delay: 4800 },
  ],
};

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, PipelineSession>;
  private activeTimers: Map<string, NodeJS.Timeout[]>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.activeTimers = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  createSession(): PipelineSession {
    const id = randomUUID().slice(0, 8);
    const steps: AgentStep[] = AGENT_DEFINITIONS.map((def) => ({
      ...def,
      status: "idle" as const,
      logs: [],
      artifact: null,
      startedAt: null,
      completedAt: null,
    }));

    const session: PipelineSession = {
      id,
      status: "new",
      currentStep: 0,
      steps,
      messages: [{
        id: randomUUID(),
        role: "system",
        content: "Welcome to the Bronze Ingestion Platform. Describe what data you'd like to ingest into your Databricks Delta Lake.",
        timestamp: new Date().toISOString(),
      }],
      intent: null,
      sourceType: null,
      tables: [],
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): PipelineSession | undefined {
    return this.sessions.get(id);
  }

  startPipeline(id: string, intent: string): void {
    const session = this.sessions.get(id);
    if (!session) return;

    session.intent = intent;
    session.status = "running";
    session.currentStep = 1;

    const intentLower = intent.toLowerCase();
    if (intentLower.includes("s3") || intentLower.includes("aws")) {
      session.sourceType = "S3";
    } else if (intentLower.includes("postgres")) {
      session.sourceType = "PostgreSQL";
    } else if (intentLower.includes("rest") || intentLower.includes("api")) {
      session.sourceType = "REST API";
    } else {
      session.sourceType = "Azure SQL";
    }

    const tableMatches = intentLower.match(/(?:tables?|ingest)\s+(\w+(?:\s*(?:,|and)\s*\w+)*)/i);
    if (tableMatches) {
      session.tables = tableMatches[1].split(/\s*(?:,|and)\s*/).map(t => t.trim()).filter(Boolean);
    } else {
      session.tables = ["orders", "products"];
    }

    session.messages.push({
      id: randomUUID(),
      role: "user",
      content: intent,
      timestamp: new Date().toISOString(),
    });

    session.messages.push({
      id: randomUUID(),
      role: "agent",
      content: `Starting pipeline for ${session.sourceType} ingestion. I've identified ${session.tables.length} table(s): ${session.tables.join(", ")}. Processing through 8 agent stages now.`,
      timestamp: new Date().toISOString(),
      stepId: 1,
    });

    this.processStep(id, 1);
  }

  submitCredentials(id: string, credentials: Record<string, string>): void {
    const session = this.sessions.get(id);
    if (!session || session.currentStep !== 2) return;

    session.messages.push({
      id: randomUUID(),
      role: "user",
      content: "Credentials submitted",
      timestamp: new Date().toISOString(),
      stepId: 2,
    });

    const step = session.steps[1];
    step.logs.push({
      timestamp: new Date().toISOString(),
      message: "Credentials received",
      level: "success",
    });
    step.logs.push({
      timestamp: new Date().toISOString(),
      message: "Encrypting sensitive fields...",
      level: "info",
    });

    setTimeout(() => {
      step.logs.push({
        timestamp: new Date().toISOString(),
        message: "Credentials stored securely",
        level: "success",
      });
      step.status = "completed";
      step.completedAt = new Date().toISOString();
      step.artifact = { credentials: { ...credentials, password: "***" } };

      session.messages.push({
        id: randomUUID(),
        role: "agent",
        content: "Credentials secured. Moving to connection validation...",
        timestamp: new Date().toISOString(),
        stepId: 2,
      });

      session.currentStep = 3;
      this.processStep(id, 3);
    }, 1500);
  }

  submitTableApproval(id: string, approvals: { tableName: string; action: string; customName?: string }[]): void {
    const session = this.sessions.get(id);
    if (!session || session.currentStep !== 7) return;

    session.messages.push({
      id: randomUUID(),
      role: "user",
      content: `Approved ${approvals.filter(a => a.action !== "skip").length} table(s)`,
      timestamp: new Date().toISOString(),
      stepId: 7,
    });

    const step = session.steps[6];
    for (const approval of approvals) {
      if (approval.action === "skip") {
        step.logs.push({ timestamp: new Date().toISOString(), message: `Skipped table: ${approval.tableName}`, level: "warning" });
      } else {
        const finalName = approval.action === "rename" ? approval.customName : approval.tableName;
        step.logs.push({ timestamp: new Date().toISOString(), message: `Creating table: ${finalName}`, level: "info" });
      }
    }

    setTimeout(() => {
      step.logs.push({ timestamp: new Date().toISOString(), message: "Submitting DDL via Databricks SQL API...", level: "info" });

      setTimeout(() => {
        step.logs.push({ timestamp: new Date().toISOString(), message: "Polling statement status...", level: "info" });

        setTimeout(() => {
          step.logs.push({ timestamp: new Date().toISOString(), message: "All tables created successfully", level: "success" });
          step.status = "completed";
          step.completedAt = new Date().toISOString();
          step.artifact = { tables: approvals };

          session.messages.push({
            id: randomUUID(),
            role: "agent",
            content: "Tables created in Databricks. Generating final migration plan...",
            timestamp: new Date().toISOString(),
            stepId: 7,
          });

          session.currentStep = 8;
          this.processStep(id, 8);
        }, 1500);
      }, 1200);
    }, 800);
  }

  private processStep(sessionId: string, stepNum: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const step = session.steps[stepNum - 1];
    if (!step) return;

    step.status = "processing";
    step.startedAt = new Date().toISOString();

    const logs = PROCESSING_LOGS[stepNum] || [];
    const timers: NodeJS.Timeout[] = [];

    for (const logEntry of logs) {
      const timer = setTimeout(() => {
        step.logs.push({
          timestamp: new Date().toISOString(),
          message: logEntry.message,
          level: logEntry.level,
        });
      }, logEntry.delay);
      timers.push(timer);
    }

    const lastLog = logs[logs.length - 1];
    const totalTime = lastLog ? lastLog.delay + 800 : 2000;

    if (step.isInteractive) {
      const waitTimer = setTimeout(() => {
        step.status = "waiting_input";

        if (stepNum === 2) {
          session.messages.push({
            id: randomUUID(),
            role: "agent",
            content: `I need your ${session.sourceType} connection credentials to proceed. Please fill in the details below.`,
            timestamp: new Date().toISOString(),
            stepId: 2,
            formType: "credentials",
          });
        } else if (stepNum === 7) {
          session.messages.push({
            id: randomUUID(),
            role: "agent",
            content: "Please review and approve the table names below before I create them in Databricks.",
            timestamp: new Date().toISOString(),
            stepId: 7,
            formType: "table_approval",
          });
        }
      }, totalTime);
      timers.push(waitTimer);
    } else {
      const completeTimer = setTimeout(() => {
        step.status = "completed";
        step.completedAt = new Date().toISOString();
        step.artifact = this.generateArtifact(stepNum, session);

        if (stepNum < 8) {
          const nextStep = stepNum + 1;
          session.currentStep = nextStep;

          const transitionMessages: Record<number, string> = {
            1: `Intent parsed successfully. Identified ${session.sourceType} source with tables: ${session.tables.join(", ")}. Moving to credential collection...`,
            3: "All connections validated successfully. Extracting metadata from source...",
            4: "Metadata extracted. Analyzing data for optimal ingestion strategy...",
            5: "Strategy determined. Generating schema mappings and DDL...",
            6: "Schema mappings complete. Preparing tables for your review...",
          };

          if (transitionMessages[stepNum]) {
            session.messages.push({
              id: randomUUID(),
              role: "agent",
              content: transitionMessages[stepNum],
              timestamp: new Date().toISOString(),
              stepId: stepNum,
            });
          }

          this.processStep(sessionId, nextStep);
        } else {
          session.status = "completed";
          session.messages.push({
            id: randomUUID(),
            role: "agent",
            content: "Pipeline complete! Your migration plan has been generated. All 8 agents have finished processing. You can now download the migration_plan.json and run execution.py against your Databricks workspace.",
            timestamp: new Date().toISOString(),
            stepId: 8,
          });
        }
      }, totalTime);
      timers.push(completeTimer);
    }

    this.activeTimers.set(`${sessionId}-${stepNum}`, timers);
  }

  private generateArtifact(stepNum: number, session: PipelineSession): Record<string, unknown> {
    switch (stepNum) {
      case 1:
        return {
          pipelines: session.tables.map((t, i) => ({
            pipeline_id: `pipeline_${i + 1}`,
            source_type: session.sourceType?.toLowerCase().replace(" ", "_"),
            table: t,
            ingestion_mode: "incremental",
            schedule: "daily",
          })),
        };
      case 3:
        return {
          results: session.tables.map(t => ({
            table: t,
            status: "success",
            message: "Connection validated",
          })),
        };
      case 4:
        return {
          tables: session.tables.reduce((acc, t) => ({
            ...acc,
            [t]: {
              columns: ["id", "name", "created_at", "updated_at"],
              sample_rows: 5,
            },
          }), {}),
        };
      case 5:
        return {
          strategies: session.tables.map(t => ({
            table: t,
            write_strategy: "merge",
            watermark_column: "updated_at",
            partition_by: "created_at",
            parallelism: 4,
          })),
        };
      case 6:
        return {
          schemas: session.tables.map(t => ({
            table: `main.bronze.${t}`,
            ddl: `CREATE TABLE IF NOT EXISTS main.bronze.${t} (\n  id BIGINT,\n  name STRING,\n  created_at DATE,\n  updated_at TIMESTAMP,\n  ingestion_ts TIMESTAMP,\n  source_system STRING\n)`,
            primary_key: "id",
          })),
        };
      case 8:
        return {
          migration_plan: session.tables.map(t => ({
            source_name: t,
            target_table: `main.bronze.${t}`,
            write_strategy: "merge",
            load_type: "incremental",
            watermark_column: "updated_at",
            parallelism: 4,
          })),
        };
      default:
        return {};
    }
  }
}

export const storage = new MemStorage();
