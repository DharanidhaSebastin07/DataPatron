import React from "react";
import { type AgentStep, type StepStatus } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  KeyRound,
  ShieldCheck,
  Database,
  GitBranch,
  TableProperties,
  Table2,
  FileOutput,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  CircleCheck,
  TriangleAlert,
  CircleX,
} from "lucide-react";

const STEP_ICONS: Record<number, typeof Brain> = {
  1: Brain,
  2: KeyRound,
  3: ShieldCheck,
  4: Database,
  5: GitBranch,
  6: TableProperties,
  7: Table2,
  8: FileOutput,
};

const STEP_FULL_NAMES: Record<number, string> = {
  1: "Master Control Agent",
  2: "Credentials Agent",
  3: "Validation Agent",
  4: "Metadata Agent",
  5: "Strategy Agent",
  6: "Schema Mapping",
  7: "Table Creation",
  8: "Migration Plan",
};

function StatusIndicator({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center" data-testid="status-completed">
        <Check className="w-3 h-3 text-white" />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" data-testid="status-error">
        <AlertCircle className="w-3 h-3 text-white" />
      </div>
    );
  }
  if (status === "waiting_input") {
    return (
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center animate-glow-pulse" style={{ backgroundColor: "#f18a31" }} data-testid="status-waiting">
        <Clock className="w-3 h-3 text-white" />
      </div>
    );
  }
  return null;
}

