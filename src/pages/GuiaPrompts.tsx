import { usePageMeta } from "@/hooks/usePageMeta";

export default function GuiaPrompts() {
  usePageMeta({
    title: "Guia de Prompts para Vídeo com IA",
    description: "Guia interactivo de prompts para criar vídeo profissional com inteligência artificial.",
    ogTitle: "Guia de Prompts para Vídeo com IA",
    ogUrl: "https://imagenscomia.com/guia-prompts",
  });

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">
      <iframe
        src="https://guiapromptsvideo.manus.space"
        className="flex-1 w-full"
        style={{ border: "none" }}
        loading="lazy"
        allow="clipboard-write"
        title="Guia de Prompts para Vídeo com IA"
      />
    </div>
  );
}
