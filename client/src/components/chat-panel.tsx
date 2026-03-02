import { useState, useRef, useEffect } from "react";
import { type ChatMessage, type PipelineSession } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Send,
  Bot,
  User,
  Info,
  KeyRound,
  Table2,
  Check,
  X,
  Pencil,
  Zap,
} from "lucide-react";

interface ChatPanelProps {
  session: PipelineSession;
  onSubmitCredentials: (credentials: Record<string, string>) => void;
  onSubmitTableApproval: (approvals: { tableName: string; action: string; customName?: string }[]) => void;
}

function CredentialsForm({ session, onSubmit }: { session: PipelineSession; onSubmit: (creds: Record<string, string>) => void }) {
  const sourceType = session.sourceType || "Azure SQL";
  const [submitted, setSubmitted] = useState(false);

  const fieldConfigs: Record<string, { label: string; type: string; placeholder: string }[]> = {
    "Azure SQL": [
      { label: "Server", type: "text", placeholder: "myserver.database.windows.net" },
      { label: "Database", type: "text", placeholder: "mydb" },
      { label: "Username", type: "text", placeholder: "admin" },
      { label: "Password", type: "password", placeholder: "Enter password" },
    ],
    "PostgreSQL": [
      { label: "Host", type: "text", placeholder: "localhost" },
      { label: "Port", type: "text", placeholder: "5432" },
      { label: "Database", type: "text", placeholder: "mydb" },
      { label: "Schema", type: "text", placeholder: "public" },
      { label: "Username", type: "text", placeholder: "postgres" },
      { label: "Password", type: "password", placeholder: "Enter password" },
    ],
    "S3": [
      { label: "Bucket", type: "text", placeholder: "my-data-bucket" },
      { label: "Region", type: "text", placeholder: "us-east-1" },
      { label: "File Format", type: "text", placeholder: "csv" },
      { label: "Access Key ID", type: "text", placeholder: "AKIA..." },
      { label: "Secret Access Key", type: "password", placeholder: "Enter secret key" },
    ],
    "REST API": [
      { label: "Endpoint", type: "text", placeholder: "https://api.example.com/data" },
      { label: "Auth Type", type: "text", placeholder: "api_key / bearer / basic" },
      { label: "API Key", type: "password", placeholder: "Enter API key" },
    ],
  };

  const fields = fieldConfigs[sourceType] || fieldConfigs["Azure SQL"];
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(values);
  };

  const handleDemo = () => {
    const demoValues: Record<string, string> = {};
    fields.forEach(f => {
      demoValues[f.label.toLowerCase().replace(/\s+/g, "_")] = f.placeholder;
    });
    setSubmitted(true);
    onSubmit(demoValues);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-500 py-2">
        <Check className="w-3.5 h-3.5" />
        <span>Credentials submitted</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border/60 bg-card/50 p-4 space-y-3"
      data-testid="credentials-form"
    >
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-semibold">{sourceType} Credentials</span>
      </div>
      <div className="space-y-2.5">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{field.label}</Label>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              className="text-sm bg-background/50"
              onChange={(e) => setValues(prev => ({ ...prev, [field.label.toLowerCase().replace(/\s+/g, "_")]: e.target.value }))}
              data-testid={`input-${field.label.toLowerCase().replace(/\s+/g, "-")}`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={handleSubmit} data-testid="button-submit-credentials">
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Submit
        </Button>
        <Button size="sm" variant="secondary" onClick={handleDemo} data-testid="button-demo-credentials">
          <Zap className="w-3.5 h-3.5 mr-1.5" />
          Use Demo Data
        </Button>
      </div>
    </motion.div>
  );
}

