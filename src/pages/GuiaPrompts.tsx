import { usePageMeta } from "@/hooks/usePageMeta";

export default function GuiaPrompts() {
  usePageMeta({
    title: "Guia de Prompts para Vídeo com IA",
    description: "Guia interactivo de prompts para criar vídeo profissional com inteligência artificial.",
    ogTitle: "Guia de Prompts para Vídeo com IA",
    ogUrl: "https://imagenscomia.com/guia-prompts",
  });

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-6">
      <iframe
        src="https://guiapromptsvideo.manus.space"
        width="100%"
        height="800"
        style={{
          border: "none",
          borderRadius: "8px",
          maxWidth: "1200px",
          display: "block",
          margin: "0 auto",
        }}
        loading="lazy"
        allow="clipboard-write"
        title="Guia de Prompts para Vídeo com IA"
      />
    </div>
  );
}
