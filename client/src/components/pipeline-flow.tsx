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

interface AgentCardProps {
  step: AgentStep;
  isActive: boolean;
  index: number;
  total: number;
}

function AgentCard({ step, isActive, index, total }: AgentCardProps) {
  const Icon = STEP_ICONS[step.id] || Brain;
  const status = step.status;
  const fullName = STEP_FULL_NAMES[step.id] || step.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={cn(
        "group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-500 backdrop-blur-sm",
        status === "idle" && "border-border/20 bg-card/20 opacity-40",
        status === "processing" && "border-[#f46902]/40 bg-gradient-to-r from-[#f46902]/8 to-[#f18a31]/5 shadow-lg shadow-[#f46902]/5",
        status === "completed" && "border-[#033c67]/30 bg-[#033c67]/5",
        status === "error" && "border-red-500/40 bg-red-500/5",
        status === "waiting_input" && "border-[#f18a31]/50 bg-[#f18a31]/8 shadow-md shadow-[#f18a31]/5",
        isActive && status === "processing" && "ring-1 ring-[#f46902]/20 ring-offset-1 ring-offset-background",
      )}
      data-testid={`agent-node-${step.id}`}
    >
      {status === "processing" && (
        <motion.div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(244,105,2,0.06) 50%, transparent 100%)" }}
          animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className={cn(
        "relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-400",
        status === "idle" && "bg-muted/40",
        status === "processing" && "bg-[#f46902]/15",
        status === "completed" && "bg-[#033c67]/15",
        status === "error" && "bg-red-500/15",
        status === "waiting_input" && "bg-[#f18a31]/15",
      )}>
        {status === "processing" ? (
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#f46902" }} />
        ) : status === "completed" ? (
          <Check className="w-4 h-4" style={{ color: "#033c67" }} />
        ) : status === "error" ? (
          <AlertCircle className="w-4 h-4 text-red-500" />
        ) : status === "waiting_input" ? (
          <Clock className="w-4 h-4 animate-pulse" style={{ color: "#f18a31" }} />
        ) : (
          <Icon className="w-4 h-4 text-muted-foreground/30" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className={cn(
          "text-[11px] font-semibold leading-tight transition-colors duration-300",
          status === "idle" && "text-muted-foreground/40",
          status === "processing" && "text-[#f46902]",
          status === "completed" && "text-[#033c67] dark:text-[#5b9bd5]",
          status === "error" && "text-red-500",
          status === "waiting_input" && "text-[#f18a31]",
        )}>
          {fullName}
        </div>
        <div className={cn(
          "text-[9px] mt-0.5 font-medium tracking-wide uppercase transition-colors duration-300",
          status === "idle" && "text-muted-foreground/25",
          status === "processing" && "text-[#f46902]/60",
          status === "completed" && "text-[#033c67]/50 dark:text-[#5b9bd5]/50",
          status === "error" && "text-red-400/60",
          status === "waiting_input" && "text-[#f18a31]/60",
        )}>
          {status === "processing" ? "Processing..." :
           status === "completed" ? "Completed" :
           status === "waiting_input" ? "Awaiting Input" :
           status === "error" ? "Failed" :
           `Step ${step.id} of ${8}`}
        </div>
      </div>

      {status === "completed" && (
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#033c67" }}>
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      {status === "processing" && (
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2" style={{ borderColor: "#f46902" }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#f46902" }} />
        </div>
      )}
      {status === "waiting_input" && (
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 animate-pulse" style={{ borderColor: "#f18a31", backgroundColor: "#f18a31" }}>
          <Clock className="w-3 h-3 text-white" />
        </div>
      )}
    </motion.div>
  );
}

function StepConnector({ fromStatus, toStatus }: { fromStatus: StepStatus; toStatus: StepStatus }) {
  const isActive = fromStatus === "completed" && (toStatus === "processing" || toStatus === "completed" || toStatus === "waiting_input");
  const isFlowing = fromStatus === "completed" && toStatus === "processing";
  const isDone = fromStatus === "completed" && toStatus === "completed";

  return (
    <div className="flex items-center shrink-0 px-0.5 py-3">
      <div className="relative w-8 h-[2px] rounded-full overflow-hidden">
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-700",
          isDone ? "bg-[#033c67]/40" : isActive ? "bg-[#f46902]/30" : "bg-muted-foreground/10"
        )} />
        {isFlowing && (
          <motion.div
            className="absolute inset-y-0 w-4 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #f46902, transparent)" }}
            animate={{ left: ["-16px", "32px"] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
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
  const activeStep = steps.find(s => s.status === "processing" || s.status === "waiting_input");

  return (
    <div className="w-full" data-testid="pipeline-flow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#033c67" }}>Pipeline Progress</span>
          {activeStep && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "rgba(244,105,2,0.1)", color: "#f46902" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#f46902" }} />
              {STEP_FULL_NAMES[activeStep.id]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-36 h-2 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: progress === 100 ? "#033c67" : "linear-gradient(90deg, #f46902, #f18a31)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-mono font-semibold tabular-nums" style={{ color: progress === 100 ? "#033c67" : "#f46902" }}>{completedCount}/{steps.length}</span>
        </div>
      </div>

      <div className="flex items-center overflow-x-auto pb-1 scrollbar-thin">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center min-w-0">
            <div className="min-w-[150px] max-w-[180px]">
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
  const fullName = STEP_FULL_NAMES[step.id] || step.name;

  return (
    <div className="flex-1 flex flex-col min-h-0" data-testid="agent-detail">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          step.status === "processing" && "bg-[#f46902]/10",
          step.status === "completed" && "bg-[#033c67]/10",
          step.status === "waiting_input" && "bg-[#f18a31]/10",
          step.status === "idle" && "bg-muted/50",
          step.status === "error" && "bg-red-500/10",
        )}>
          <Icon className={cn(
            "w-5 h-5",
            step.status === "processing" && "text-[#f46902]",
            step.status === "completed" && "text-[#033c67]",
            step.status === "waiting_input" && "text-[#f18a31]",
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: "rgba(244,105,2,0.1)", color: "#f46902" }}>
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing
            </span>
          )}
          {step.status === "completed" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: "rgba(3,60,103,0.1)", color: "#033c67" }}>
              <Check className="w-3 h-3" />
              Complete
            </span>
          )}
          {step.status === "waiting_input" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: "rgba(241,138,49,0.1)", color: "#f18a31" }}>
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
              <div className="w-1.5 h-1.5 rounded-full animate-typing-dot" style={{ backgroundColor: "#f46902" }} />
              <div className="w-1.5 h-1.5 rounded-full animate-typing-dot" style={{ backgroundColor: "#f46902", animationDelay: "0.2s" }} />
              <div className="w-1.5 h-1.5 rounded-full animate-typing-dot" style={{ backgroundColor: "#f46902", animationDelay: "0.4s" }} />
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
          className="mt-3 rounded-xl border p-3.5" style={{ borderColor: "rgba(3,60,103,0.2)", backgroundColor: "rgba(3,60,103,0.03)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileOutput className="w-3.5 h-3.5" style={{ color: "#033c67" }} />
            <span className="text-xs font-semibold" style={{ color: "#033c67" }}>Artifact Generated</span>
          </div>
          <pre className="text-[10px] font-mono text-muted-foreground/70 overflow-x-auto max-h-[120px] overflow-y-auto">
            {JSON.stringify(step.artifact, null, 2)}
          </pre>
        </motion.div>
      )}
    </div>
  );
}
