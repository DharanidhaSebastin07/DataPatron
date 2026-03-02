import { type AgentStep, type StepStatus } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Fingerprint,
  ScanLine,
  Microscope,
  Compass,
  Braces,
  LayoutGrid,
  Rocket,
  Check,
  Loader2,
  CircleDot,
  Clock,
  CircleCheck,
  TriangleAlert,
  CircleX,
  FileCode2,
  Terminal,
} from "lucide-react";

const STEP_ICONS: Record<number, typeof Wand2> = {
  1: Wand2,
  2: Fingerprint,
  3: ScanLine,
  4: Microscope,
  5: Compass,
  6: Braces,
  7: LayoutGrid,
  8: Rocket,
};

const STEP_COLORS: Record<number, { active: string; glow: string }> = {
  1: { active: "border-violet-500 bg-violet-500/8", glow: "shadow-violet-500/20" },
  2: { active: "border-amber-500 bg-amber-500/8", glow: "shadow-amber-500/20" },
  3: { active: "border-emerald-500 bg-emerald-500/8", glow: "shadow-emerald-500/20" },
  4: { active: "border-cyan-500 bg-cyan-500/8", glow: "shadow-cyan-500/20" },
  5: { active: "border-purple-500 bg-purple-500/8", glow: "shadow-purple-500/20" },
  6: { active: "border-pink-500 bg-pink-500/8", glow: "shadow-pink-500/20" },
  7: { active: "border-orange-500 bg-orange-500/8", glow: "shadow-orange-500/20" },
  8: { active: "border-teal-500 bg-teal-500/8", glow: "shadow-teal-500/20" },
};

const STEP_ICON_COLORS: Record<number, string> = {
  1: "text-violet-400",
  2: "text-amber-400",
  3: "text-emerald-400",
  4: "text-cyan-400",
  5: "text-purple-400",
  6: "text-pink-400",
  7: "text-orange-400",
  8: "text-teal-400",
};

