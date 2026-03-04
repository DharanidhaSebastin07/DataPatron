import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type PipelineSession } from "@shared/schema";
import { PipelineFlow, AgentDetail } from "@/components/pipeline-flow";
import { ChatPanel } from "@/components/chat-panel";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Play,
  Layers,
  Bot,
  ArrowRight,
  RotateCcw,
  Moon,
  Sun,
  Brain,
  KeyRound,
  ShieldCheck,
  Database,
  GitBranch,
  TableProperties,
  Table2,
  FileOutput,
  Download,
  CheckCircle2,
  LogOut,
  LogIn,
  UserX,
  Loader2,
} from "lucide-react";

const AGENT_PREVIEWS = [
  { icon: Brain, label: "Master Control Agent", color: "#f46902" },
  { icon: KeyRound, label: "Credentials Agent", color: "#033c67" },
  { icon: ShieldCheck, label: "Validation Agent", color: "#f46902" },
  { icon: Database, label: "Metadata Agent", color: "#033c67" },
  { icon: GitBranch, label: "Strategy Agent", color: "#f46902" },
  { icon: TableProperties, label: "Schema Mapping", color: "#033c67" },
  { icon: Table2, label: "Table Creation", color: "#f46902" },
  { icon: FileOutput, label: "Migration Plan", color: "#033c67" },
];

function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ backgroundColor: "rgba(244,105,2,0.04)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ backgroundColor: "rgba(3,60,103,0.04)" }} />
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button size="icon" variant="secondary" onClick={toggleTheme} data-testid="button-theme-toggle">
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

function UserMenu() {
  const { user, isLoading, isAuthenticated, isGuest, logout, initials } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <Button size="sm" variant="secondary" disabled data-testid="button-auth-loading">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </Button>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return (
      <Button
        size="sm"
        className="bg-[#033c67] dark:bg-[#0e5a8a] text-white focus-visible:ring-0 focus-visible:ring-offset-0"
        onClick={() => navigate("/auth")}
        data-testid="button-login"
      >
        <LogIn className="w-3.5 h-3.5 mr-1.5" />
        Sign In
      </Button>
    );
  }

  if (isGuest) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-border/40 bg-muted/40 text-muted-foreground"
          data-testid="badge-guest"
        >
          <UserX className="w-3 h-3" />
          Guest
        </div>
        <Button
          size="sm"
          className="bg-[#033c67] dark:bg-[#0e5a8a] text-white focus-visible:ring-0 focus-visible:ring-offset-0"
          onClick={() => navigate("/auth")}
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {/* Initials avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: "#033c67" }}
          data-testid="avatar-initials"
        >
          {initials}
        </div>
        <span className="text-xs font-medium hidden sm:block" data-testid="text-user-name">
          {user?.firstName}
        </span>
      </div>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => logout()}
        data-testid="button-logout"
      >
        <LogOut className="w-3.5 h-3.5" />
      </Button>
    </div>
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
      <GridBackground />

      <header className="relative z-10 flex items-center justify-between gap-2 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f18a31" }}>
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-display font-semibold" style={{ color: "#033c67", letterSpacing: "0.18em" }} data-testid="text-brand">DataPatron</h1>
            <p className="text-[10px] font-brand" style={{ color: "#f46902" }}>Data Pipeline Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Bot className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Pipeline Automation</span>
          </div>

          <h2 className="font-display font-bold mb-2 leading-tight" style={{ fontSize: "2rem", letterSpacing: "0.15em", color: "#033c67" }} data-testid="text-heading">
            DataPatron
          </h2>
          <p className="text-lg font-brand mb-2" style={{ color: "#f46902" }} data-testid="text-slogan">
            Data Pipeline Platform
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed" data-testid="text-description">
            Describe your data sources in plain English. Our 8 AI agents handle the rest — from parsing your intent to generating migration plans.
          </p>

          <div className="relative max-w-xl mx-auto">
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-1.5 shadow-lg">
              <Textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g., Ingest orders and products tables from Azure SQL into Databricks daily..."
                className="min-h-[120px] resize-none border-0 bg-transparent text-sm focus-visible:ring-0 placeholder:text-muted-foreground/40"
                data-testid="input-intent"
              />
              <div className="flex items-center justify-end gap-2 px-2 pt-3 pb-2 border-t border-border/30 flex-wrap">
                <Button
                  size="sm"
                  disabled={!intent.trim()}
                  onClick={handleStart}
                  data-testid="button-start-pipeline"
                  className="bg-[#033c67] dark:bg-[#0e5a8a] text-white hover:bg-[#022d4e] dark:hover:bg-[#0b4a72] focus-visible:ring-0 focus-visible:ring-offset-0 border-0"
                >
                  Start Pipeline
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-16"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-5">8 Intelligent Agents</p>
            <div className="grid grid-cols-4 gap-2.5 max-w-xl mx-auto">
              {AGENT_PREVIEWS.map((agent, i) => (
                <motion.div
                  key={agent.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-card/50 border border-border/20 backdrop-blur-sm hover-elevate"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${agent.color}15` }}>
                    <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground/70 leading-tight">{agent.label}</span>
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

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between gap-2 px-5 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f18a31" }}>
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm font-display font-semibold" style={{ color: "#033c67", letterSpacing: "0.18em" }}>DataPatron</h1>
              <p className="text-[10px] font-brand" style={{ color: "#f46902" }}>Data Pipeline Platform</p>
            </div>
            <div className="h-5 w-px bg-border/40" />
            <span className="text-[10px] font-mono text-muted-foreground/50" data-testid="text-session-id">ID: {session.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onNewPipeline} data-testid="button-new-pipeline">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            New Pipeline
          </Button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <div className="px-5 py-4 border-b border-border/20 shrink-0">
        <PipelineFlow steps={session.steps} currentStep={session.currentStep} />
      </div>

      {isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center p-8"
        >
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg bg-emerald-500">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2 text-primary tracking-wide" data-testid="text-pipeline-complete">pipeline completed</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              All 8 agents have finished processing. Your pipeline is now marked as completed and ready for final review.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button data-testid="button-download-plan">
                <Download className="w-4 h-4 mr-2" />
                Download Migration Plan
              </Button>
              <Button variant="secondary" onClick={onNewPipeline} data-testid="button-start-new">
                <Play className="w-4 h-4 mr-2" />
                Start New Pipeline
              </Button>
            </div>

            <div className="mt-8 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-5 text-left shadow-sm" data-testid="pipeline-summary">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#033c67" }}>Pipeline Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Source Type</span>
                  <span className="font-mono font-semibold">{session.sourceType}</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Tables Processed</span>
                  <span className="font-mono font-semibold">{session.tables.length}</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Agents Completed</span>
                  <span className="font-mono font-semibold text-emerald-500">8/8</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-mono font-semibold" style={{ color: "#f46902" }}>Ready for Execution</span>
                </div>
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
