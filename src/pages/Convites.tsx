import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Check, Copy, MessageCircle, Send, ArrowLeft, Loader2, Mail, ExternalLink, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface Referral {
  name: string;
  created_at: string;
}

interface ReferralData {
  name: string;
  referralCode: string;
  referralLink: string;
  referrals: Referral[];
  premiumUnlocked: boolean;
  totalNeeded: number;
}

const Convites = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && !checked) {
      setEmail(emailParam);
      handleCheck(emailParam);
    }
  }, [searchParams]);

  const handleCheck = async (emailToCheck?: string) => {
    const e = emailToCheck || email;
    if (!e) return;
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("check-referrals", {
        body: { email: e },
      });
      if (fnError) throw fnError;
      if (result.error) {
        setError(result.error === "Email não encontrado" ? "Este email não está registado." : result.error);
        setData(null);
      } else {
        setData(result);
      }
      setChecked(true);
    } catch {
      setError("Erro ao verificar. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (data) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappMsg = data
    ? encodeURIComponent(`Vou participar num webinar gratuito sobre IA para criar imagens profissionais. Inscreve-te aqui: ${data.referralLink}`)
    : "";

  const mailtoLink = data
    ? `mailto:?subject=${encodeURIComponent("Webinar gratuito: Imagens IA para empresas")}&body=${encodeURIComponent(`Olá!\n\nVou participar neste webinar gratuito. Inscreve-te aqui: ${data.referralLink}\n\nAté lá!`)}`
    : "";

  const referralCount = data?.referrals.length || 0;
  const progressPercent = data ? (referralCount / data.totalNeeded) * 100 : 0;

  return (
    <main className="min-h-screen bg-off-white flex flex-col">
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="max-w-[520px] mx-auto flex items-center gap-3">
          <Link to="/" className="text-ink-400 hover:text-ink-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading font-semibold text-sm text-ink-700">Os Teus Convites</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-[520px]">
          {!data && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background border border-border rounded-xl p-8 shadow-card"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-7 h-7 text-amber-600" />
                </div>
                <h1 className="font-heading font-bold text-xl text-ink-900 mb-1">Acompanha os teus convites</h1>
                <p className="text-sm text-ink-500">Introduz o email que usaste na inscrição</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCheck(); }} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="email"
                    placeholder="O teu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-surface border border-border h-12 pl-10 pr-4 rounded-lg text-ink-900 placeholder:text-ink-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-sm"
                  />
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-ink-900 hover:bg-ink-700 text-white font-heading font-bold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ver convites"}
                </button>
              </form>
            </motion.div>
          )}

          {data && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Premium unlocked banner */}
              {data.premiumUnlocked && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3"
                  >
                    <Sparkles className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h2 className="font-heading font-bold text-xl text-green-700 mb-1">🎉 Premium Desbloqueado!</h2>
                  <p className="text-sm text-green-600">Já tens acesso completo ao Premium Pass, sem pagar.</p>
                </div>
              )}

              {/* Progress card */}
              <div className="bg-background border border-border rounded-xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading font-semibold text-sm text-ink-700">Progresso</span>
                  <span className="font-heading font-bold text-sm text-ink-900">{referralCount}/{data.totalNeeded}</span>
                </div>
                <Progress value={progressPercent} className="h-2.5 mb-3" />
                {!data.premiumUnlocked && (
                  <p className="text-xs text-ink-500">
                    {referralCount === 0
                      ? "Convida 2 amigos para desbloquear o Premium grátis!"
                      : `Falta ${data.totalNeeded - referralCount} amigo para desbloquear o Premium!`}
                  </p>
                )}
              </div>

              {/* Referral link */}
              <div className="bg-background border border-border rounded-xl p-6 shadow-card">
                <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-500 mb-3">O TEU LINK</p>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    readOnly
                    value={data.referralLink}
                    className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-xs text-ink-700 truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="shrink-0 bg-ink-900 text-white text-xs font-medium px-3 py-2.5 rounded-lg hover:bg-ink-700 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a href={mailtoLink}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                    <Send className="w-3.5 h-3.5" /> Email
                  </a>
                </div>
              </div>

              {/* Referrals list */}
              <div className="bg-background border border-border rounded-xl p-6 shadow-card">
                <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-500 mb-3">AMIGOS REGISTADOS</p>
                <div className="space-y-3">
                  {data.referrals.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{r.name}</p>
                        <p className="text-xs text-ink-400">
                          Registou-se {new Date(r.created_at).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: data.totalNeeded - referralCount }).map((_, i) => (
                    <div key={`pending-${i}`} className="flex items-center gap-3 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center shrink-0">
                        <span className="text-xs text-ink-400">?</span>
                      </div>
                      <p className="text-sm text-ink-400">A aguardar convite...</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Convites;
