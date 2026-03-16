import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Mode = "login" | "signup";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link!");
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "hsl(222 25% 7%)" }}
    >
      <div
        className="w-full rounded-[16px] border px-8 py-10"
        style={{
          maxWidth: 400,
          background: "hsl(222 19% 10%)",
          borderColor: "hsl(217 26% 20%)",
        }}
      >
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <h1
            className="font-mono text-[22px] font-bold leading-[1.2] tracking-[-0.5px] mb-1"
            style={{ color: "#f1f5f9" }}
          >
            AI Resolution<br />Tracker
          </h1>
          <p className="text-[12px] font-light" style={{ color: "hsl(215 16% 37%)" }}>
            10-Weekend Path to AI Fluency · 2026
          </p>
        </div>

        {/* Mode tabs */}
        <div
          className="flex rounded-[10px] p-[3px] mb-6"
          style={{ background: "hsl(224 24% 14%)" }}
        >
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setMessage(""); }}
              className="flex-1 rounded-[8px] py-[7px] text-[13px] font-medium capitalize transition-all duration-150"
              style={{
                background: mode === m ? "hsl(222 19% 15%)" : "transparent",
                color: mode === m ? "#f1f5f9" : "hsl(215 16% 37%)",
                border: mode === m ? "1px solid hsl(217 26% 22%)" : "1px solid transparent",
              }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label
              className="block text-[11px] uppercase tracking-[0.8px] mb-[6px]"
              style={{ color: "hsl(215 16% 37%)" }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-[8px] border px-3 py-[9px] text-[13px] outline-none transition-colors duration-150"
              style={{
                background: "hsl(222 21% 7%)",
                borderColor: "hsl(217 26% 20%)",
                color: "#cbd5e1",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = "hsl(217 36% 30%)")}
              onBlur={(e) => (e.target.style.borderColor = "hsl(217 26% 20%)")}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-[11px] uppercase tracking-[0.8px] mb-[6px]"
              style={{ color: "hsl(215 16% 37%)" }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-[8px] border px-3 py-[9px] text-[13px] outline-none transition-colors duration-150"
              style={{
                background: "hsl(222 21% 7%)",
                borderColor: "hsl(217 26% 20%)",
                color: "#cbd5e1",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = "hsl(217 36% 30%)")}
              onBlur={(e) => (e.target.style.borderColor = "hsl(217 26% 20%)")}
            />
          </div>

          {error && (
            <p className="text-[12px] text-center" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}
          {message && (
            <p className="text-[12px] text-center" style={{ color: "#4ade80" }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[8px] py-[10px] text-[13px] font-semibold mt-1 transition-all duration-150 disabled:opacity-50"
            style={{
              background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
              color: "#fff",
              border: "none",
            }}
          >
            {loading ? "…" : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
