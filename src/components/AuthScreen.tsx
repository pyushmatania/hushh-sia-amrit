import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error);
      } else {
        setSignupSuccess(true);
      }
    }
    setLoading(false);
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We've sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>. Click the link to activate your account.
          </p>
          <button
            onClick={() => { setSignupSuccess(false); setMode("login"); }}
            className="mt-6 text-sm font-semibold text-primary"
          >
            Back to login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center px-8 pt-16 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Hushh</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground leading-tight">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "login" ? "Sign in to continue your journey" : "Join Hushh and discover private experiences"}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 space-y-4"
        >
          <AnimatePresence>
            {mode === "signup" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="relative mb-4">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-secondary rounded-xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              className="w-full bg-secondary rounded-xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-secondary rounded-xl pl-12 pr-12 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/40"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive font-medium px-1">
              {error}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold disabled:opacity-50 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Toggle mode */}
      <div className="pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
        <p className="text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="font-semibold text-primary"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
