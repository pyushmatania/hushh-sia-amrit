import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import authBg from "@/assets/auth-bg-night.jpg";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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

  const handleForgotPassword = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  if (resetSent) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
          </p>
          <button
            onClick={() => { setResetSent(false); setMode("login"); }}
            className="mt-6 text-sm font-semibold text-primary"
          >
            Back to login
          </button>
        </motion.div>
      </div>
    );
  }

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
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      >
        <img src={authBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 pt-16 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Hushh</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground leading-tight">
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "login" ? "Sign in to continue your journey" : mode === "signup" ? "Join Hushh and discover private experiences" : "Enter your email to receive a reset link"}
          </p>
          {mode === "forgot" && (
            <button onClick={() => { setMode("login"); setError(""); }} className="flex items-center gap-1 text-xs text-primary font-semibold mt-2">
              <ArrowLeft size={14} /> Back to login
            </button>
          )}
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
                    className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          {mode !== "forgot" && (
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-1 focus:ring-primary/40"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {mode === "login" && (
            <button
              onClick={() => { setMode("forgot"); setError(""); }}
              className="text-xs text-primary font-medium self-end -mt-1"
            >
              Forgot password?
            </button>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive font-medium px-1">
              {error}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={mode === "forgot" ? handleForgotPassword : handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold disabled:opacity-50 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>

          {mode !== "forgot" && (
            <>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) setError(error.message || "Google sign-in failed");
                  setLoading(false);
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl py-3.5 text-sm font-semibold text-foreground hover:bg-white/15 transition-all disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </motion.button>
            </>
          )}
        </motion.div>
      </div>

      {/* Toggle mode */}
      {mode !== "forgot" && (
        <div className="relative z-10 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
          <p className="text-sm text-foreground/70">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="font-semibold text-primary"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
