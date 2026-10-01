import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, AlertCircle, MailCheck } from "lucide-react";
import {
  requestAccessLink,
  ACCESS_LINK_GENERIC_MESSAGE,
  type LegacyDestination,
} from "@/lib/legacyAccess";

export interface RecursosAccessRequestProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  footnote: string;
  inputId: string;
  destination: LegacyDestination;
  buttonClassName?: string;
  linkClassName?: string;
  homeHref: string;
  buyHref: string;
}

/**
 * Access recovery for the resources areas.
 *
 * It never checks the email against the database from the browser and never
 * receives a token: it simply asks the server to email the existing link to
 * the address on the registration, and always shows the same generic message.
 */
export default function RecursosAccessRequest({
  eyebrow,
  title,
  subtitle,
  footnote,
  inputId,
  destination,
  buttonClassName = "",
  linkClassName = "text-[hsl(var(--blue-600))]",
  homeHref,
  buyHref,
}: RecursosAccessRequestProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return;

    setLoading(true);
    setError(false);
    try {
      await requestAccessLink(trimmed, destination);
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--off-white))] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-[hsl(var(--ink-400))] mb-3">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-bold text-[hsl(var(--ink-900))] leading-tight">{title}</h1>
          <p className="text-[hsl(var(--ink-500))] mt-2 text-sm">{subtitle}</p>
        </div>

        <div className="bg-[hsl(var(--white))] rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6 sm:p-8">
          {sent ? (
            <div className="text-center space-y-3">
              <MailCheck size={28} className="mx-auto text-[hsl(var(--ink-500))]" />
              <p className="font-medium text-[hsl(var(--ink-900))]">Verifica o teu email</p>
              <p className="text-sm text-[hsl(var(--ink-500))]">{ACCESS_LINK_GENERIC_MESSAGE}</p>
              <p className="text-xs text-[hsl(var(--ink-400))]">
                Ainda não compraste?{" "}
                <a href={buyHref} className={`underline ${linkClassName}`}>
                  Ver acesso →
                </a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={inputId} className="text-[hsl(var(--ink-700))] font-medium">
                  O teu email
                </Label>
                <Input
                  id={inputId}
                  type="email"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-11 text-base"
                  autoFocus
                />
                <p className="text-xs text-[hsl(var(--ink-400))]">
                  Enviamos a ligação de acesso para o email da tua inscrição.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--red-50))] border border-[hsl(var(--red-500)/0.2)]">
                  <AlertCircle size={16} className="text-[hsl(var(--red-500))] mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-[hsl(var(--ink-900))]">Erro de ligação.</p>
                    <p className="text-[hsl(var(--ink-500))] mt-1">Tenta novamente daqui a pouco.</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className={`w-full h-11 gap-2 text-base ${buttonClassName}`}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Receber ligação de acesso
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-[hsl(var(--ink-400))]">
                <a href={homeHref} className={`underline ${linkClassName}`}>
                  Voltar à página principal →
                </a>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[hsl(var(--ink-400))] mt-6">{footnote}</p>
      </div>
    </div>
  );
}
