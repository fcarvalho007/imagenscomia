import {
  Clock, LogOut,
  Mail, MessageCircle, Play, Headphones, FileText, Layers,
} from "lucide-react";

// ─── Configuração de conteúdo — actualizar após a masterclass ──────────────────
const MASTERCLASS_RECURSOS_CONFIG = {
  vimeoEmbedUrl: "",
  audioUrl: "",
  workbookUrl: "",
  chapters: [
    { label: "Capítulo 1", description: "Descrição em breve." },
    { label: "Capítulo 2", description: "Descrição em breve." },
    { label: "Capítulo 3", description: "Descrição em breve." },
  ],
};

interface UserData {
  email: string;
  token: string | null;
  plan: string | null;
  name: string | null;
}

interface Props {
  userData: UserData;
  onLogout: () => void;
}

export default function RecursosMasterclassConteudo({ userData, onLogout }: Props) {
  const firstName = userData.name?.split(" ")[0] || "amigo";
  const hasVideo = !!MASTERCLASS_RECURSOS_CONFIG.vimeoEmbedUrl;

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #F5F3FF 0%, #EDE9FE 100%)" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
              <Play size={10} fill="white" className="text-white ml-0.5" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Masterclass — Recursos</p>
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
          <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-widest mb-1">Área Reservada</p>
          <h1 className="font-bold text-[26px] sm:text-[30px] text-gray-900 leading-tight">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-gray-500 text-[15px] mt-1">Aqui estão os teus recursos da Masterclass Vídeo com IA.</p>
        </div>

        {/* 2-col grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Main column ── */}
          <div className="flex-1 min-w-0">

            {/* Player Vimeo */}
            {hasVideo ? (
              <div className="rounded-2xl overflow-hidden shadow-lg mb-4" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                <iframe
                  src={MASTERCLASS_RECURSOS_CONFIG.vimeoEmbedUrl}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  loading="lazy"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title="Masterclass — Vídeo com IA · Frederico Carvalho"
                />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-lg mb-4 bg-gray-900 flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                <div className="text-center text-white/60">
                  <Play size={40} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Gravação disponível em breve</p>
                  <p className="text-xs mt-1 opacity-60">A masterclass decorreu a 12 de Março</p>
                </div>
              </div>
            )}

            {/* Card: Índice */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5">

                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <Clock size={11} /> Índice da sessão
                </p>
                <ul className="space-y-3">
                  {MASTERCLASS_RECURSOS_CONFIG.chapters.map((ch, i) => (
                    <li
                      key={i}
                      className="flex gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-white">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{ch.label}</p>
                        <p className="text-[13px] leading-relaxed text-gray-500">{ch.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>

              </div>
            </div>

          </div>

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="lg:sticky lg:top-[72px] space-y-4">

              {/* Recursos */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recursos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">

                  {MASTERCLASS_RECURSOS_CONFIG.audioUrl && (
                    <a
                      href={MASTERCLASS_RECURSOS_CONFIG.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                        <Headphones size={14} className="text-violet-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 block">Áudio da Masterclass</span>
                        <span className="text-[11px] text-gray-500">MP3 · Google Drive</span>
                      </div>
                    </a>
                  )}

                  {MASTERCLASS_RECURSOS_CONFIG.workbookUrl && (
                    <a
                      href={MASTERCLASS_RECURSOS_CONFIG.workbookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 block">Workbook Masterclass</span>
                        <span className="text-[11px] text-gray-500">PDF · Google Drive</span>
                      </div>
                    </a>
                  )}

                  {!MASTERCLASS_RECURSOS_CONFIG.audioUrl && !MASTERCLASS_RECURSOS_CONFIG.workbookUrl && (
                    <p className="text-sm text-gray-400 italic p-3">Materiais disponíveis em breve.</p>
                  )}

                </div>
              </div>

              {/* Suporte */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Suporte</p>
                <p className="text-[12px] text-gray-400 mb-3">Resposta em 24–48h úteis.</p>
                <div className="flex gap-2">
                  <a
                    href="https://wa.me/351915015508?text=Preciso%20de%20ajuda%20com%20os%20recursos%20da%20Masterclass"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle size={13} style={{ color: "#25D366" }} />
                    WhatsApp
                  </a>
                  <a
                    href="mailto:frederico@digitalfc.pt?subject=Ajuda%20Recursos%20Masterclass"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <Mail size={13} className="text-gray-400" />
                    Email
                  </a>
                </div>
              </div>

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
