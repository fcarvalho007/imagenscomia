import { useState, useEffect } from "react";
import {
  Download, Clock, LogOut,
  Mail, MessageCircle, Check, ChevronDown, Play, Headphones,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import RecursosUpsell from "./RecursosUpsell";

// ─── Configuração de conteúdo ────────────────────────────────────────────────
const RECURSOS_CONFIG = {
  vimeoUrl: "https://vimeo.com/1065826099",
  youtubeUrl: "", // preencher quando disponível
  vimeoEmbed: `<iframe src="https://player.vimeo.com/video/1065826099?h=0&autoplay=0&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
  guiaPdfUrl: "/guia-essencial-seo.png",
  promptsUrl: "",
  promptsAvailableDate: new Date("2026-02-25"),
  resumoPdfUrl: "/resumo-sessao.pdf",
  audioUrl: "/audio-sessao.mp3",
  masterclassUrl: "https://imagenscomia.com/masterclass",
  chapters: [
    { time: "00:00", label: "Introdução e estado da arte" },
    { time: "08:30", label: "Método: do briefing à imagem" },
    { time: "24:00", label: "Demos ao vivo com ferramentas" },
    { time: "48:00", label: "Q&A e casos práticos" },
  ],
  faqs: [
    {
      q: "Não consigo aceder — o que faço?",
      a: "Usa exactamente o mesmo email com que pagaste. Se ainda não funciona, aguarda 2–3 minutos (o sistema processa automaticamente) e tenta de novo.",
    },
    {
      q: "O vídeo não abre ou não carrega.",
      a: "Tenta abrir o vídeo directamente no Vimeo clicando no botão 'Abrir no Vimeo'. Se estás no trabalho, o firewall pode estar a bloquear o Vimeo — usa os dados móveis ou uma rede diferente.",
    },
    {
      q: "Como copio e uso os prompts?",
      a: "Descarrega o ficheiro de prompts (disponível a partir de 25 Fev), abre-o, e copia o prompt directamente para a ferramenta de IA que estás a usar (Midjourney, Firefly, Freepik, etc.).",
    },
    {
      q: "O resultado não saiu igual ao do webinar — porquê?",
      a: "As ferramentas de IA são probabilísticas — cada geração é diferente. Ajusta o prompt: sê mais específico no estilo, iluminação e composição. Experimenta regenerar 2–3 vezes antes de alterar o prompt.",
    },
    {
      q: "Qual o modelo de IA recomendado para começar?",
      a: "Para imagens fotorrealistas: Freepik Mystic ou Adobe Firefly. Para ilustrações e estilos artísticos: Midjourney. Para texto em imagens sem erros: Adobe Firefly com Firefly Image 3.",
    },
    {
      q: "Como evito erros com texto nas imagens?",
      a: "Usa sempre o Adobe Firefly para imagens com texto. Especifica o texto exacto entre aspas no prompt e adiciona 'legible text, clear typography'. Evita Midjourney e Stable Diffusion para texto.",
    },
    {
      q: "Tenho direito à Masterclass?",
      a: "Depende do plano que escolheste. Se adquiriste o Bundle (Webinar + Masterclass), tens acesso incluído — receberás os detalhes por email. Se só adquiriste a Gravação, podes fazer upgrade na secção abaixo.",
    },
    {
      q: "Onde está a minha fatura?",
      a: "A fatura é emitida em 2–5 dias úteis e enviada para o email de inscrição. Se não recebeste, contacta-nos via WhatsApp ou email e enviamos imediatamente.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────

const LS_TAB_KEY = "recursos_active_tab";

interface UserData {
  email: string;
  token: string | null;
  plan: string | null;
  name: string | null;
}

interface RecursosConteudoProps {
  userData: UserData;
  onLogout: () => void;
}

type TabType = "Gravação" | "Guia" | "FAQ";
const TABS: TabType[] = ["Gravação", "Guia", "FAQ"];

// ─── Segmented control tabs ───────────────────────────────────────────────────
function TabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
}) {
  return (
    <div className="p-1.5 bg-gray-100 rounded-xl flex gap-1 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-shrink-0 relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
            activeTab === tab
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── (ActionBar removida) ─────────────────────────────────────────────────────

// ─── Main component ───────────────────────────────────────────────────────────
export default function RecursosConteudo({ userData, onLogout }: RecursosConteudoProps) {
  const savedTab = (typeof window !== "undefined" && localStorage.getItem(LS_TAB_KEY)) as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(savedTab && TABS.includes(savedTab) ? savedTab : "Gravação");
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  const firstName = userData.name?.split(" ")[0] || "amigo";
  const hasMasterclass = ["masterclass", "bundle"].includes(userData.plan ?? "");
  const visibleFaqs = showAllFaqs ? RECURSOS_CONFIG.faqs : RECURSOS_CONFIG.faqs.slice(0, 5);

  // Persist active tab
  useEffect(() => {
    localStorage.setItem(LS_TAB_KEY, activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => setActiveTab(tab);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #F6F8FB 0%, #EEF2F7 100%)" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Play size={10} fill="white" className="text-white ml-0.5" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Imagens com IA — Recursos</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <LogOut size={13} />
            Sair
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-10">

        {/* Title row */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-1">Área Reservada</p>
          <h1 className="font-bold text-[26px] sm:text-[30px] text-gray-900 leading-tight">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-gray-500 text-[15px] mt-1">Aqui estão os teus recursos do webinar.</p>
        </div>

        {/* 2-col grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Main column ── */}
          <div className="flex-1 min-w-0">

            {/* Player card */}
            <div
              className="rounded-2xl overflow-hidden bg-black shadow-lg mb-3 border border-gray-200"
              style={{ position: "relative", paddingTop: "56.25%" }}
            >
              {RECURSOS_CONFIG.vimeoEmbed ? (
                <div dangerouslySetInnerHTML={{ __html: RECURSOS_CONFIG.vimeoEmbed }} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <p className="text-white/40 text-sm">Gravação a ser processada…</p>
                </div>
              )}
            </div>

            {/* Tabs card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-3">

              {/* Segmented control */}
              <div className="px-4 pt-4 pb-0">
                <TabBar
                  activeTab={activeTab}
                  setActiveTab={handleTabChange}
                />
              </div>

              {/* ── Tab: Gravação ── */}
              {activeTab === "Gravação" && (
                <div className="p-5">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                    <Clock size={11} /> Índice da sessão
                  </p>
                  <ul className="space-y-1">
                    {RECURSOS_CONFIG.chapters.map((ch, i) => (
                      <li
                        key={i}
                        onClick={() => setActiveChapter(i)}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                          activeChapter === i
                            ? "bg-blue-50 border border-blue-100"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        {/* Play icon / number */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          activeChapter === i ? "bg-blue-600" : "bg-gray-100 group-hover:bg-gray-200"
                        }`}>
                          {activeChapter === i ? (
                            <Play size={9} fill="white" className="text-white ml-0.5" />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">{i + 1}</span>
                          )}
                        </div>
                        <span className={`font-mono text-xs shrink-0 w-10 ${activeChapter === i ? "text-blue-500" : "text-gray-300"}`}>
                          {ch.time}
                        </span>
                        <span className={`text-sm flex-1 ${activeChapter === i ? "font-medium text-blue-900" : "text-gray-700"}`}>
                          {ch.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Resumo PDF */}
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <a
                      href={RECURSOS_CONFIG.resumoPdfUrl}
                      download
                      className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Download size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 block">Resumo da sessão</span>
                        <span className="text-[11px] text-gray-500">PDF · Descarregar</span>
                      </div>
                    </a>

                    {/* Áudio da gravação */}
                    <div className="mt-3">
                      <a
                        href={RECURSOS_CONFIG.audioUrl}
                        download
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <Headphones size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">Áudio da sessão</span>
                          <span className="text-[11px] text-gray-500">MP3 · Não editado · Descarregar</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Guia ── */}
              {activeTab === "Guia" && (
                <div className="p-5">
                  {/* Download banner */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Download size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">Guia de Apoio — PDF</p>
                      <p className="text-xs text-gray-500 mt-0.5">Conceitos, ferramentas e boas práticas</p>
                    </div>
                    <a href={RECURSOS_CONFIG.guiaPdfUrl} download>
                      <Button size="sm" className="gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
                        <Download size={13} /> Descarregar
                      </Button>
                    </a>
                  </div>

                  {/* Checklist accordion */}
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Checklist rápida
                  </p>
                  <Accordion type="single" collapsible className="space-y-0">
                    <AccordionItem value="setup" className="border-gray-100">
                      <AccordionTrigger className="text-sm text-gray-800 hover:no-underline py-3.5 font-medium">
                        Setup inicial — criar conta nas ferramentas certas
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-500 pb-4 leading-relaxed">
                        Cria conta gratuita em: <strong>Adobe Firefly</strong> (para texto em imagens), <strong>Freepik</strong> (para fotorrealismo), e <strong>ChatGPT/Claude</strong> (para escrever prompts). Começa pelo Freepik — tem o melhor plano gratuito.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="erros" className="border-gray-100">
                      <AccordionTrigger className="text-sm text-gray-800 hover:no-underline py-3.5 font-medium">
                        Erros comuns e como evitá-los
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-500 pb-4 leading-relaxed">
                        1. Prompt demasiado vago → sê específico: estilo, luz, ângulo, mood. 2. Texto com erros → usa Adobe Firefly. 3. Resultados inconsistentes → guarda os prompts que funcionam e itera sobre eles.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="boas-praticas" className="border-gray-100">
                      <AccordionTrigger className="text-sm text-gray-800 hover:no-underline py-3.5 font-medium">
                        Boas práticas de prompt em português
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-500 pb-4 leading-relaxed">
                        Escreve os prompts em inglês para melhores resultados. Usa a estrutura: <em>sujeito + ambiente + estilo + iluminação + câmera</em>. Exemplo: "professional woman in a modern Lisbon café, natural window light, editorial photography, Canon 85mm f/1.4".
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Guia de Prompts — teaser */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        Guia de Prompts
                      </p>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Disponível a 25 Fev
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {[
                        "50+ prompts por categoria (fotografia, produto, editorial, vídeo)",
                        "Templates para Freepik Mystic, Adobe Firefly e Midjourney",
                        "Exemplos com resultado esperado e variações de estilo",
                      ].map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <Check size={13} className="text-blue-500 mt-0.5 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-400 mt-4">
                      📧 Receberás um email assim que estiver disponível.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Tab: FAQ ── */}
              {activeTab === "FAQ" && (
                <div className="px-5 pb-5 pt-2">
                  <Accordion type="single" collapsible>
                    {visibleFaqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border-gray-100">
                        <AccordionTrigger className="text-sm font-medium text-gray-900 hover:no-underline text-left py-4">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-500 pb-4 leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {!showAllFaqs && RECURSOS_CONFIG.faqs.length > 5 && (
                    <button
                      onClick={() => setShowAllFaqs(true)}
                      className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <ChevronDown size={14} />
                      Ver todas ({RECURSOS_CONFIG.faqs.length})
                    </button>
                  )}
                </div>
              )}

            </div>
            {/* end tabs card */}

          </div>
          {/* end main column */}

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="lg:sticky lg:top-[72px] space-y-4">

              {/* 1. Guia PDF */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recursos</p>
                <div className="space-y-2">
                  <a
                    href={RECURSOS_CONFIG.guiaPdfUrl}
                    download
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Download size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Guia PDF</span>
                      <span className="text-[11px] text-gray-500">Descarregar</span>
                    </div>
                  </a>

                  {/* 2. Resumo PDF */}
                  <a
                    href={RECURSOS_CONFIG.resumoPdfUrl}
                    download
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Download size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Resumo da sessão</span>
                      <span className="text-[11px] text-gray-500">PDF</span>
                    </div>
                  </a>

                  {/* 3. Áudio */}
                  <a
                    href={RECURSOS_CONFIG.audioUrl}
                    download
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Headphones size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Áudio da sessão</span>
                      <span className="text-[11px] text-gray-500">MP3 · Não editado</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* 3. Suporte compacto */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Suporte</p>
                </div>
                <p className="text-[12px] text-gray-400 mb-3">Resposta em 24–48h úteis.</p>
                <div className="flex gap-2">
                  <a
                    href="https://wa.me/351915015508?text=Preciso%20de%20ajuda%20com%20a%20minha%20%C3%A1rea%20de%20recursos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle size={13} style={{ color: "#25D366" }} />
                    WhatsApp
                  </a>
                  <a
                    href="mailto:frederico@digitalfc.pt?subject=Ajuda%20Recursos%20Imagens%20com%20IA"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <Mail size={13} className="text-gray-400" />
                    Email
                  </a>
                </div>
              </div>

              {/* 4. Masterclass / Upsell */}
              <RecursosUpsell hasMasterclass={hasMasterclass} compact />

            </div>
          </aside>

        </div>
        {/* end 2-col */}

        {/* Bottom logout */}
        <div className="flex justify-center pt-12 pb-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut size={12} />
            Sair desta área
          </button>
        </div>

      </main>
    </div>
  );
}
