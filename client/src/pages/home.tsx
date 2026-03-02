import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type PipelineSession } from "@shared/schema";
import { PipelineFlow, AgentDetail } from "@/components/pipeline-flow";
import { ChatPanel } from "@/components/chat-panel";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Play,
  ArrowRight,
  RotateCcw,
  Moon,
  Sun,
  Wand2,
  Fingerprint,
  ScanLine,
  Microscope,
  Compass,
  Braces,
  LayoutGrid,
  Rocket,
  Download,
  CheckCircle2,
  Terminal,
  ChevronRight,
  Hexagon,
  Activity,
} from "lucide-react";

const AGENT_PREVIEWS = [
  { icon: Wand2, label: "Intent Parser", num: "01", color: "from-violet-500 to-fuchsia-400" },
  { icon: Fingerprint, label: "Credentials", num: "02", color: "from-amber-400 to-orange-500" },
  { icon: ScanLine, label: "Validator", num: "03", color: "from-emerald-400 to-teal-500" },
  { icon: Microscope, label: "Metadata", num: "04", color: "from-cyan-400 to-blue-500" },
  { icon: Compass, label: "Strategy", num: "05", color: "from-purple-400 to-indigo-500" },
  { icon: Braces, label: "Schema Gen", num: "06", color: "from-pink-400 to-rose-500" },
  { icon: LayoutGrid, label: "Table Builder", num: "07", color: "from-orange-400 to-red-500" },
  { icon: Rocket, label: "Migration", num: "08", color: "from-teal-400 to-emerald-500" },
];

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[900px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, hsl(262 83% 58%), transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, hsl(197 71% 52%), transparent 70%)" }} />
      <div className="absolute top-1/3 left-0 -translate-x-1/3 w-[500px] h-[500px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, hsl(340 82% 52%), transparent 70%)" }} />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-[15%] text-primary/[0.06]"
      >
        <Hexagon className="w-32 h-32" strokeWidth={0.5} />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-32 left-[10%] text-primary/[0.04]"
      >
        <Hexagon className="w-24 h-24" strokeWidth={0.5} />
      </motion.div>

      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

