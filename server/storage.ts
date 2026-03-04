import { type PipelineSession, type AgentStep, type ChatMessage, type LogEntry, AGENT_DEFINITIONS } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createSession(): PipelineSession;
  getSession(id: string): PipelineSession | undefined;
  startPipeline(id: string, intent: string): void;
  submitCredentials(id: string, credentials: Record<string, string>): void;
  submitTableApproval(id: string, approvals: { tableName: string; action: string; customName?: string }[]): void;
}

const PROCESSING_LOGS: Record<number, { message: string; level: LogEntry["level"]; delay: number }[]> = {
  1: [
    { message: "Initializing neural orchestration kernel...", level: "info", delay: 0 },
    { message: "Parsing user intent vector: [IDENTIFIED]", level: "info", delay: 600 },
    { message: "Analyzing NL request for semantic constraints...", level: "info", delay: 1400 },
    { message: "Identifying source engine: Azure SQL (Driver: TDS)", level: "info", delay: 2200 },
    { message: "Detecting transitive table dependencies...", level: "info", delay: 3000 },
    { message: "Determining ingestion pattern: [MERGE_OPTIMIZED]", level: "info", delay: 3600 },
    { message: "Allocating sub-agent instances for parallel node graph...", level: "info", delay: 4200 },
    { message: "Validating orchestrator resource limits...", level: "info", delay: 4800 },
    { message: "Pipeline topology established successfully.", level: "success", delay: 5600 },
  ],
  2: [
    { message: "Establishing secure handshake with HashiCorp Vault...", level: "info", delay: 0 },
    { message: "Requesting ephemeral read tokens for target endpoint...", level: "info", delay: 500 },
    { message: "Vault status: ONLINE. TLS 1.3 verify depth: 4", level: "info", delay: 1000 },
    { message: "Preparing RSA-4096 credential exchange buffer...", level: "info", delay: 1500 },
    { message: "Awaiting encrypted user credentials...", level: "warning", delay: 2000 },
  ],
  3: [
    { message: "Initializing Connection Validation Agent...", level: "info", delay: 0 },
    { message: "Auto-detecting source network driver (v18.3.1)...", level: "info", delay: 600 },
    { message: "Pinging source endpoint (p99 latency: 14ms)...", level: "info", delay: 1200 },
    { message: "Establishing TCP/IP handshake (Handshake ID: 0x4F2A)...", level: "info", delay: 2000 },
    { message: "Driver bridge initialized successfully.", level: "success", delay: 2800 },
    { message: "Establishing secure tunnel over port 1433...", level: "info", delay: 3400 },
    { message: "Encryption context: AES-256-GCM [ACTIVE]", level: "success", delay: 4000 },
    { message: "Executing source environment health probe...", level: "info", delay: 4600 },
    { message: "Checking compatibility matrix for Databricks Delta...", level: "info", delay: 5200 },
    { message: "Validation sequence: TOTAL SUCCESS", level: "success", delay: 5800 },
  ],
  4: [
    { message: "Cloning INFORMATION_SCHEMA from remote host...", level: "info", delay: 0 },
    { message: "Resolving metadata catalogs for current user context...", level: "info", delay: 700 },
    { message: "Compiling system table graph (Depth: 2)...", level: "info", delay: 1400 },
    { message: "Inventory discovered 24 tables, 182 columns.", level: "info", delay: 2200 },
    { message: "Extracting DDL for primary objects [orders, products]...", level: "info", delay: 3000 },
    { message: "Heuristic scan for sensitive data (PII detection)...", level: "info", delay: 3800 },
    { message: "Calculating cardinality estimates (Sample size: 10k)...", level: "info", delay: 4600 },
    { message: "Object cataloging complete. Generating metadata manifest.", level: "success", delay: 5600 },
  ],
  5: [
    { message: "Executing strategy cost-optimizer...", level: "info", delay: 0 },
    { message: "Analyzing data volume for optimal shuffle partitions...", level: "info", delay: 700 },
    { message: "Candidate watermark detected: [updated_at] (Card: 0.94)", level: "info", delay: 1400 },
    { message: "Ingestion mode selected: [CDC_WATERMARK_INCREMENTAL]", level: "info", delay: 2200 },
    { message: "Mapping target delta-lake table partitioning scheme...", level: "info", delay: 3000 },
    { message: "Calculating Spark resource allocation (Executors: 4)...", level: "info", delay: 3800 },
    { message: "Optimization goal: [MINIMIZE_SHUFFLE] achieved.", level: "info", delay: 4400 },
    { message: "Migration DAG compiled for deployment.", level: "success", delay: 5200 },
  ],
  6: [
    { message: "Synthesizing Delta Lake schema mappings...", level: "info", delay: 0 },
    { message: "Translating source DDL to Spark SQL v3 protocol...", level: "info", delay: 800 },
    { message: "Applying naming convention: [AZURE_SQL] -> [SNAKE_CASE]", level: "info", delay: 1400 },
    { message: "Resolving primary key parity in Unity Catalog...", level: "info", delay: 1800 },
    { message: "Injecting audit columns (_ingest_ts, _source_checksum)...", level: "info", delay: 2400 },
    { message: "Verifying binary type compatibility (SQL_BLOB -> VARBINARY)...", level: "info", delay: 3000 },
    { message: "Constructing target table constraints mapping...", level: "info", delay: 3800 },
    { message: "Table DDL drafted for all 12 candidate objects.", level: "success", delay: 5000 },
  ],
  7: [
    { message: "Initializing Table Deployment Agent...", level: "info", delay: 0 },
    { message: "Validating target catalog [main] permissions...", level: "info", delay: 600 },
    { message: "Preparing Infrastructure-as-Code (Terraform) buffer...", level: "info", delay: 1200 },
    { message: "Awaiting final approval for deployment manifest...", level: "warning", delay: 1800 },
  ],
  8: [
    { message: "Aggregating all agent outputs into master manifest...", level: "info", delay: 0 },
    { message: "Consolidating vault secret IDs and strategic DAGs...", level: "info", delay: 700 },
    { message: "Generating migration_plan.json (Version: 2.1.0)...", level: "info", delay: 1400 },
    { message: "Synthesizing CLI execution scripts (execution.py)...", level: "info", delay: 2000 },
    { message: "Verifying plan checksum integrity...", level: "info", delay: 2800 },
    { message: "Compiling human-readable summary for stakeholders...", level: "info", delay: 3600 },
    { message: "Asset bundle exported to /tmp/migration_assets/.", level: "success", delay: 4400 },
    { message: "Master Execution Plan is Ready for Deployment.", level: "success", delay: 5000 },
  ],
};

