import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift, Check, Copy, MessageCircle, Send, ArrowLeft, Loader2, Mail,
  Sparkles, Share2, Users, Trophy, BookOpen, Crown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { RegistrationModalProvider, useRegistrationModal } from "@/hooks/useRegistrationModal";
import { RegistrationModal } from "@/components/landing/RegistrationModal";

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

interface LeaderboardEntry {
  name: string;
  count: number;
  referralCode: string;
}

const MEDAL_COLORS = [
  "from-amber-400 to-yellow-500", // gold
  "from-slate-300 to-slate-400",  // silver
  "from-amber-600 to-amber-700",  // bronze
];

const ConvitesContent = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { open } = useRegistrationModal();

  useEffect(() => {
    fetchLeaderboard();
    const emailParam = searchParams.get("email");
    if (emailParam && !checked) {
      setEmail(emailParam);
      handleCheck(emailParam);
    }
  }, [searchParams]);

  const fetchLeaderboard = async () => {
    try {
      const { data: lb, error } = await supabase.functions.invoke("get-leaderboard");
      if (!error && Array.isArray(lb)) setLeaderboard(lb);
    } catch { /* silent */ }
  };

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

  // Find user position in leaderboard
  const userLeaderboardPos = data
    ? leaderboard.findIndex((e) => e.referralCode === data.referralCode) + 1
    : 0;

  return (
    <main className="min-h-screen bg-off-white flex flex-col">
      {/* Top bar */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="max-w-[560px] mx-auto flex items-center gap-3">
          <Link to="/" className="text-ink-400 hover:text-ink-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading font-semibold text-sm text-ink-700">Programa de Convites</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-[560px] space-y-6">

          {/* ═══ BLOCO 1: Hero explicativo + formulário ═══ */}
          {!data && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Hero */}
              <div className="bg-background border border-border rounded-xl p-8 shadow-card text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-amber-600" />
                </div>
                <h1 className="font-heading font-bold text-2xl text-ink-900 mb-2">
                  Convida amigos, ganha prémios
                </h1>
                <p className="text-sm text-ink-500 mb-6 max-w-sm mx-auto">
                  Partilha o teu link e desbloqueia vantagens exclusivas — sem pagar nada.
                </p>

                {/* 3 steps */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: Share2, label: "Partilha o teu link pessoal", step: "1" },
                    { icon: Users, label: "2 amigos inscrevem-se", step: "2" },
                    { icon: Sparkles, label: "Desbloqueia o Premium Pass grátis", step: "3" },
                  ].map(({ icon: Icon, label, step }) => (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xs text-ink-700 leading-tight text-center">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Bonus badge */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span className="font-heading font-bold text-sm text-amber-700">Bónus Top 3</span>
                  </div>
                  <p className="text-xs text-amber-600">
                    Os 3 que mais convidarem ganham o livro físico "Guia Essencial SEO" + surpresas 🎁
                  </p>
                </div>

                {/* Email form */}
                <div className="text-left">
                  <p className="font-heading font-semibold text-sm text-ink-700 mb-2">
                    Já te inscreveste? Verifica os teus convites
                  </p>
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
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ver os meus convites"}
                    </button>
                  </form>
                  <button
                    onClick={() => open("free")}
                    className="w-full mt-3 text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Ainda não te inscreveste? Inscreve-te aqui →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ BLOCO 2: Painel pessoal ═══ */}
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Premium unlocked */}
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

              {/* Progress */}
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

              {/* Top 3 motivation */}
              {userLeaderboardPos > 0 && userLeaderboardPos <= 3 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <span className="font-heading font-bold text-sm text-amber-700">
                      Estás no Top {userLeaderboardPos}! 🏆
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">Continua a convidar para garantir o livro "Guia Essencial SEO"</p>
                </div>
              ) : referralCount > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-600">
                    <span className="font-bold">Top 3 ganham o livro "Guia Essencial SEO"!</span> Continua a convidar para subir no ranking.
                  </p>
                </div>
              ) : null}

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

          {/* ═══ BLOCO 3: Leaderboard público ═══ */}
          {leaderboard.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-background border border-border rounded-xl p-6 shadow-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" />
                <p className="font-heading font-semibold text-sm text-ink-700">Ranking de Convites</p>
              </div>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => {
                  const isUser = data?.referralCode === entry.referralCode;
                  const isTop3 = i < 3;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isUser ? "bg-blue-50 border border-blue-200" : isTop3 ? "bg-amber-50/50" : ""
                      }`}
                    >
                      {/* Position */}
                      {isTop3 ? (
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${MEDAL_COLORS[i]} flex items-center justify-center shrink-0`}>
                          <span className="text-xs font-bold text-white">{i + 1}</span>
                        </div>
                      ) : (
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-ink-400">{i + 1}</span>
                        </div>
                      )}
                      {/* Name */}
                      <span className={`flex-1 text-sm ${isUser ? "font-bold text-blue-700" : "text-ink-700"}`}>
                        {entry.name} {isUser && <span className="text-xs text-blue-500">(tu)</span>}
                      </span>
                      {/* Count */}
                      <span className={`text-sm font-bold ${isTop3 ? "text-amber-600" : "text-ink-500"}`}>
                        {entry.count} {entry.count === 1 ? "convite" : "convites"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
};

const Convites = () => (
  <RegistrationModalProvider>
    <ConvitesContent />
    <RegistrationModal />
  </RegistrationModalProvider>
);

export default Convites;
