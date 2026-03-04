import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth, setGuestMode } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Layers,
    Bot,
    Mail,
    Lock,
    User,
    ArrowRight,
    Eye,
    EyeOff,
    UserX,
    Loader2,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <Button size="icon" variant="secondary" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
    );
}

function GridBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
            <div
                className="absolute top-1/3 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
                style={{ backgroundColor: "#f46902" }}
            />
            <div
                className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
                style={{ backgroundColor: "#033c67" }}
            />
        </div>
    );
}

export default function AuthPage() {
    const [, navigate] = useLocation();
    const { loginAsync, registerAsync, isLoggingIn, isRegistering } = useAuth();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [showPassword, setShowPassword] = useState(false);

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const isPending = isLoggingIn || isRegistering;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (mode === "login") {
                await loginAsync({ email, password });
            } else {
                await registerAsync({ firstName, lastName, email, password });
            }
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        }
    };

    const handleGuest = () => {
        setGuestMode(true);
        navigate("/");
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <GridBackground />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#f18a31" }}
                    >
                        <Layers className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                        <h1
                            className="text-sm font-display font-semibold"
                            style={{ color: "#033c67", letterSpacing: "0.18em" }}
                        >
                            DataPatron
                        </h1>
                        <p className="text-[10px] font-brand" style={{ color: "#f46902" }}>
                            Data Pipeline Platform
                        </p>
                    </div>
                </div>
                <ThemeToggle />
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Icon badge */}
                <div className="flex justify-center mb-6">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: "#033c67" }}
                    >
                        <Bot className="w-7 h-7 text-white" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2
                        className="text-2xl font-display font-bold mb-1"
                        style={{ color: "#033c67" }}
                    >
                        {mode === "login" ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {mode === "login"
                            ? "Sign in to access your pipelines"
                            : "Join DataPatron to get started"}
                    </p>
                </div>

                {/* Form card */}
                <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-7 shadow-xl">
                    {/* Mode toggle tabs */}
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted/50 mb-6">
                        <button
                            type="button"
                            onClick={() => { setMode("login"); setError(null); }}
                            className={`py-2 text-xs font-semibold rounded-lg transition-all ${mode === "login"
                                    ? "bg-background shadow text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode("signup"); setError(null); }}
                            className={`py-2 text-xs font-semibold rounded-lg transition-all ${mode === "signup"
                                    ? "bg-background shadow text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name fields (sign up only) */}
                        {mode === "signup" && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstName" className="text-xs font-semibold">
                                        First Name
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="John"
                                            className="pl-9 h-10 text-sm focus-visible:ring-[#033c67] focus-visible:ring-offset-0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="lastName" className="text-xs font-semibold">
                                        Last Name
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Doe"
                                            className="pl-9 h-10 text-sm focus-visible:ring-[#033c67] focus-visible:ring-offset-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="pl-9 h-10 text-sm focus-visible:ring-[#033c67] focus-visible:ring-offset-0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                                    className="pl-9 pr-9 h-10 text-sm focus-visible:ring-[#033c67] focus-visible:ring-offset-0"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                    ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-red-500 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2"
                            >
                                {error}
                            </motion.p>
                        )}

                        {/* Submit button */}
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-10 text-sm font-semibold mt-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                            style={{ backgroundColor: "#033c67", color: "#fff" }}
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    {mode === "login" ? "Sign In" : "Create Account"}
                                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">
                            or
                        </span>
                        <div className="flex-1 h-px bg-border/40" />
                    </div>

                    {/* Guest mode */}
                    <Button
                        variant="outline"
                        className="w-full h-10 text-sm font-medium border-border/40 hover:bg-muted/50"
                        onClick={handleGuest}
                    >
                        <UserX className="w-4 h-4 mr-2 text-muted-foreground/60" />
                        Continue as Guest
                    </Button>

                    <p className="text-center text-[10px] text-muted-foreground/50 mt-4">
                        Guests can use the pipeline but can't save progress
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
