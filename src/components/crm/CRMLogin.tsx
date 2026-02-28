import { useState } from "react";
import { BarChart2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_EMAIL = "fredericodigital@gmail.com";

interface CRMLoginProps {
  onLogin: () => void;
}

export default function CRMLogin({ onLogin }: CRMLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email.toLowerCase().trim() !== ALLOWED_EMAIL) {
      setError("Acesso restrito.");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    setLoading(false);

    if (authError) {
      setError("Credenciais inválidas.");
      return;
    }

    sessionStorage.setItem("crm_admin_email", ALLOWED_EMAIL);
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] rounded-2xl p-10 max-sm:p-7"
        style={{
          background: "#1E293B",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.40)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={28} className="text-blue-300" />
          <span className="font-heading font-extrabold text-xl text-white">WebinarCRM</span>
        </div>
        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          Webinar IA · Frederico Carvalho
        </p>

        <label className="block text-[13px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="email@exemplo.pt"
          className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none mb-4"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(99,179,237,0.6)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
          autoFocus
        />

        <label className="block text-[13px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          Password
        </label>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="••••••••"
            className="w-full rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(99,179,237,0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(255,255,255,0.35)" }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-[10px] font-heading font-semibold text-[15px] text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "A entrar..." : "Entrar"}
        </button>

        {error && (
          <p className="text-[13px] text-center mt-2.5" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
