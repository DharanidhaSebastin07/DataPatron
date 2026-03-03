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
  ChevronRight,
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

const STEP_COLORS: Record<number, string> = {
  1: "#f46902",
  2: "#f18a31",
  3: "#033c67",
  4: "#0e5a8a",
  5: "#f46902",
  6: "#033c67",
  7: "#f18a31",
  8: "#0e5a8a",
};

interface AgentCardProps {
  step: AgentStep;
  isActive: boolean;
  index: number;
  total: number;
}

function AgentCard({ step, isActive, index }: AgentCardProps) {
  const Icon = STEP_ICONS[step.id] || Brain;
  const status = step.status;
  const accentColor = STEP_COLORS[step.id] || "#f46902";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "relative flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-400 min-w-0",
        status === "idle" && "border-border/30 bg-card/30 opacity-50",
        status === "processing" && "border-primary/50 bg-primary/5 shadow-md",
        status === "completed" && "border-emerald-500/30 bg-emerald-500/5",
        status === "error" && "border-red-500/40 bg-red-500/5",
        status === "waiting_input" && "border-amber-500/40 bg-amber-500/5",
        isActive && status === "processing" && "ring-1 ring-primary/30",
      )}
      data-testid={`agent-node-${step.id}`}
    >
      {status === "processing" && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-20"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className={cn(
        "relative w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all duration-300",
        status === "idle" && "bg-muted/50",
        status === "processing" && "bg-primary/15",
        status === "completed" && "bg-emerald-500/15",
        status === "error" && "bg-red-500/15",
        status === "waiting_input" && "bg-amber-500/15",
      )}>
        {status === "processing" ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : status === "completed" ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : status === "error" ? (
          <AlertCircle className="w-4 h-4 text-red-500" />
        ) : status === "waiting_input" ? (
          <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
        ) : (
          <Icon className="w-4 h-4 text-muted-foreground/40" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className={cn(
          "text-[11px] font-semibold truncate transition-colors duration-300",
          status === "idle" && "text-muted-foreground/50",
          status === "processing" && "text-primary",
          status === "completed" && "text-emerald-600 dark:text-emerald-400",
          status === "error" && "text-red-500",
          status === "waiting_input" && "text-amber-600 dark:text-amber-400",
        )}>
          {step.shortName}
        </div>
        <div className="text-[9px] text-muted-foreground/50 truncate">
          {status === "processing" ? "Running..." :
           status === "completed" ? "Done" :
           status === "waiting_input" ? "Input needed" :
           status === "error" ? "Failed" :
           `Step ${step.id}`}
        </div>
      </div>
    </motion.div>
  );
}

function StepConnector({ fromStatus, toStatus }: { fromStatus: StepStatus; toStatus: StepStatus }) {
  const isActive = fromStatus === "completed" && (toStatus === "processing" || toStatus === "completed" || toStatus === "waiting_input");
  const isFlowing = fromStatus === "completed" && toStatus === "processing";

  return (
    <div className="flex items-center shrink-0 w-5">
      <div className="relative w-full flex items-center justify-center">
        <ChevronRight className={cn(
          "w-3.5 h-3.5 transition-colors duration-500",
          isActive ? "text-emerald-500/60" : "text-muted-foreground/15"
        )} />
        {isFlowing && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-primary" />
          </motion.div>
        )}
      </div>
    </div>
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
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "#033c67" }}>Pipeline Progress</span>
          <span className="text-xs font-mono text-primary">{completedCount}/{steps.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #f46902, #f18a31, #22c55e)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center min-w-0">
            <div className="min-w-[110px] max-w-[140px]">
              <AgentCard
                step={step}
                isActive={step.id === currentStep}
                index={i}
                total={steps.length}
              />
            </div>
            {i < steps.length - 1 && (
              <StepConnector
                fromStatus={step.status}
                toStatus={steps[i + 1].status}
              />
            )}
          </div>
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

  return (
    <div className="flex-1 flex flex-col min-h-0" data-testid="agent-detail">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          step.status === "processing" && "bg-primary/10",
          step.status === "completed" && "bg-emerald-500/10",
          step.status === "waiting_input" && "bg-amber-500/10",
          step.status === "idle" && "bg-muted/50",
          step.status === "error" && "bg-red-500/10",
        )}>
          <Icon className={cn(
            "w-4 h-4",
            step.status === "processing" && "text-primary",
            step.status === "completed" && "text-emerald-500",
            step.status === "waiting_input" && "text-amber-500",
            step.status === "idle" && "text-muted-foreground",
            step.status === "error" && "text-red-500",
          )} />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{step.name}</h3>
          <p className="text-xs text-muted-foreground">{step.description}</p>
        </div>
        <div className="ml-auto">
          {step.status === "processing" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing
            </span>
          )}
          {step.status === "completed" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <Check className="w-3 h-3" />
              Complete
            </span>
          )}
          {step.status === "waiting_input" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-medium">
              <Clock className="w-3 h-3" />
              Awaiting Input
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 rounded-lg bg-black/20 dark:bg-black/30 border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Agent Logs</span>
          {step.logs.length > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground/40">{step.logs.length} entries</span>
          )}
        </div>
        <div className="p-3 overflow-y-auto max-h-[280px] space-y-1 font-mono text-xs">
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
            <div className="flex items-center gap-1 pt-2 pl-[76px]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot" style={{ animationDelay: "0.2s" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot" style={{ animationDelay: "0.4s" }} />
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
          className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"
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
