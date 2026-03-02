import { useState, useCallback } from "react";
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
  Sparkles,
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
  Loader2,
} from "lucide-react";

const AGENT_PREVIEWS = [
  { icon: Brain, label: "Parse Intent", color: "text-violet-400" },
  { icon: KeyRound, label: "Credentials", color: "text-amber-400" },
  { icon: ShieldCheck, label: "Validate", color: "text-emerald-400" },
  { icon: Database, label: "Metadata", color: "text-cyan-400" },
  { icon: GitBranch, label: "Strategy", color: "text-purple-400" },
  { icon: TableProperties, label: "Schema", color: "text-pink-400" },
  { icon: Table2, label: "Tables", color: "text-orange-400" },
  { icon: FileOutput, label: "Migrate", color: "text-teal-400" },
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px]" />
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
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <Button size="sm" variant="secondary" disabled data-testid="button-auth-loading">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button size="sm" variant="default" onClick={() => window.location.href = "/api/login"} data-testid="button-login">
        <LogIn className="w-3.5 h-3.5 mr-1.5" />
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.firstName || "User"}
            className="w-7 h-7 rounded-full border border-border/50 object-cover"
            data-testid="img-user-avatar"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary" data-testid="text-user-initial">
            {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </div>
        )}
        <span className="text-xs font-medium hidden sm:block" data-testid="text-user-name">
          {user?.firstName || user?.email || "User"}
        </span>
      </div>
      <Button size="icon" variant="secondary" onClick={() => logout()} data-testid="button-logout">
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center">
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold tracking-tight" data-testid="text-brand">DataPatron</h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Data Pipeline Platform</p>
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">AI-Powered Pipeline Automation</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 leading-tight" data-testid="text-heading">
            Ingest data into{" "}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Databricks Delta
            </span>
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed" data-testid="text-description">
            Describe your data sources in plain English. Our 8 AI agents handle the rest — from parsing your intent to generating migration plans.
          </p>

          <div className="relative max-w-xl mx-auto">
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-1.5 shadow-lg">
              <Textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g., Ingest orders and products tables from Azure SQL into Databricks daily..."
                className="min-h-[100px] resize-none border-0 bg-transparent text-sm focus-visible:ring-0 placeholder:text-muted-foreground/40"
                data-testid="input-intent"
              />
              <div className="flex items-center justify-end gap-2 px-2 pt-1 pb-1 flex-wrap">
                <Button
                  size="sm"
                  disabled={!intent.trim()}
                  onClick={handleStart}
                  data-testid="button-start-pipeline"
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
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold mb-4">8 Intelligent Agents</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {AGENT_PREVIEWS.map((agent, i) => (
                <motion.div
                  key={agent.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-card/60 border border-border/30 flex items-center justify-center hover-elevate">
                    <agent.icon className={`w-4.5 h-4.5 ${agent.color}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 font-medium">{agent.label}</span>
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
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold tracking-tight">DataPatron</h1>
            <p className="text-[10px] text-muted-foreground font-mono">Session {session.id}</p>
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
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2" data-testid="text-pipeline-complete">Pipeline Complete</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              All 8 agents have finished processing. Your migration plan is ready for execution against Databricks.
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

            <div className="mt-8 rounded-lg border border-border/40 bg-card/30 p-4 text-left" data-testid="pipeline-summary">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pipeline Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Source Type</span>
                  <span className="font-mono font-medium">{session.sourceType}</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Tables Processed</span>
                  <span className="font-mono font-medium">{session.tables.length}</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Agents Completed</span>
                  <span className="font-mono font-medium text-emerald-500">8/8</span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-mono font-medium text-emerald-500">Ready for Execution</span>
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
