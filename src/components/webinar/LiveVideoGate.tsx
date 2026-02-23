import { useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const LS_KEY = "live_video_email";

interface Props {
  children: ReactNode;
  onRequestRegister: () => void;
}

export default function LiveVideoGate({ children, onRequestRegister }: Props) {
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      verifyEmail(stored, true);
    } else {
      setChecking(false);
    }
  }, []);

  async function verifyEmail(emailToCheck: string, silent = false) {
    setChecking(true);
    setError("");
    const normalized = emailToCheck.toLowerCase().trim();

    const { data } = await supabase
      .from("registrations")
      .select("id, attended_live_at")
      .eq("email", normalized)
      .eq("webinar", "video")
      .limit(1);

    if (!data || data.length === 0) {
      if (silent) {
        localStorage.removeItem(LS_KEY);
        setChecking(false);
        return;
      }
      setError("not_found");
      setChecking(false);
      return;
    }

    // Mark attendance if not already
    if (!data[0].attended_live_at) {
      await supabase
        .from("registrations")
        .update({ attended_live_at: new Date().toISOString() } as any)
        .eq("id", data[0].id);
    }

    localStorage.setItem(LS_KEY, normalized);
    setVerified(true);
    setChecking(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <p className="text-[15px] text-ink-400">A verificar acesso…</p>
      </div>
    );
  }

  if (verified) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center font-sans">
      <div className="w-full max-w-[420px] px-6">
        <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
          <h1 className="font-heading font-bold text-[22px] text-ink-900 mb-2 text-center">
            Sessão ao vivo
          </h1>
          <p className="text-[14px] text-ink-500 text-center mb-6">
            Insere o email que usaste na inscrição para aceder à sessão.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) verifyEmail(email);
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="o-teu@email.com"
              className="w-full px-4 py-3 border border-border rounded-lg text-[15px] text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
              autoFocus
            />
            <button
              type="submit"
              disabled={!email.trim() || checking}
              className="w-full py-3 rounded-lg font-semibold text-[15px] transition-colors"
              style={{ background: "#16a34a", color: "#fff" }}
            >
              Entrar na sessão →
            </button>
          </form>

          {error === "not_found" && (
            <div className="mt-5 text-center">
              <p className="text-[13px] text-ink-500 mb-3">
                Este email não está inscrito no webinar de vídeo.
              </p>
              <button
                onClick={onRequestRegister}
                className="text-[14px] font-semibold hover:underline"
                style={{ color: "#16a34a" }}
              >
                Inscrever-me agora →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
