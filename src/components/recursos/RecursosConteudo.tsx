import { useState } from "react";
import {
  Clock, LogOut,
  Mail, MessageCircle, Play, Headphones, FileText, Layers, BookOpen,
} from "lucide-react";
import RecursosUpsell from "./RecursosUpsell";

// ─── Configuração de conteúdo ────────────────────────────────────────────────
const RECURSOS_CONFIG = {
  resumoPdfUrl: "https://drive.google.com/file/d/1sZj7k-Jtvzh5gX6jkWGHCiY4C-IEE88Q/view?usp=sharing",
  audioUrl: "https://drive.google.com/file/d/1EhFXTgoiw82iNWBpuEI56amU1JwjKT_h/view?usp=sharing",
  sopPromptsUrl: "https://drive.google.com/file/d/1Y7OAI7grYS90GIGQ8sy0rj9_Jff8YpCr/view?usp=sharing",
  whiskUrl: "https://drive.google.com/file/d/1OEOOp_2Jr6mQGxkGDDM56vZPXiTCbbhF/view?usp=sharing",
  chapters: [
    { time: "00:00", label: "Introdução e estado da arte" },
    { time: "08:30", label: "Método: do briefing à imagem" },
    { time: "24:00", label: "Demos ao vivo com ferramentas" },
    { time: "48:00", label: "Q&A e casos práticos" },
  ],
};

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
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const firstName = userData.name?.split(" ")[0] || "amigo";
  const hasMasterclass = ["masterclass", "bundle"].includes(userData.plan ?? "");

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

            {/* Player Vimeo — Webinar 18 Fev */}
            <div className="rounded-2xl overflow-hidden shadow-lg mb-4" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://player.vimeo.com/video/1166335264?badge=0&autopause=0&player_id=0&app_id=58479"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                title="Webinar Gratuito — IA Imagens · 18 Fev · Frederico Carvalho"
              />
            </div>

            {/* Single card: Índice + Apoio ao conhecimento */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5">

                {/* Índice da sessão */}
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <Clock size={11} /> Índice da sessão
                </p>
                <ul className="space-y-1 mb-6">
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

                {/* Divider */}
                <div className="border-t border-gray-100 mb-5" />

                {/* Apoio ao conhecimento */}
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <BookOpen size={11} /> Apoio ao conhecimento
                </p>

                <div className="space-y-2.5">
                  {/* Guia de Apoio Nano Banana Pro */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 opacity-60 cursor-not-allowed select-none">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-600 block">Guia de Apoio Nano Banana Pro</span>
                      <span className="text-[11px] text-gray-400">32 páginas</span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full shrink-0">
                      Em breve
                    </span>
                  </div>

                  {/* Guia de Prompts */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 opacity-60 cursor-not-allowed select-none">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-600 block">Guia de Prompts</span>
                      <span className="text-[11px] text-gray-400">Disponível a 25 de Fevereiro</span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                      25 Fev
                    </span>
                  </div>
                </div>

              </div>
            </div>
            {/* end card */}

          </div>
          {/* end main column */}

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="lg:sticky lg:top-[72px] space-y-4">

              {/* Recursos */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recursos</p>
                <div className="space-y-2">

                  {/* Resumo PDF */}
                  <a
                    href={RECURSOS_CONFIG.resumoPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Resumo da sessão</span>
                      <span className="text-[11px] text-gray-500">PDF · Abrir</span>
                    </div>
                  </a>

                  {/* Áudio */}
                  <a
                    href={RECURSOS_CONFIG.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Headphones size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Áudio em Bruto do Webinar</span>
                      <span className="text-[11px] text-gray-500">MP3 · Não editado · Abrir</span>
                    </div>
                  </a>

                  {/* SOP de Prompts */}
                  <a
                    href={RECURSOS_CONFIG.sopPromptsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-violet-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">SOP de Prompts</span>
                      <span className="text-[11px] text-gray-500">Criação de Projecto · Abrir</span>
                    </div>
                  </a>

                  {/* WHISK */}
                  <a
                    href={RECURSOS_CONFIG.whiskUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 border border-green-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <Layers size={14} className="text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Exercício Google WHISK</span>
                      <span className="text-[11px] text-gray-500">1 Prompt, Vários Resultados · Abrir</span>
                    </div>
                  </a>

                </div>
              </div>

              {/* Suporte */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Suporte</p>
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

              {/* Masterclass / Upsell */}
              <RecursosUpsell hasMasterclass={hasMasterclass} compact />

            </div>
          </aside>

        </div>

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