function TableApprovalForm({ session, onSubmit }: { session: PipelineSession; onSubmit: (approvals: { tableName: string; action: string; customName?: string }[]) => void }) {
  const tables = session.tables.map(t => `main.bronze.${t}`);
  const [actions, setActions] = useState<Record<string, { action: string; customName?: string }>>(
    Object.fromEntries(tables.map(t => [t, { action: "accept" }]))
  );
  const [submitted, setSubmitted] = useState(false);
  const [editingTable, setEditingTable] = useState<string | null>(null);

  const handleSubmit = () => {
    setSubmitted(true);
    const approvals = tables.map(t => ({
      tableName: t,
      action: actions[t]?.action || "accept",
      customName: actions[t]?.customName,
    }));
    onSubmit(approvals);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-500 py-2">
        <Check className="w-3.5 h-3.5" />
        <span>Tables approved</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border/60 bg-card/50 p-4 space-y-3"
      data-testid="table-approval-form"
    >
      <div className="flex items-center gap-2 mb-1">
        <Table2 className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-semibold">Review Table Names</span>
      </div>
      <div className="space-y-2">
        {tables.map((tableName) => (
          <div key={tableName} className="rounded-md border border-border/40 bg-background/30 p-3" data-testid={`table-review-${tableName}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <code className="text-xs font-mono text-primary">{actions[tableName]?.customName || tableName}</code>
                <pre className="text-[10px] font-mono text-muted-foreground/60 mt-1 overflow-hidden">
                  CREATE TABLE IF NOT EXISTS {actions[tableName]?.customName || tableName} (...)
                </pre>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant={actions[tableName]?.action === "accept" ? "default" : "secondary"}
                  onClick={() => setActions(prev => ({ ...prev, [tableName]: { action: "accept" } }))}
                  data-testid={`button-accept-${tableName}`}
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={actions[tableName]?.action === "rename" ? "default" : "secondary"}
                  onClick={() => {
                    setActions(prev => ({ ...prev, [tableName]: { action: "rename", customName: tableName } }));
                    setEditingTable(tableName);
                  }}
                  data-testid={`button-rename-${tableName}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={actions[tableName]?.action === "skip" ? "destructive" : "secondary"}
                  onClick={() => setActions(prev => ({ ...prev, [tableName]: { action: "skip" } }))}
                  data-testid={`button-skip-${tableName}`}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            {editingTable === tableName && actions[tableName]?.action === "rename" && (
              <div className="mt-2">
                <Input
                  defaultValue={tableName}
                  className="text-xs font-mono bg-background/50"
                  onChange={(e) => setActions(prev => ({ ...prev, [tableName]: { action: "rename", customName: e.target.value } }))}
                  data-testid={`input-rename-${tableName}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <Button size="sm" onClick={handleSubmit} data-testid="button-approve-tables">
        <Check className="w-3.5 h-3.5 mr-1.5" />
        Approve & Create Tables
      </Button>
    </motion.div>
  );
}

function MessageBubble({ message, session, onSubmitCredentials, onSubmitTableApproval }: {
  message: ChatMessage;
  session: PipelineSession;
  onSubmitCredentials: (creds: Record<string, string>) => void;
  onSubmitTableApproval: (approvals: { tableName: string; action: string; customName?: string }[]) => void;
}) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex gap-2.5",
        isUser && "flex-row-reverse",
      )}
    >
      {!isUser && (
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isSystem ? "bg-muted" : "bg-primary/10",
        )}>
          {isSystem ? (
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <Bot className="w-3.5 h-3.5 text-primary" />
          )}
        </div>
      )}
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div className={cn(
        "flex-1 min-w-0",
        isUser && "text-right",
      )}>
        <div className={cn(
          "inline-block text-sm leading-relaxed rounded-lg px-3 py-2 max-w-full text-left",
          isUser && "bg-primary/10 text-foreground",
          isSystem && "bg-transparent text-muted-foreground italic",
          !isUser && !isSystem && "bg-card/60 text-foreground",
        )}>
          {message.content}
        </div>
        {message.formType === "credentials" && (
          <div className="mt-2 text-left">
            <CredentialsForm session={session} onSubmit={onSubmitCredentials} />
          </div>
        )}
        {message.formType === "table_approval" && (
          <div className="mt-2 text-left">
            <TableApprovalForm session={session} onSubmit={onSubmitTableApproval} />
          </div>
        )}
        <div className="text-[10px] text-muted-foreground/40 mt-1 font-mono">
          {new Date(message.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  );
}

export function ChatPanel({ session, onSubmitCredentials, onSubmitTableApproval }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages.length]);

  return (
    <div className="flex flex-col h-full" data-testid="chat-panel">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Agent Communication</span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground/50">{session.messages.length} messages</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {session.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              session={session}
              onSubmitCredentials={onSubmitCredentials}
              onSubmitTableApproval={onSubmitTableApproval}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
