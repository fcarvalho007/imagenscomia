import { useState, useEffect, type ReactNode } from "react";
import {
  ACCESS_LINK_GENERIC_MESSAGE,
  clearToken,
  legacyRegAttendance,
  requestAccessLink,
  resolveToken,
} from "@/lib/legacyAccess";

const SCOPE = "live-video" as const;

interface Props {
  children: ReactNode;
}

/**
 * Access to the live session requires the personal token from the registration
 * link. An email only triggers a new link being emailed to that address.
 */
export default function LiveVideoGate({ children }: Props) {
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("t");
    const token = resolveToken(SCOPE, urlToken);
    if (!token) {
      setChecking(false);
      return;
    }
    (async () => {
      try {
        const result = await legacyRegAttendance(token, "video");
        if (result?.found) {
          setVerified(true);
        } else {
          clearToken(SCOPE);
        }
      } catch {
        clearToken(SCOPE);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return;
    setSending(true);
    setError("");
    try {
      await requestAccessLink(trimmed, "live-video");
      setSent(true);
    } catch {
      setError("network");
    } finally {
      setSending(false);
    }
  };

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

          {sent ? (
            <p className="text-[14px] text-ink-500 text-center">
              {ACCESS_LINK_GENERIC_MESSAGE}
            </p>
          ) : (
            <>
              <p className="text-[14px] text-ink-500 text-center mb-6">
                Enviamos a ligação de acesso para o email da tua inscrição.
              </p>

              <form onSubmit={handleRequest}>
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
                  disabled={!email.trim() || sending}
                  className="w-full py-3 rounded-lg font-semibold text-[15px] transition-colors disabled:opacity-60"
                  style={{ background: "#16a34a", color: "#fff" }}
                >
                  {sending ? "A enviar…" : "Receber ligação de acesso →"}
                </button>
              </form>

              {error === "network" && (
                <p className="mt-4 text-[13px] text-ink-500 text-center">
                  Não foi possível enviar agora. Tenta novamente daqui a pouco.
                </p>
              )}

              <p className="mt-5 text-center text-[13px] text-ink-500">
                Ainda não estás inscrito?{" "}
                <a href="/video" className="font-semibold hover:underline" style={{ color: "#16a34a" }}>
                  Inscrever-me →
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
