import { useState } from "react";
import {
  Download, ExternalLink, BookOpen, Clock, HelpCircle, LogOut,
  Mail, MessageCircle, Check, ChevronDown,
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
  vimeoEmbed: `<iframe src="https://player.vimeo.com/video/1065826099?h=0&autoplay=0&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
  guiaPdfUrl: "/guia-essencial-seo.png",
  promptsUrl: "",
  promptsAvailableDate: new Date("2026-02-25"),
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

type TabType = "Gravação" | "Guia" | "Prompts" | "FAQ";

export default function RecursosConteudo({ userData, onLogout }: RecursosConteudoProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Gravação");
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  const firstName = userData.name?.split(" ")[0] || "amigo";
  const hasMasterclass = ["masterclass", "bundle"].includes(userData.plan ?? "");
  const promptsAvailable = new Date() >= RECURSOS_CONFIG.promptsAvailableDate;
  const visibleFaqs = showAllFaqs
    ? RECURSOS_CONFIG.faqs
    : RECURSOS_CONFIG.faqs.slice(0, 5);

  const TABS: TabType[] = ["Gravação", "Guia", "Prompts", "FAQ"];

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(to bottom, #050816, #0B1026)" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Imagens com IA — Recursos</p>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            <LogOut size={13} />
            Sair
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-10">

        {/* Title row */}
        <div className="mb-7">
          <p className="text-white/50 text-[12px] uppercase tracking-widest mb-1">Área Reservada</p>
          <h1 className="font-bold text-[28px] sm:text-[32px] text-white leading-tight">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-white/60 text-[15px] mt-1">Aqui estão os teus recursos do webinar.</p>
        </div>

        {/* 2-col grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Main column (70%) ── */}
          <div className="flex-1 min-w-0">

            {/* Player */}
            <div
              className="rounded-[20px] overflow-hidden bg-black shadow-2xl mb-3"
              style={{ position: "relative", paddingTop: "56.25%" }}
            >
              {RECURSOS_CONFIG.vimeoEmbed ? (
                <div dangerouslySetInnerHTML={{ __html: RECURSOS_CONFIG.vimeoEmbed }} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/40 text-sm">Gravação a ser processada…</p>
                </div>
              )}
            </div>

            {/* Vimeo fallback link */}
            <div className="flex justify-end mb-4">
              <a
                href={RECURSOS_CONFIG.vimeoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors"
              >
                <ExternalLink size={12} />
                Abrir no Vimeo
              </a>
            </div>

            {/* Tabs container */}
            <div className="rounded-[16px] border border-white/10 shadow-lg overflow-hidden bg-white/96 backdrop-blur">

              {/* Tab headers */}
              <div className="flex border-b border-black/8 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-shrink-0 px-5 py-3.5 text-[14px] font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-blue-600 text-blue-700 bg-blue-50/60"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                    {tab === "Prompts" && !promptsAvailable && (
                      <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                        Em breve
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Tab: Gravação ── */}
              {activeTab === "Gravação" && (
                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-3">
                    <Clock size={11} /> Índice da sessão
                  </p>
                  <ul className="space-y-1">
                    {RECURSOS_CONFIG.chapters.map((ch, i) => (
                      <li
                        key={i}
                        onClick={() => setActiveChapter(i)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                          activeChapter === i
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span className={`font-mono text-xs w-12 shrink-0 ${activeChapter === i ? "text-blue-500" : "text-gray-400"}`}>
                          {ch.time}
                        </span>
                        <span className="text-sm flex-1">{ch.label}</span>
                        {activeChapter === i && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Tab: Guia ── */}
              {activeTab === "Guia" && (
                <div className="p-5">
                  {/* Download banner */}
                  <div className="flex items-center gap-3 mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Download size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">Guia de Apoio — PDF</p>
                      <p className="text-xs text-gray-400">Conceitos, ferramentas e boas práticas</p>
                    </div>
                    <a href={RECURSOS_CONFIG.guiaPdfUrl} download>
                      <Button size="sm" className="gap-1.5 shrink-0">
                        <Download size={13} /> Descarregar
                      </Button>
                    </a>
                  </div>

                  {/* Checklist accordion */}
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Checklist rápida
                  </p>
                  <Accordion type="single" collapsible className="space-y-0">
                    <AccordionItem value="setup">
                      <AccordionTrigger className="text-sm text-gray-700 hover:no-underline py-3">
                        Setup inicial — criar conta nas ferramentas certas
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-500 pb-3">
                        Cria conta gratuita em: <strong>Adobe Firefly</strong> (para texto em imagens), <strong>Freepik</strong> (para fotorrealismo), e <strong>ChatGPT/Claude</strong> (para escrever prompts). Começa pelo Freepik — tem o melhor plano gratuito.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="erros">
                      <AccordionTrigger className="text-sm text-gray-700 hover:no-underline py-3">
                        Erros comuns e como evitá-los
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-500 pb-3">
                        1. Prompt demasiado vago → sê específico: estilo, luz, ângulo, mood. 2. Texto com erros → usa Adobe Firefly. 3. Resultados inconsistentes → guarda os prompts que funcionam e itera sobre eles.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="boas-praticas">
                      <AccordionTrigger className="text-sm text-gray-700 hover:no-underline py-3">
                        Boas práticas de prompt em português
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-500 pb-3">
                        Escreve os prompts em inglês para melhores resultados. Usa a estrutura: <em>sujeito + ambiente + estilo + iluminação + câmera</em>. Exemplo: "professional woman in a modern Lisbon café, natural window light, editorial photography, Canon 85mm f/1.4".
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {/* ── Tab: Prompts ── */}
              {activeTab === "Prompts" && (
                <div className="p-5">
                  {promptsAvailable && RECURSOS_CONFIG.promptsUrl ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Biblioteca completa de prompts prontos a usar, organizados por categoria.
                      </p>
                      <a href={RECURSOS_CONFIG.promptsUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-2">
                          <Download size={14} /> Descarregar Prompts
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-widest uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          Disponível a partir de 25 de Fevereiro
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        A biblioteca de prompts está a ser finalizada. O que inclui:
                      </p>
                      <ul className="space-y-3">
                        {[
                          "50+ prompts organizados por categoria (fotografia, produto, editorial, vídeo)",
                          "Templates para Freepik Mystic, Adobe Firefly e Midjourney",
                          "Exemplos com resultado esperado e variações de estilo",
                        ].map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <Check size={14} className="text-green-600 mt-0.5 shrink-0" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-400">
                        Receberás um email assim que estiver disponível.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: FAQ ── */}
              {activeTab === "FAQ" && (
                <div className="px-5 pb-5">
                  <Accordion type="single" collapsible>
                    {visibleFaqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-sm font-medium text-gray-900 hover:no-underline text-left py-3.5">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-500 pb-4">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {!showAllFaqs && RECURSOS_CONFIG.faqs.length > 5 && (
                    <button
                      onClick={() => setShowAllFaqs(true)}
                      className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ChevronDown size={14} />
                      Ver todas ({RECURSOS_CONFIG.faqs.length})
                    </button>
                  )}
                </div>
              )}

            </div>
            {/* end tabs container */}

          </div>
          {/* end main column */}

          {/* ── Sidebar (30%) ── */}
          <aside className="w-full lg:w-[300px] flex-shrink-0">
            <div className="lg:sticky lg:top-[72px] space-y-4">

              {/* Quick Actions */}
              <div className="bg-white/96 rounded-[16px] border border-white/15 shadow-lg p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Acções rápidas
                </p>
                <div className="space-y-2">
                  <a
                    href={RECURSOS_CONFIG.guiaPdfUrl}
                    download
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Download size={16} className="text-blue-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Descarregar Guia PDF</span>
                  </a>
                  <button
                    onClick={() => setActiveTab("Prompts")}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                      promptsAvailable
                        ? "bg-green-50 hover:bg-green-100 cursor-pointer"
                        : "bg-gray-50 cursor-default"
                    }`}
                  >
                    <BookOpen size={16} className={promptsAvailable ? "text-green-600 shrink-0" : "text-gray-300 shrink-0"} />
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Biblioteca de Prompts</span>
                      {!promptsAvailable && (
                        <span className="text-[11px] text-gray-400">A partir de 25 Fev</span>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Suporte */}
              <div className="bg-white/96 rounded-[16px] border border-white/15 shadow-lg p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                  Suporte
                </p>
                <p className="text-[12px] text-gray-400 mb-3">Resposta em 24–48h úteis.</p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://wa.me/351915015508?text=Preciso%20de%20ajuda%20com%20a%20minha%20%C3%A1rea%20de%20recursos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle size={14} style={{ color: "#25D366" }} />
                    WhatsApp
                  </a>
                  <a
                    href="mailto:frederico@digitalfc.pt?subject=Ajuda%20Recursos%20Imagens%20com%20IA"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <Mail size={14} className="text-gray-400" />
                    Email
                  </a>
                </div>
              </div>

              {/* Upsell */}
              <RecursosUpsell hasMasterclass={hasMasterclass} compact />

            </div>
          </aside>

        </div>
        {/* end 2-col */}

        {/* Bottom logout */}
        <div className="flex justify-center pt-10 pb-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <LogOut size={12} />
            Sair desta área
          </button>
        </div>

      </main>
    </div>
  );
}
