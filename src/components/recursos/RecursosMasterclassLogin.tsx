import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

interface AuthedData {
  email: string;
  token: string | null;
  plan: string | null;
  name: string | null;
}

interface Props {
  onAuthed: (data: AuthedData) => void;
}

type ErrorType = "not_found" | "not_paid" | "network" | null;

export default function RecursosMasterclassLogin({ onAuthed }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorType>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const ADMIN_EMAILS = ["comunicacao@fredericocarvalho.pt"];
    const normalizedEmail = email.toLowerCase().trim();

    if (ADMIN_EMAILS.includes(normalizedEmail)) {
      sessionStorage.setItem("recursos_masterclass_token", "admin");
      sessionStorage.setItem("recursos_masterclass_email", normalizedEmail);
      sessionStorage.setItem("recursos_masterclass_plan", "bundle");
      sessionStorage.setItem("recursos_masterclass_name", "Equipa");
      onAuthed({ email: normalizedEmail, token: "admin", plan: "bundle", name: "Equipa" });
      setLoading(false);
      return;
    }

    try {
      const { data: rows, error: dbError } = await supabase
        .from("registrations")
        .select("edit_token, first_name, plan_selected, paid_at, premium_granted_at")
        .eq("email", email.toLowerCase().trim())
        .order("paid_at", { ascending: false, nullsFirst: false })
        .order("premium_granted_at", { ascending: false, nullsFirst: false })
        .limit(1);

      const data = rows?.[0] ?? null;

      if (dbError) { setError("network"); return; }
      if (!data) { setError("not_found"); return; }

      const hasAccess = !!(data.paid_at || (data as any).premium_granted_at);
      if (!hasAccess) { setError("not_paid"); return; }

      sessionStorage.setItem("recursos_masterclass_token", data.edit_token ?? "");
      sessionStorage.setItem("recursos_masterclass_email", email.toLowerCase().trim());
      sessionStorage.setItem("recursos_masterclass_plan", data.plan_selected ?? "");
      sessionStorage.setItem("recursos_masterclass_name", data.first_name ?? "");

      onAuthed({
        email: email.toLowerCase().trim(),
        token: data.edit_token,
        plan: data.plan_selected,
        name: data.first_name,
      });
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--off-white))] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-[hsl(var(--ink-400))] mb-3">
            Masterclass · Vídeo com IA
          </p>
          <h1 className="text-2xl font-bold text-[hsl(var(--ink-900))] leading-tight">
            Recursos da Masterclass
          </h1>
          <p className="text-[hsl(var(--ink-500))] mt-2 text-sm">
            Gravação · Materiais · Exercícios
          </p>
        </div>

        {/* Card */}
        <div className="bg-[hsl(var(--white))] rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email-masterclass" className="text-[hsl(var(--ink-700))] font-medium">
                O teu email
              </Label>
              <Input
                id="email-masterclass"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-11 text-base"
                autoFocus
              />
              <p className="text-xs text-[hsl(var(--ink-400))]">
                Usa o email com que te inscreveste e pagaste.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--red-50))] border border-[hsl(var(--red-500)/0.2)]">
                <AlertCircle size={16} className="text-[hsl(var(--red-500))] mt-0.5 shrink-0" />
                <div className="text-sm">
                  {error === "not_found" && (
                    <>
                      <p className="font-medium text-[hsl(var(--ink-900))]">Email não encontrado.</p>
                      <p className="text-[hsl(var(--ink-500))] mt-1">
                        Verifica se usaste o email certo.{" "}
                        <a href="/video" className="underline text-green-600">
                          Voltar à página principal →
                        </a>
                      </p>
                    </>
                  )}
                  {error === "not_paid" && (
                    <>
                      <p className="font-medium text-[hsl(var(--ink-900))]">Este email ainda não tem acesso pago.</p>
                      <p className="text-[hsl(var(--ink-500))] mt-1">
                        Se pagaste há pouco, aguarda 2–3 min e tenta de novo.{" "}
                        <a href="/upgrade-video" className="underline text-green-600">
                          Comprar acesso →
                        </a>
                      </p>
                    </>
                  )}
                  {error === "network" && (
                    <>
                      <p className="font-medium text-[hsl(var(--ink-900))]">Erro de ligação.</p>
                      <p className="text-[hsl(var(--ink-500))] mt-1">Tenta novamente.</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-11 gap-2 text-base bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Aceder aos recursos
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[hsl(var(--ink-400))] mt-6">
          Área privada para participantes da Masterclass.
        </p>
      </div>
    </div>
  );
}
