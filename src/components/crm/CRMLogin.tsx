import { useState } from "react";
import { BarChart2 } from "lucide-react";

interface CRMLoginProps {
  onLogin: () => void;
}

export default function CRMLogin({ onLogin }: CRMLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      email === "fredericodigital@gmail.com" &&
      password === "fc2026crm"
    ) {
      sessionStorage.setItem("crm_auth", "1");
      onLogin();
    } else {
      setError(true);
    }
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
          onChange={(e) => { setEmail(e.target.value); setError(false); }}
          placeholder="email@exemplo.pt"
          className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none mb-4"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(99,179,237,0.6)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
        />

        <label className="block text-[13px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          placeholder="••••••••"
          className="w-full rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(99,179,237,0.6)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
        />

        <button
          type="submit"
          className="w-full mt-6 py-3 rounded-[10px] font-heading font-semibold text-[15px] text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Entrar
        </button>

        {error && (
          <p className="text-[13px] text-center mt-2.5" style={{ color: "#f87171" }}>
            Credenciais inválidas.
          </p>
        )}
      </form>
    </div>
  );
}