export class MemStorage implements IStorage {
  private sessions: Map<string, PipelineSession>;
  private activeTimers: Map<string, NodeJS.Timeout[]>;

  constructor() {
    this.sessions = new Map();
    this.activeTimers = new Map();
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
        content: "Welcome to DataPatron. Describe what data you'd like to ingest into your Databricks Delta Lake.",
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
          orchestration_context: {
            pipeline_id: `DP-${Math.random().toString(36).substring(7).toUpperCase()}`,
            source_system: session.sourceType,
            tables_count: session.tables.length,
            target_catalog: "main.lakehouse_bronze",
            agent_count: 8
          },
          topology: session.tables.map((t, i) => ({
            id: i + 1,
            table: t,
            sync_schedule: "daily",
            priority: "high"
          })),
        };
      case 3:
        return {
          connectivity_report: {
            status: "HEALTHY",
            probes: session.tables.map(t => ({
              table: t,
              latency_ms: Math.floor(Math.random() * 50) + 10,
              encryption: "TLS 1.3",
              result: "HANDSHAKE_SUCCESS"
            })),
          }
        };
      case 4:
        return {
          metadata_catalog: {
            source: session.sourceType,
            schema_version: "2.1",
            objects: session.tables.reduce((acc, t) => ({
              ...acc,
              [t]: {
                physical_name: `dbo.${t}`,
                columns: [
                  { name: "id", type: "BIGINT", pk: true },
                  { name: "payload", type: "NVARCHAR(MAX)" },
                  { name: "updated_at", type: "DATETIME", watermark: true }
                ],
                stats: { rows: "4.2M", size_gb: "1.2" }
              }
            }), {}),
          }
        };
      case 5:
        return {
          migration_strategy: {
            optimization_goal: "SHUFFLE_MINIMIZATION",
            partitioning_scheme: "MONTHLY_BY_DATE",
            cluster_config: { min_workers: 2, max_workers: 8, machine_type: "Standard_DS3_v2" },
            table_strategies: session.tables.map(t => ({
              table: t,
              mode: "APPEND_ONLY_DELTA",
              compaction: "enabled",
              liquid_clustering: true
            })),
          }
        };
      case 6:
        return {
          schema_definitions: session.tables.map(t => ({
            table: `bronze.${t}`,
            ddl: `CREATE TABLE IF NOT EXISTS main.bronze.${t} (\n  id BIGINT,\n  raw_json VARIANT,\n  _ingest_ts TIMESTAMP,\n  _source_checksum STRING\n) USING DELTA TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')`,
            mapping_logic: "SOURCE_TRANSLATION_V2"
          })),
        };
      case 8:
        return {
          deployment_bundle: {
            version: "PRO-4.1.0",
            deployment_id: `DP-DEPLOY-${session.id.toUpperCase()}`,
            manifest: {
              source_endpoint: "azure-sql.db.windows.net",
              target_workspace: "databricks-prod-001",
              migration_manifest_url: `s3://datapatron/plans/${session.id}/manifest.json`,
              generated_at: new Date().toISOString()
            },
            instructions: "Run 'datapatron deploy' using the provided CLI tool."
          }
        };
      default:
        return {};
    }
  }
}

export const storage = new MemStorage();
