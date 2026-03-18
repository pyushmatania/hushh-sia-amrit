import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import authBg from "@/assets/auth-bg-night.jpg";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // Also listen for auth state change with recovery event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleReset = async () => {
    setError("");
    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Password Updated!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your password has been reset successfully.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-semibold"
          >
            Go to App <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-8 text-center">
        <p className="text-sm text-muted-foreground">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      >
        <img src={authBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </motion.div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 pt-16 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Hushh</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground leading-tight">Set new password</h2>
          <p className="text-sm text-muted-foreground mt-2">Enter your new password below</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 space-y-4"
        >
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-1 focus:ring-primary/40"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
              className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive font-medium px-1">
              {error}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleReset}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold disabled:opacity-50 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Update Password
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
