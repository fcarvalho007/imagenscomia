import { useState } from "react";
import { LegalModal } from "@/components/legal/LegalModal";
import { TermosContent } from "@/components/legal/TermosContent";
import { PrivacidadeContent } from "@/components/legal/PrivacidadeContent";

export const WebinarFooter = () => {
  const [openModal, setOpenModal] = useState<"termos" | "privacidade" | null>(null);

  return (
    <>
      <footer className="border-t border-border bg-white mt-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-ink-400">
            © 2026 Frederico Carvalho · DIGITALFC
          </p>
          <div className="flex gap-5 text-[13px] text-ink-400">
            <button onClick={() => setOpenModal("privacidade")} className="hover:text-ink-700 transition-colors">Privacidade</button>
            <button onClick={() => setOpenModal("termos")} className="hover:text-ink-700 transition-colors">Termos</button>
          </div>
        </div>
      </footer>

      <LegalModal open={openModal === "privacidade"} onOpenChange={(v) => !v && setOpenModal(null)} title="Política de Privacidade">
        <PrivacidadeContent />
      </LegalModal>
      <LegalModal open={openModal === "termos"} onOpenChange={(v) => !v && setOpenModal(null)} title="Termos e Condições">
        <TermosContent />
      </LegalModal>
    </>
  );
};