function ConnectionLine({ fromStatus, toStatus }: { fromStatus: StepStatus; toStatus: StepStatus }) {
  const isActive = fromStatus === "completed" && (toStatus === "processing" || toStatus === "completed" || toStatus === "waiting_input");
  const isComplete = fromStatus === "completed" && toStatus === "completed";
  const isFlowing = fromStatus === "completed" && toStatus === "processing";

  return (
    <div className="flex-1 flex items-center relative min-w-[30px]">
      <div className={cn(
        "w-full h-[2px] rounded-full transition-all duration-700",
        isComplete ? "bg-emerald-500/60" : isActive ? "bg-[#033c67]/40" : "bg-muted-foreground/10"
      )} />
      {isFlowing && (
        <div className="absolute inset-0 flex items-center">
          <motion.div
            className="absolute w-3 h-[2px] rounded-full"
            style={{ backgroundColor: "#f46902" }} // brand orange
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}

interface AgentNodeProps {
  step: AgentStep;
  isActive: boolean;
  index: number;
}

function AgentNode({ step, isActive, index }: AgentNodeProps) {
  const Icon = STEP_ICONS[step.id] || Brain;
  const status = step.status;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="flex flex-col items-center gap-4 relative shrink-0"
      data-testid={`agent-node-${step.id}`}
    >
      <div className={cn(
        "relative w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-background",
        status === "idle" && "border-muted-foreground/15",
        status === "processing" && "border-[#033c67] bg-[#033c67]/5",
        status === "completed" && "border-emerald-500/70 bg-emerald-500/5",
        status === "error" && "border-red-500 bg-red-500/5",
        status === "waiting_input" && "border-primary/70 bg-primary/5",
        isActive && "ring-2 ring-[#033c67]/20 ring-offset-2",
      )}>
        {status === "processing" && (
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#033c67] animate-spin" />
        )}
        {status === "processing" ? (
          <Loader2 className="w-4.5 h-4.5 animate-spin text-[#033c67]" />
        ) : (
          <Icon className={cn(
            "w-4.5 h-4.5 transition-colors duration-300",
            status === "idle" && "text-muted-foreground/40",
            status === "completed" && "text-emerald-500",
            status === "error" && "text-red-500",
            status === "waiting_input" && "text-primary",
          )} />
        )}
        <StatusIndicator status={status} />
      </div>
      <span className={cn(
        "text-[10px] font-bold tracking-tight transition-colors duration-300 max-w-[80px] text-center leading-[1.2]",
        status === "idle" && "text-muted-foreground/40",
        status === "processing" && "text-[#033c67]",
        status === "completed" && "text-emerald-500",
        status === "error" && "text-red-500",
        status === "waiting_input" && "text-primary/70",
      )}>
        {step.name}
      </span>
    </motion.div>
  );
}

interface PipelineFlowProps {
  steps: AgentStep[];
  currentStep: number;
}

export function PipelineFlow({ steps, currentStep }: PipelineFlowProps) {
  const completedCount = steps.filter(s => s.status === "completed").length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="w-full" data-testid="pipeline-flow">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {progress === 100 ? "pipeline completed" : "Master Pipeline"}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{completedCount}/{steps.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden border border-border/50">
            <motion.div
              className="h-full rounded-full"
              style={{ background: progress === 100 ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #033c67, #f46902)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <div className="flex items-start justify-between w-full px-2">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <AgentNode
              step={step}
              isActive={step.id === currentStep}
              index={i}
            />
            {i < steps.length - 1 && (
              <div className="flex-1 mt-5 px-1">
                <ConnectionLine
                  fromStatus={step.status}
                  toStatus={steps[i + 1].status}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface AgentDetailProps {
  step: AgentStep | null;
  sessionStatus: string;
}

export function AgentDetail({ step, sessionStatus }: AgentDetailProps) {
  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground/50 text-sm">
        Start a pipeline to see agent activity
      </div>
    );
  }

  const Icon = STEP_ICONS[step.id] || Brain;
  const fullName = STEP_FULL_NAMES[step.id] || step.name;

  return (
    <div className="flex-1 flex flex-col min-h-0" data-testid="agent-detail">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          step.status === "processing" && "bg-[#033c67]/10",
          step.status === "completed" && "bg-emerald-500/10",
          step.status === "waiting_input" && "bg-primary/10",
          step.status === "idle" && "bg-muted/50",
          step.status === "error" && "bg-red-500/10",
        )}>
          <Icon className={cn(
            "w-5 h-5",
            step.status === "processing" && "text-[#033c67]",
            step.status === "completed" && "text-emerald-500",
            step.status === "waiting_input" && "text-primary",
            step.status === "idle" && "text-muted-foreground",
            step.status === "error" && "text-red-500",
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold">{fullName}</h3>
          <p className="text-xs text-muted-foreground">{step.description}</p>
        </div>
        <div className="ml-auto shrink-0">
          {step.status === "processing" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#033c67]/10 text-[#033c67]">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing
            </span>
          )}
          {step.status === "completed" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="w-3 h-3" />
              Complete
            </span>
          )}
          {step.status === "waiting_input" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
              <Clock className="w-3 h-3" />
              Awaiting Input
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 rounded-xl border border-border/40 overflow-hidden bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-muted/20">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Agent Logs</span>
          {step.logs.length > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground/40">{step.logs.length} entries</span>
          )}
        </div>
        <div className="p-4 overflow-y-auto max-h-[280px] space-y-1.5 font-mono text-xs">
          <AnimatePresence>
            {step.logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3 py-0.5"
              >
                <span className="text-muted-foreground/40 shrink-0 w-16 text-right tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <span className={cn(
                  "flex-1 inline-flex items-start gap-1.5",
                  log.level === "info" && "text-foreground/70",
                  log.level === "success" && "text-emerald-400",
                  log.level === "warning" && "text-amber-400",
                  log.level === "error" && "text-red-400",
                )}>
                  {log.level === "success" && <CircleCheck className="w-3 h-3 mt-0.5 shrink-0" />}
                  {log.level === "warning" && <TriangleAlert className="w-3 h-3 mt-0.5 shrink-0" />}
                  {log.level === "error" && <CircleX className="w-3 h-3 mt-0.5 shrink-0" />}
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {step.status === "processing" && (
            <div className="flex items-center gap-1.5 pt-3 pl-[76px]">
              <div className="w-1.5 h-1.5 rounded-full animate-typing-dot bg-[#033c67]" />
              <div className="w-1.5 h-1.5 rounded-full animate-typing-dot bg-[#033c67]" style={{ animationDelay: "0.2s" }} />
              <div className="w-1.5 h-1.5 rounded-full animate-typing-dot bg-[#033c67]" style={{ animationDelay: "0.4s" }} />
            </div>
          )}
          {step.logs.length === 0 && step.status === "idle" && (
            <div className="text-muted-foreground/30 text-center py-8">
              Waiting to start...
            </div>
          )}
        </div>
      </div>

      {step.artifact && step.status === "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileOutput className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-500">Artifact Generated</span>
          </div>
          <pre className="text-[10px] font-mono text-muted-foreground/70 overflow-x-auto max-h-[120px] overflow-y-auto">
            {JSON.stringify(step.artifact, null, 2)}
          </pre>
        </motion.div>
      )}
    </div>
  );
}