function BrandMark({ size = "default" }: { size?: "default" | "small" }) {
  const isSmall = size === "small";
  return (
    <div className={`${isSmall ? "w-7 h-7" : "w-9 h-9"} relative flex items-center justify-center`}>
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 opacity-90`} />
      <div className={`absolute inset-[1px] rounded-[calc(0.5rem-1px)] bg-background/10`} />
      <Activity className={`${isSmall ? "w-3.5 h-3.5" : "w-4.5 h-4.5"} text-white relative z-10`} />
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      data-testid="button-theme-toggle"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

function WelcomeView({ onStart }: { onStart: (intent: string) => void }) {
  const [intent, setIntent] = useState("");

  const handleStart = () => {
    if (intent.trim()) {
      onStart(intent.trim());
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <HeroBackground />

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-sm font-display font-bold tracking-tight" data-testid="text-brand">Bronze</span>
          <span className="text-[10px] text-muted-foreground/50 font-mono ml-1">v2.0</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/50 px-3">
              8 AI Agents &middot; Zero Config
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3 text-center leading-[1.1]" data-testid="text-heading">
            Describe your data.
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              We build the pipeline.
            </span>
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md mx-auto mb-10 leading-relaxed" data-testid="text-description">
            Natural language to Databricks Delta migration plans.
            From intent parsing to DDL generation in minutes.
          </p>

          <div className="relative max-w-xl mx-auto">
            <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-primary/20 via-transparent to-transparent pointer-events-none" />
            <div className="relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30">
                <Terminal className="w-3.5 h-3.5 text-primary/60" />
                <span className="text-[11px] text-muted-foreground/60 font-mono">describe your ingestion</span>
              </div>
              <Textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g., Ingest orders and products tables from Azure SQL into Databricks daily..."
                className="min-h-[90px] resize-none border-0 bg-transparent text-sm focus-visible:ring-0 rounded-none px-4 placeholder:text-muted-foreground/30"
                data-testid="input-intent"
              />
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-border/20">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/30 font-mono">
                  <span>Azure SQL</span>
                  <span>&middot;</span>
                  <span>PostgreSQL</span>
                  <span>&middot;</span>
                  <span>S3</span>
                  <span>&middot;</span>
                  <span>REST</span>
                </div>
                <Button
                  size="sm"
                  disabled={!intent.trim()}
                  onClick={handleStart}
                  className="gap-1.5"
                  data-testid="button-start-pipeline"
                >
                  Start Pipeline
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-20"
          >
            <div className="flex items-center justify-center gap-1 mb-6">
              {[0,1,2].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-primary/30" />
              ))}
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 max-w-3xl mx-auto">
              {AGENT_PREVIEWS.map((agent, i) => (
                <motion.div
                  key={agent.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-card/60 border border-border/30 flex items-center justify-center transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5">
                    <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-md bg-card border border-border/40 flex items-center justify-center text-[8px] font-mono font-bold text-muted-foreground/50">
                      {agent.num}
                    </span>
                    <agent.icon className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/70 transition-colors" />
                  </div>
                  <span className="text-[9px] text-muted-foreground/40 font-medium text-center leading-tight">{agent.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

function PipelineView({ session, onNewPipeline }: {
  session: PipelineSession;
  onNewPipeline: () => void;
}) {
  const activeStep = session.steps.find(s => s.id === session.currentStep) || null;

  const handleSubmitCredentials = useCallback(async (credentials: Record<string, string>) => {
    await apiRequest("POST", `/api/sessions/${session.id}/credentials`, { credentials });
    queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id] });
  }, [session.id]);

  const handleSubmitTableApproval = useCallback(async (approvals: { tableName: string; action: string; customName?: string }[]) => {
    await apiRequest("POST", `/api/sessions/${session.id}/table-approval`, { approvals });
    queryClient.invalidateQueries({ queryKey: ["/api/sessions", session.id] });
  }, [session.id]);

  const isComplete = session.status === "completed";
  const completedCount = session.steps.filter(s => s.status === "completed").length;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-3">
          <BrandMark size="small" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <span className="font-display font-bold text-foreground text-sm">Bronze</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono">Session {session.id.slice(0, 8)}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-mono text-primary">{completedCount}/8</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onNewPipeline} data-testid="button-new-pipeline">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            New Pipeline
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="px-5 py-4 border-b border-border/20 shrink-0 bg-card/30">
        <PipelineFlow steps={session.steps} currentStep={session.currentStep} />
      </div>

      {isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center p-8"
        >
          <div className="text-center max-w-md">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 animate-agent-pulse" />
              <div className="absolute inset-2 rounded-full bg-card border-2 border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold mb-2" data-testid="text-pipeline-complete">Pipeline Complete</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              All 8 agents finished processing. Your Databricks Delta migration plan is ready.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button data-testid="button-download-plan" className="gap-2">
                <Download className="w-4 h-4" />
                Download Migration Plan
              </Button>
              <Button variant="secondary" onClick={onNewPipeline} data-testid="button-start-new" className="gap-2">
                <Play className="w-4 h-4" />
                Start New
              </Button>
            </div>

            <div className="mt-10 rounded-xl border border-border/40 bg-card/50 p-5 text-left" data-testid="pipeline-summary">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50 mb-4">Pipeline Summary</h3>
              <div className="space-y-3">
                {[
                  { label: "Source Type", value: session.sourceType, highlight: false },
                  { label: "Tables Processed", value: String(session.tables.length), highlight: false },
                  { label: "Agents Completed", value: "8/8", highlight: true },
                  { label: "Status", value: "Ready for Execution", highlight: true },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center gap-2">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className={`text-xs font-mono font-medium ${row.highlight ? "text-emerald-500" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 flex min-h-0">
          <div className="w-[42%] border-r border-border/20 flex flex-col min-h-0">
            <ChatPanel
              session={session}
              onSubmitCredentials={handleSubmitCredentials}
              onSubmitTableApproval={handleSubmitTableApproval}
            />
          </div>
          <div className="flex-1 flex flex-col min-h-0 p-4">
            <AgentDetail step={activeStep} sessionStatus={session.status} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { data: session } = useQuery<PipelineSession>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
    refetchInterval: sessionId ? 1000 : false,
  });

  const handleStart = async (intent: string) => {
    const res = await apiRequest("POST", "/api/sessions", {});
    const newSession: PipelineSession = await res.json();
    setSessionId(newSession.id);

    setTimeout(async () => {
      await apiRequest("POST", `/api/sessions/${newSession.id}/start`, { intent });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", newSession.id] });
    }, 300);
  };

  const handleNewPipeline = () => {
    setSessionId(null);
  };

  if (session && sessionId) {
    return <PipelineView session={session} onNewPipeline={handleNewPipeline} />;
  }

  return <WelcomeView onStart={handleStart} />;
}
