import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Check, Copy, MessageCircle, Send, ArrowLeft, Loader2, Mail,
  Sparkles, Share2, Users, Trophy, BookOpen, Crown, ExternalLink, Info, X,
  CheckCircle2, Link2, Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { RegistrationModalProvider, useRegistrationModal } from "@/hooks/useRegistrationModal";
import { RegistrationModal } from "@/components/landing/RegistrationModal";
import { toast } from "@/hooks/use-toast";
import livroSeo from "@/assets/livro-guia-seo.png";

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
  "from-amber-400 to-yellow-500",
  "from-slate-300 to-slate-400",
  "from-amber-600 to-amber-700",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatInviteDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const day = d.getDate();
    const month = d.toLocaleDateString("pt-PT", { month: "short" }).replace(".", "");
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} · ${hours}:${minutes}`;
  } catch {
    return "";
  }
}

const ConvitesContent = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [msgTab, setMsgTab] = useState<"whatsapp" | "email">("whatsapp");
  const { open } = useRegistrationModal();
  const lastCheckedEmail = useRef<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const { data: lb, error } = await supabase.functions.invoke("get-leaderboard");
      if (!error && Array.isArray(lb)) setLeaderboard(lb);
    } catch { /* silent */ }
    finally { setLeaderboardLoading(false); }
  }, []);

  const handleCheck = useCallback(async (emailToCheck?: string) => {
    const e = (emailToCheck || email).trim().toLowerCase();
    if (!e) {
      setEmailError("Introduzir o email de inscrição.");
      return;
    }
    if (!EMAIL_REGEX.test(e)) {
      setEmailError("Email inválido. Verificar o formato.");
      return;
    }
    setEmailError(null);
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
        toast({ title: "Dados carregados ✅", description: `Olá, ${result.name?.split(" ")[0] || ""}!` });
      }
      lastCheckedEmail.current = e;
    } catch {
      setError("Erro ao verificar. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }, [email]);

  // Auto-check on mount or when email param changes
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && emailParam !== lastCheckedEmail.current) {
      setEmail(emailParam);
      handleCheck(emailParam);
    }
  }, [searchParams, handleCheck]);

  // Lazy-load leaderboard (500ms delay)
  useEffect(() => {
    const timer = setTimeout(fetchLeaderboard, 500);
    return () => clearTimeout(timer);
  }, [fetchLeaderboard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setData(null);
      setError(null);
      lastCheckedEmail.current = null;
    };
  }, []);

  const handleCopy = useCallback(() => {
    if (data) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      toast({ title: "Link copiado ✅", description: "Pronto para partilhar." });
      setTimeout(() => setCopied(false), 3500);
    }
  }, [data]);

  const handleCopyMsg = useCallback(() => {
    if (!data) return;
    const msg = msgTab === "whatsapp"
      ? `Inscrição gratuita: webinar "Cria Imagens Profissionais com IA" (18 Fev, 10h). Link: ${data.referralLink}`
      : `Partilho um webinar gratuito (18 Fev, 10h): Cria Imagens Profissionais com IA. Inscrição aqui: ${data.referralLink}`;
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    toast({ title: "Mensagem copiada ✅" });
    setTimeout(() => setCopiedMsg(false), 3500);
  }, [data, msgTab]);

  const whatsappMsg = data
    ? encodeURIComponent(`Inscrição gratuita: webinar "Cria Imagens Profissionais com IA" (18 Fev, 10h). Link: ${data.referralLink}`)
    : "";
  const mailtoLink = data
    ? `mailto:?subject=${encodeURIComponent("Webinar gratuito: Imagens IA para empresas")}&body=${encodeURIComponent(`Partilho um webinar gratuito (18 Fev, 10h): Cria Imagens Profissionais com IA.\n\nInscrição aqui: ${data.referralLink}`)}`
    : "";

  const referralCount = data?.referrals.length || 0;
  const progressPercent = data ? Math.min((referralCount / data.totalNeeded) * 100, 100) : 0;
  const userLeaderboardPos = data
    ? leaderboard.findIndex((e) => e.referralCode === data.referralCode) + 1
    : 0;

  const shortLink = data ? data.referralLink.replace(/^https?:\/\//, "") : "";

  const validateEmailOnBlur = useCallback(() => {
    if (email && !EMAIL_REGEX.test(email.trim())) {
      setEmailError("Email inválido. Verificar o formato.");
    } else {
      setEmailError(null);
    }
  }, [email]);

  return (
    <main className="min-h-screen bg-off-white flex flex-col">
      {/* Top bar */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-ink-400 hover:text-ink-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-heading font-semibold text-sm text-ink-700">Programa de Convites</span>
          </div>
          {data && (
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Inscrição confirmada
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8 max-sm:py-5">
        <div className="w-full max-w-[600px] space-y-5 max-sm:space-y-4">

          {/* ═══ BLOCO 1: Pré-login — Hero + formulário ═══ */}
          {!data && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 max-sm:space-y-4"
            >
              <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 max-sm:p-4 shadow-card text-center">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-7 h-7 text-amber-600" />
                </div>
                <h1 className="font-heading font-bold text-2xl sm:text-[28px] text-ink-900 mb-2 leading-tight">
                  Convida amigos, desbloqueia prémios
                </h1>
                <p className="text-sm text-ink-500 mb-8 max-w-sm mx-auto">
                  Partilha o link pessoal. Com 2 inscrições, o livro fica ao alcance.
                </p>

                {/* 3 steps — stacks on small mobile */}
                <div className="grid grid-cols-3 max-sm:grid-cols-1 max-sm:gap-3 gap-4 mb-8">
                  {[
                    { icon: Link2, label: "Partilhar link pessoal", step: "1" },
                    { icon: Users, label: "2 pessoas inscrevem-se", step: "2" },
                    { icon: Gift, label: "Livro físico + surpresas", step: "3" },
                  ].map(({ icon: Icon, label, step }) => (
                    <div key={step} className="flex flex-col max-sm:flex-row items-center gap-2.5 max-sm:gap-3">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 max-sm:w-10 max-sm:h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <Icon className="w-5 h-5 max-sm:w-4 max-sm:h-4 text-blue-600" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {step}
                        </span>
                      </div>
                      <span className="text-xs text-ink-600 leading-tight text-center max-sm:text-left font-medium">{label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-ink-400 mb-6">Sem custos. A inscrição continua gratuita.</p>

                {/* Email form */}
                <div className="text-left border-t border-border pt-6">
                  <p className="font-heading font-semibold text-sm text-ink-700 mb-3">
                    Verificar os convites
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); handleCheck(); }} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                      <input
                        type="email"
                        placeholder="Email de inscrição"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                        onBlur={validateEmailOnBlur}
                        required
                        className={`w-full bg-surface border h-12 pl-10 pr-4 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                          emailError
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                            : "border-border focus:border-blue-600 focus:ring-blue-600/20"
                        }`}
                      />
                    </div>
                    {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-ink-900 hover:bg-ink-700 text-white font-heading font-bold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ver os meus convites"}
                    </button>
                  </form>
                  <div className="mt-5 text-center">
                    <button
                      onClick={() => open("free")}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline underline-offset-2"
                    >
                      Ainda sem inscrição? Registar gratuitamente →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ BLOCO 2: Painel pessoal (pós-login) ═══ */}
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 max-sm:space-y-4"
            >
              {/* Header */}
              <div className="text-center">
                <h1 className="font-heading font-bold text-2xl sm:text-[28px] text-ink-900 mb-1 leading-tight">
                  Convida amigos, desbloqueia prémios
                </h1>
                <p className="text-sm text-ink-500">
                  Partilha o link — 2 inscrições desbloqueiam o prémio
                </p>
              </div>

              {/* A) Como funciona — compact */}
              <div className="bg-background border border-border rounded-2xl p-5 max-sm:p-4 shadow-card">
                <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-400 mb-4">Como funciona</p>
                <div className="flex max-sm:flex-col items-start gap-4 max-sm:gap-3">
                  {[
                    { icon: Link2, label: "Partilhar link" },
                    { icon: Users, label: "2 inscrições" },
                    { icon: Gift, label: "Livro + surpresas" },
                  ].map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex-1 flex flex-col max-sm:flex-row items-center max-sm:items-center gap-2 max-sm:gap-3 text-center max-sm:text-left w-full">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs text-ink-600 font-medium leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-ink-400 text-center mt-3">Sem custos. A inscrição continua gratuita.</p>
              </div>

              {/* B) Progresso */}
              <div className="bg-background border border-border rounded-2xl p-5 max-sm:p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading font-semibold text-sm text-ink-700">Progresso</span>
                  <span className="font-heading font-bold text-lg text-ink-900">{referralCount}/{data.totalNeeded}</span>
                </div>
                <div className="relative mb-3">
                  <Progress value={progressPercent} className="h-3" />
                  <div className="absolute top-0 left-0 w-full h-3 flex items-center">
                    <div className="absolute left-1/2 w-0.5 h-3 bg-white/60" />
                  </div>
                </div>
                <p className="text-sm text-ink-500">
                  {referralCount === 0 && "Faltam 2 inscrições para desbloquear o prémio."}
                  {referralCount === 1 && "Já falta apenas 1 inscrição!"}
                  {referralCount >= 2 && data.premiumUnlocked && "Prémio desbloqueado 🎉 Instruções enviadas por email em breve."}
                  {referralCount >= 2 && !data.premiumUnlocked && "Objetivo atingido! O prémio será ativado em breve."}
                </p>
                <button
                  onClick={() => setRulesOpen(true)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <Info className="w-3 h-3" /> Ver regras
                </button>
              </div>

              {/* Premium unlocked banner */}
              {data.premiumUnlocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3"
                  >
                    <Sparkles className="w-7 h-7 text-green-600" />
                  </motion.div>
                  <h2 className="font-heading font-bold text-lg text-green-700 mb-1">🎉 Premium Desbloqueado!</h2>
                  <p className="text-sm text-green-600">Acesso completo ao Premium Pass — sem pagar.</p>
                </motion.div>
              )}

              {/* C) Link pessoal + Partilha */}
              <div className="bg-background border border-border rounded-2xl p-5 max-sm:p-4 shadow-card space-y-4">
                <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-400">Link pessoal</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-ink-600 truncate font-mono">
                    {shortLink}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className={`shrink-0 text-sm font-semibold px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-ink-900 text-white hover:bg-ink-700"
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar"}
                  </motion.button>
                </div>
                <div className="flex max-sm:flex-col gap-3">
                  <motion.a
                    whileTap={{ scale: 0.97 }}
                    href={`https://wa.me/?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </motion.a>
                  <motion.a
                    whileTap={{ scale: 0.97 }}
                    href={mailtoLink}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </motion.a>
                </div>
                <p className="text-[11px] text-ink-400 text-center">Quanto mais simples for a mensagem, maior a taxa de inscrição.</p>
              </div>

              {/* D) Mensagem pronta */}
              <div className="bg-background border border-border rounded-2xl p-5 max-sm:p-4 shadow-card">
                <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-400 mb-3">Mensagem pronta</p>
                <div className="flex gap-1 mb-3">
                  <button
                    onClick={() => setMsgTab("whatsapp")}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${msgTab === "whatsapp" ? "bg-green-600 text-white" : "bg-surface text-ink-500 hover:bg-ink-100"}`}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setMsgTab("email")}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${msgTab === "email" ? "bg-blue-600 text-white" : "bg-surface text-ink-500 hover:bg-ink-100"}`}
                  >
                    Email
                  </button>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4 text-sm text-ink-700 leading-relaxed mb-3 min-h-[60px]">
                  {msgTab === "whatsapp"
                    ? `Inscrição gratuita: webinar "Cria Imagens Profissionais com IA" (18 Fev, 10h). Link: ${data.referralLink}`
                    : `Partilho um webinar gratuito (18 Fev, 10h): Cria Imagens Profissionais com IA. Inscrição aqui: ${data.referralLink}`}
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCopyMsg}
                  className={`w-full border text-sm font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    copiedMsg
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-surface hover:bg-ink-100 border-border text-ink-700"
                  }`}
                >
                  {copiedMsg ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copiedMsg ? "Copiada!" : "Copiar mensagem"}
                </motion.button>
              </div>

              {/* E) Amigos registados */}
              <div className="bg-background border border-border rounded-2xl p-5 max-sm:p-4 shadow-card">
                <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-400 mb-4">Amigos registados</p>
                {data.referrals.length === 0 && referralCount === 0 ? (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                    <p className="text-sm text-ink-400 mb-1">Ainda ninguém se registou pelo link.</p>
                    <p className="text-xs text-ink-400">Partilhar agora?</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.referrals.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 bg-green-50/50 rounded-xl px-3 py-2.5">
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">{r.name || `Convidado #${i + 1}`}</p>
                          <p className="text-xs text-ink-400">
                            Inscrito ✅ · {formatInviteDate(r.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, data.totalNeeded - referralCount) }).map((_, i) => (
                      <div key={`pending-${i}`} className="flex items-center gap-3 opacity-40 rounded-xl px-3 py-2.5">
                        <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center shrink-0">
                          <span className="text-xs text-ink-400 font-medium">?</span>
                        </div>
                        <p className="text-sm text-ink-400">A aguardar…</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-ink-400 mt-3">As inscrições podem demorar alguns minutos a aparecer.</p>
              </div>

              {/* F) Recompensa */}
              <div className="bg-background border border-border rounded-2xl p-5 max-sm:p-4 shadow-card">
                <p className="font-heading font-semibold text-xs uppercase tracking-[0.08em] text-ink-400 mb-4">O que está em jogo</p>
                <div className="flex items-start gap-4">
                  <img src={livroSeo} alt="Guia Essencial de SEO" className="w-20 h-auto rounded-lg shadow-sm shrink-0" />
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-ink-700 font-medium">Livro físico "Guia Essencial de SEO"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-ink-700 font-medium">Surpresas adicionais (para os que mais convidarem)</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    Os 3 que mais convidarem recebem o livro + extras.
                  </p>
                  <span className="ml-auto bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">TOP 3</span>
                </div>
              </div>

              {/* Top 3 position badge */}
              {userLeaderboardPos > 0 && userLeaderboardPos <= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <span className="font-heading font-bold text-sm text-amber-700">
                      Posição atual: Top {userLeaderboardPos}! 🏆
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">Continuar a convidar para garantir o livro.</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══ BLOCO 3: Leaderboard público ═══ */}
          {leaderboardLoading ? (
            <div className="bg-background border border-border rounded-2xl p-5 max-sm:p-4 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" />
                <p className="font-heading font-semibold text-sm text-ink-700">Ranking de Convites</p>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <Skeleton className="h-4 flex-1 max-w-[160px]" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          ) : leaderboard.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-background border border-border rounded-2xl p-5 max-sm:p-4 shadow-card"
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isUser ? "bg-blue-50 border border-blue-200" : isTop3 ? "bg-amber-50/50" : ""
                      }`}
                    >
                      {isTop3 ? (
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${MEDAL_COLORS[i]} flex items-center justify-center shrink-0`}>
                          <span className="text-xs font-bold text-white">{i + 1}</span>
                        </div>
                      ) : (
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-ink-400">{i + 1}</span>
                        </div>
                      )}
                      <span className={`flex-1 text-sm ${isUser ? "font-bold text-blue-700" : "text-ink-700"}`}>
                        {entry.name} {isUser && <span className="text-xs text-blue-500">(tu)</span>}
                      </span>
                      <span className={`text-sm font-bold ${isTop3 ? "text-amber-600" : "text-ink-500"}`}>
                        {entry.count} {entry.count === 1 ? "convite" : "convites"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {leaderboard.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-ink-400">Sem dados de ranking disponíveis.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-background border border-border rounded-2xl p-5 max-sm:p-4 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" />
                <p className="font-heading font-semibold text-sm text-ink-700">Ranking de Convites</p>
              </div>
              <div className="text-center py-4">
                <p className="text-sm text-ink-400">Ainda sem participantes no ranking. Sê o primeiro!</p>
              </div>
            </div>
          )}

          {/* Footer micro */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-8 text-xs text-ink-400">
            <div className="flex items-center gap-4">
              <Link to="/" className="hover:text-ink-600 transition-colors">← Voltar ao webinar</Link>
              <a
                href="https://api.whatsapp.com/send?phone=351915015508&text=WebinarAI"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink-600 transition-colors flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" /> Suporte WhatsApp
              </a>
            </div>
            <span>Dúvidas? Resposta rápida no WhatsApp.</span>
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {rulesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setRulesOpen(false)}
          >
            <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-background rounded-2xl p-6 shadow-card-lg"
            >
              <button
                onClick={() => setRulesOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-ink-400 hover:text-ink-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-heading font-bold text-lg text-ink-900 mb-4">Regras do Programa</h3>
              <ul className="space-y-3 text-sm text-ink-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Conta quando a pessoa se inscreve através do link pessoal.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Objetivo principal: 2 inscrições para desbloquear o prémio.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Top 3 convites recebem o livro físico + extras.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>A organização pode validar inscrições para evitar spam/fraude.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Dúvidas? <a href="https://api.whatsapp.com/send?phone=351915015508&text=WebinarAI" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">WhatsApp</a>.</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
