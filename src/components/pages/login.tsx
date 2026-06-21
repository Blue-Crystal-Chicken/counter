import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldAlert, KeyRound, Mail, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("gspptesse@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    return (location.state as { error?: string })?.error || "";
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Email o password non corretti.");
      }

      const data = await response.json();

      // Check role
      const roles = data.roles || [];
      if (!roles.includes("ROLE_ADMIN")) {
        throw new Error("Accesso negato. Solo gli amministratori possono accedere alla cassa.");
      }

      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", String(data.id));
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userSurname", data.surname || "");
      localStorage.setItem("locationName", data.location?.name || "Blue Crystal Torino");
      localStorage.setItem("locationId", String(data.location?.id || 1));
      localStorage.setItem("locationCity", data.location?.city || "Torino");
      localStorage.setItem("locationAddress", data.location?.address || "Via Roma 10");

      navigate("/home");
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Errore durante il login. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail("gspptesse@gmail.com");
    setPassword("123456");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col items-center">
        {/* Logo brand */}
        <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/20 mb-4 animate-bounce">
          C
        </div>
        <h1 className="text-3xl font-black text-white text-center leading-tight">
          Blue Crystal
        </h1>
        <p className="text-sm font-medium text-slate-400 text-center uppercase tracking-widest mt-1 mb-8">
          Cassa Cashier System
        </p>

        {error && (
          <div className="w-full p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <p className="leading-normal">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-5">
          {/* Email input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
              Email Cassiere
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm font-semibold placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                placeholder="E.g. cassiere@bcc.com"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm font-semibold placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                placeholder="Inserisci la password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-4 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Autenticazione in corso...</span>
              </>
            ) : (
              <>
                <span>Accedi alla Cassa</span>
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>

        {/* Demo helpers */}
        <div className="mt-8 text-center border-t border-white/5 pt-6 w-full">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Credenziali demo precaricate
          </p>
          <button
            onClick={handleQuickLogin}
            className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold text-slate-300 rounded-full hover:bg-white/10 active:scale-95 transition-all"
          >
            Usa Admin Demo (Giuseppe Tesse)
          </button>
        </div>
      </div>
    </div>
  );
}
