import { Download, ExternalLink, BookOpen, Clock, CheckSquare, HelpCircle, Lock, LogOut, Play, Mail, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RecursosUpsell from "./RecursosUpsell";

// ─── Configuração de conteúdo ────────────────────────────────────────────────
const RECURSOS_CONFIG = {
  vimeoUrl: "https://vimeo.com/1065826099",
  vimeoEmbed: `<iframe src="https://player.vimeo.com/video/1065826099?h=0&autoplay=0&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
  guiaPdfUrl: "/guia-essencial-seo.png", // substituir por URL do PDF real
  promptsUrl: "", // preencher quando disponível
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

export default function RecursosConteudo({ userData, onLogout }: RecursosConteudoProps) {
  const firstName = userData.name?.split(" ")[0] || "amigo";
  const hasMasterclass = ["masterclass", "bundle"].includes(userData.plan ?? "");
  const promptsAvailable = new Date() >= RECURSOS_CONFIG.promptsAvailableDate;

  return (
    <div className="min-h-screen bg-[hsl(var(--off-white))]">
      {/* Header bar */}
      <header className="bg-[hsl(var(--white))] border-b border-[hsl(var(--border))] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <p className="text-sm font-semibold text-[hsl(var(--ink-900))]">
            Imagens com IA — Recursos
          </p>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-[hsl(var(--ink-400))] hover:text-[hsl(var(--ink-700))] transition-colors"
          >
            <LogOut size={13} />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-12">

        {/* ── CAMADA A — Boas-vindas + cartões ── */}
        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[hsl(var(--ink-900))]">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-[hsl(var(--ink-500))] mt-1">
              Aqui estão os teus recursos do webinar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Gravação */}
            <div className="bg-[hsl(var(--white))] rounded-xl border border-[hsl(var(--border))] p-4">
              <div className="w-9 h-9 bg-[hsl(var(--blue-50))] rounded-lg flex items-center justify-center mb-3">
                <Play size={18} className="text-[hsl(var(--blue-600))]" />
              </div>
              <p className="text-sm font-semibold text-[hsl(var(--ink-900))]">Gravação HD</p>
              <Badge className="mt-2 text-[10px] bg-[hsl(var(--green-50))] text-[hsl(var(--green-700))] border-[hsl(var(--green-100))] hover:bg-[hsl(var(--green-50))]">
                Disponível
              </Badge>
            </div>

            {/* Guia PDF */}
            <div className="bg-[hsl(var(--white))] rounded-xl border border-[hsl(var(--border))] p-4">
              <div className="w-9 h-9 bg-[hsl(var(--green-50))] rounded-lg flex items-center justify-center mb-3">
                <Download size={18} className="text-[hsl(var(--green-600))]" />
              </div>
              <p className="text-sm font-semibold text-[hsl(var(--ink-900))]">Guia PDF</p>
              <Badge className="mt-2 text-[10px] bg-[hsl(var(--green-50))] text-[hsl(var(--green-700))] border-[hsl(var(--green-100))] hover:bg-[hsl(var(--green-50))]">
                Disponível
              </Badge>
            </div>

            {/* Prompts */}
            <div className={`bg-[hsl(var(--white))] rounded-xl border border-[hsl(var(--border))] p-4 ${!promptsAvailable ? "opacity-70" : ""}`}>
              <div className="w-9 h-9 bg-[hsl(var(--amber-50))] rounded-lg flex items-center justify-center mb-3">
                {promptsAvailable
                  ? <BookOpen size={18} className="text-[hsl(var(--amber-600))]" />
                  : <Lock size={18} className="text-[hsl(var(--amber-600))]" />
                }
              </div>
              <p className="text-sm font-semibold text-[hsl(var(--ink-900))]">Biblioteca de Prompts</p>
              {promptsAvailable ? (
                <Badge className="mt-2 text-[10px] bg-[hsl(var(--green-50))] text-[hsl(var(--green-700))] border-[hsl(var(--green-100))] hover:bg-[hsl(var(--green-50))]">
                  Disponível
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-2 text-[10px]">
                  A partir de 25 Fev
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* ── CAMADA B — Recursos principais ── */}

        {/* Começar aqui */}
        <section>
          <h2 className="text-base font-bold text-[hsl(var(--ink-900))] mb-3 flex items-center gap-2">
            <CheckSquare size={16} className="text-[hsl(var(--blue-600))]" />
            Começar aqui
          </h2>
          <ol className="space-y-2">
            {[
              "Ver a gravação",
              "Descarregar o guia de apoio",
              "Copiar os prompts e testar",
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[hsl(var(--ink-700))]">
                <span className="w-6 h-6 rounded-full bg-[hsl(var(--blue-50))] border border-[hsl(var(--blue-100))] flex items-center justify-center text-[11px] font-bold text-[hsl(var(--blue-600))] shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* Gravação */}
        <section>
          <h2 className="text-lg font-bold text-[hsl(var(--ink-900))] mb-4">
            🎬 Gravação do Webinar
          </h2>
          {/* Vimeo embed */}
          <div className="relative w-full rounded-xl overflow-hidden bg-[hsl(var(--ink-900))]" style={{ paddingTop: "56.25%" }}>
            {RECURSOS_CONFIG.vimeoEmbed ? (
              <div dangerouslySetInnerHTML={{ __html: RECURSOS_CONFIG.vimeoEmbed }} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Play size={40} className="text-[hsl(var(--white)/0.4)]" />
                <p className="text-[hsl(var(--white)/0.5)] text-sm">Gravação a ser processada…</p>
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <a
              href={RECURSOS_CONFIG.vimeoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--ink-400))] hover:text-[hsl(var(--blue-600))] transition-colors"
            >
              <ExternalLink size={12} />
              Abrir no Vimeo
            </a>
          </div>

          {/* Capítulos */}
          <div className="mt-4 bg-[hsl(var(--white))] border border-[hsl(var(--border))] rounded-xl p-4">
            <p className="text-xs font-semibold text-[hsl(var(--ink-400))] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={12} />
              Índice da sessão
            </p>
            <ol className="space-y-2">
              {RECURSOS_CONFIG.chapters.map((ch, i) => (
                <li key={i} className="flex items-baseline gap-3 text-sm">
                  <span className="font-mono text-[hsl(var(--ink-400))] text-xs w-12 shrink-0">{ch.time}</span>
                  <span className="text-[hsl(var(--ink-700))]">{ch.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Guia de apoio */}
        <section>
          <h2 className="text-lg font-bold text-[hsl(var(--ink-900))] mb-4">
            📄 Guia de Apoio
          </h2>
          <div className="bg-[hsl(var(--white))] border border-[hsl(var(--border))] rounded-xl p-5">
            <p className="text-sm text-[hsl(var(--ink-500))] mb-4">
              Guia completo com os conceitos, ferramentas e boas práticas abordadas no webinar.
            </p>
            <a href={RECURSOS_CONFIG.guiaPdfUrl} download>
              <Button variant="outline" className="gap-2 mb-5">
                <Download size={14} />
                Descarregar Guia PDF
              </Button>
            </a>

            {/* Checklist accordion */}
            <div className="border-t border-[hsl(var(--border))] pt-4">
              <p className="text-xs font-semibold text-[hsl(var(--ink-400))] uppercase tracking-wider mb-3">
                Checklist rápida
              </p>
              <Accordion type="single" collapsible className="space-y-0">
                <AccordionItem value="setup">
                  <AccordionTrigger className="text-sm text-[hsl(var(--ink-700))] hover:no-underline py-3">
                    Setup inicial — criar conta nas ferramentas certas
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[hsl(var(--ink-500))] pb-3">
                    Cria conta gratuita em: <strong>Adobe Firefly</strong> (para texto em imagens), <strong>Freepik</strong> (para fotorrealismo), e <strong>ChatGPT/Claude</strong> (para escrever prompts). Começa pelo Freepik — tem o melhor plano gratuito.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="erros">
                  <AccordionTrigger className="text-sm text-[hsl(var(--ink-700))] hover:no-underline py-3">
                    Erros comuns e como evitá-los
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[hsl(var(--ink-500))] pb-3">
                    1. Prompt demasiado vago → sê específico: estilo, luz, ângulo, mood. 2. Texto com erros → usa Adobe Firefly. 3. Resultados inconsistentes → guarda os prompts que funcionam e itera sobre eles.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="boas-praticas">
                  <AccordionTrigger className="text-sm text-[hsl(var(--ink-700))] hover:no-underline py-3">
                    Boas práticas de prompt em português
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[hsl(var(--ink-500))] pb-3">
                    Escreve os prompts em inglês para melhores resultados. Usa a estrutura: <em>sujeito + ambiente + estilo + iluminação + câmera</em>. Exemplo: "professional woman in a modern Lisbon café, natural window light, editorial photography, Canon 85mm f/1.4".
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Biblioteca de prompts */}
        <section>
          <h2 className="text-lg font-bold text-[hsl(var(--ink-900))] mb-4">
            📚 Biblioteca de Prompts
          </h2>
          <div className="bg-[hsl(var(--white))] border border-[hsl(var(--border))] rounded-xl p-5">
            {promptsAvailable && RECURSOS_CONFIG.promptsUrl ? (
              <>
                <p className="text-sm text-[hsl(var(--ink-500))] mb-4">
                  Biblioteca completa de prompts prontos a usar, organizados por categoria.
                </p>
                <a href={RECURSOS_CONFIG.promptsUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <Download size={14} />
                    Descarregar Prompts
                  </Button>
                </a>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                <div className="w-10 h-10 bg-[hsl(var(--amber-50))] rounded-full flex items-center justify-center">
                  <Lock size={18} className="text-[hsl(var(--amber-600))]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--ink-900))]">Disponível a partir de 25 de Fevereiro</p>
                  <p className="text-xs text-[hsl(var(--ink-400))] mt-1">
                    Receberás um email assim que estiver pronto.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-bold text-[hsl(var(--ink-900))] mb-4 flex items-center gap-2">
            <HelpCircle size={18} className="text-[hsl(var(--ink-400))]" />
            Perguntas frequentes
          </h2>
          <div className="bg-[hsl(var(--white))] border border-[hsl(var(--border))] rounded-xl px-5">
            <Accordion type="single" collapsible>
              {RECURSOS_CONFIG.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm font-medium text-[hsl(var(--ink-900))] hover:no-underline text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[hsl(var(--ink-500))] pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── CAMADA C — Upsell ── */}
        <section>
          <div className="border-t border-[hsl(var(--border))] pt-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-[hsl(var(--ink-400))] mb-4 text-center">
              Quer ir mais longe?
            </p>
            <RecursosUpsell hasMasterclass={hasMasterclass} />
          </div>
        </section>

        {/* ── Suporte ── */}
        <section>
          <div className="border-t border-[hsl(var(--border))] pt-8">
            <h2 className="text-base font-bold text-[hsl(var(--ink-900))] mb-1">Precisa de ajuda?</h2>
            <p className="text-sm text-[hsl(var(--ink-400))] mb-5">
              Se tiveres dificuldades no acesso ou nos links, contacta o suporte.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/351915015508?text=Preciso%20de%20ajuda%20com%20a%20minha%20%C3%A1rea%20de%20recursos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-[14px] transition-colors"
                style={{
                  background: "rgba(37,211,102,0.10)",
                  border: "1px solid rgba(37,211,102,0.30)",
                  color: "#16a34a",
                }}
              >
                <MessageCircle size={16} style={{ color: "#25D366" }} />
                WhatsApp
              </a>
              <a
                href="mailto:frederico@digitalfc.pt?subject=Ajuda%20Recursos%20Imagens%20com%20IA"
                className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-[14px] transition-colors bg-[hsl(var(--white))] border border-[hsl(var(--border))] text-[hsl(var(--ink-700))] hover:bg-[hsl(var(--off-white))]"
              >
                <Mail size={16} className="text-[hsl(var(--ink-400))]" />
                Email
              </a>
            </div>
          </div>
        </section>

        {/* Sair (bottom) */}
        <div className="flex justify-center pb-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-[hsl(var(--ink-300))] hover:text-[hsl(var(--ink-500))] transition-colors"
          >
            <LogOut size={12} />
            Sair desta área
          </button>
        </div>

      </main>
    </div>
  );
}