function ConnectionLine({ fromStatus, toStatus }: { fromStatus: StepStatus; toStatus: StepStatus }) {
  const isActive = fromStatus === "completed" && (toStatus === "processing" || toStatus === "completed" || toStatus === "waiting_input");
  const isComplete = fromStatus === "completed" && toStatus === "completed";
  const isFlowing = fromStatus === "completed" && toStatus === "processing";

  return (
    <div className="flex items-center relative h-[2px] min-w-[16px] max-w-[36px] flex-1">
      <div className={cn(
        "w-full h-full rounded-full transition-all duration-700",
        isComplete ? "bg-emerald-500/40" : isActive ? "bg-primary/30" : "bg-border/40"
      )} />
      {isFlowing && (
        <div className="absolute inset-0 flex items-center overflow-hidden rounded-full">
          <div className="absolute w-4 h-full rounded-full bg-primary/60 animate-flow-dot" />
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
  const Icon = STEP_ICONS[step.id] || Wand2;
  const status = step.status;
  const colors = STEP_COLORS[step.id] || STEP_COLORS[1];
  const iconColor = STEP_ICON_COLORS[step.id] || "text-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="flex flex-col items-center gap-1 relative"
      data-testid={`agent-node-${step.id}`}
    >
      <div className={cn(
        "relative w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500",
        status === "idle" && "border-border/30 bg-card/40",
        status === "processing" && cn(colors.active, "shadow-lg", colors.glow),
        status === "completed" && "border-emerald-500/50 bg-emerald-500/8",
        status === "error" && "border-red-500/50 bg-red-500/8",
        status === "waiting_input" && "border-amber-500/50 bg-amber-500/8",
        isActive && "ring-1 ring-primary/20 ring-offset-1 ring-offset-background",
      )}>
        {status === "processing" && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute inset-0 border border-primary/30 rounded-xl animate-agent-ring" />
          </div>
        )}

        <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-md bg-card border border-border/50 flex items-center justify-center text-[7px] font-mono font-bold text-muted-foreground/40">
          {step.id}
        </span>

        {status === "processing" ? (
          <Loader2 className={cn("w-4 h-4 animate-spin", iconColor)} />
        ) : (
          <Icon className={cn(
            "w-4 h-4 transition-colors duration-300",
            status === "idle" && "text-muted-foreground/25",
            status === "completed" && "text-emerald-500",
            status === "error" && "text-red-500",
            status === "waiting_input" && "text-amber-500",
          )} />
        )}

        {status === "completed" && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center" data-testid="status-completed">
            <Check className="w-2 h-2 text-white" strokeWidth={3} />
          </div>
        )}
        {status === "waiting_input" && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center animate-glow-pulse" data-testid="status-waiting">
            <Clock className="w-2 h-2 text-white" strokeWidth={3} />
          </div>
        )}
        {status === "error" && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center" data-testid="status-error">
            <CircleDot className="w-2 h-2 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <span className={cn(
        "text-[9px] font-medium tracking-wide transition-colors duration-300 max-w-[60px] text-center leading-tight",
        status === "idle" && "text-muted-foreground/25",
        status === "processing" && iconColor,
        status === "completed" && "text-emerald-500/70",
        status === "error" && "text-red-500/70",
        status === "waiting_input" && "text-amber-500/70",
      )}>
        {step.shortName}
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
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/40">Pipeline</span>
          <div className="flex items-center gap-1.5">
            {steps.map(s => (
              <div
                key={s.id}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-500",
                  s.status === "completed" && "bg-emerald-500",
                  s.status === "processing" && "bg-primary animate-glow-pulse",
                  s.status === "waiting_input" && "bg-amber-500",
                  s.status === "idle" && "bg-border/60",
                  s.status === "error" && "bg-red-500",
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-20 h-1 rounded-full bg-border/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">{progress}%</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-0 px-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <AgentNode
              step={step}
              isActive={step.id === currentStep}
              index={i}
            />
            {i < steps.length - 1 && (
              <div className="mt-[-14px] px-0.5">
                <ConnectionLine
                  fromStatus={step.status}
                  toStatus={steps[i + 1].status}
                />
              </div>
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
      <div className="flex-1 flex items-center justify-center text-muted-foreground/30 text-sm font-mono">
        Waiting for pipeline start...
      </div>
    );
  }

  const Icon = STEP_ICONS[step.id] || Wand2;
  const iconColor = STEP_ICON_COLORS[step.id] || "text-primary";

  return (
    <div className="flex-1 flex flex-col min-h-0" data-testid="agent-detail">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center border transition-colors",
          step.status === "processing" && "border-primary/30 bg-primary/5",
          step.status === "completed" && "border-emerald-500/30 bg-emerald-500/5",
          step.status === "waiting_input" && "border-amber-500/30 bg-amber-500/5",
          step.status === "idle" && "border-border/30 bg-card/50",
          step.status === "error" && "border-red-500/30 bg-red-500/5",
        )}>
          <Icon className={cn(
            "w-4 h-4",
            step.status === "processing" && iconColor,
            step.status === "completed" && "text-emerald-500",
            step.status === "waiting_input" && "text-amber-500",
            step.status === "idle" && "text-muted-foreground/40",
            step.status === "error" && "text-red-500",
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-display font-semibold truncate">{step.name}</h3>
            <span className="text-[9px] font-mono text-muted-foreground/30">#{step.id}</span>
          </div>
          <p className="text-[11px] text-muted-foreground/50 truncate">{step.description}</p>
        </div>
        <div className="shrink-0">
          {step.status === "processing" && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-primary font-mono">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing
            </span>
          )}
          {step.status === "completed" && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-500 font-mono">
              <Check className="w-3 h-3" />
              Done
            </span>
          )}
          {step.status === "waiting_input" && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-500 font-mono">
              <Clock className="w-3 h-3" />
              Waiting
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 rounded-xl bg-card/50 border border-border/30 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-muted-foreground/30" />
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground/40">Live Output</span>
          </div>
          {step.logs.length > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground/25">{step.logs.length} entries</span>
          )}
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-0.5 font-mono text-[11px]">
          <AnimatePresence>
            {step.logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2.5 py-0.5 leading-relaxed"
              >
                <span className="text-muted-foreground/25 shrink-0 w-14 text-right tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <span className={cn(
                  "flex-1 inline-flex items-start gap-1.5",
                  log.level === "info" && "text-foreground/60",
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
            <div className="flex items-center gap-1 pt-2 pl-[68px]">
              <div className="w-1 h-1 rounded-full bg-primary/60 animate-typing-dot" />
              <div className="w-1 h-1 rounded-full bg-primary/60 animate-typing-dot" style={{ animationDelay: "0.2s" }} />
              <div className="w-1 h-1 rounded-full bg-primary/60 animate-typing-dot" style={{ animationDelay: "0.4s" }} />
            </div>
          )}
          {step.logs.length === 0 && step.status === "idle" && (
            <div className="text-muted-foreground/20 text-center py-8 font-sans text-xs">
              Waiting to start...
            </div>
          )}
        </div>
      </div>

      {step.artifact && step.status === "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileCode2 className="w-3.5 h-3.5 text-emerald-500/70" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500/70">Artifact</span>
          </div>
          <pre className="text-[10px] font-mono text-muted-foreground/50 overflow-x-auto max-h-[120px] overflow-y-auto">
            {JSON.stringify(step.artifact, null, 2)}
          </pre>
        </motion.div>
      )}
    </div>
  );
}
