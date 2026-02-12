import { useState } from "react";
import { LegalModal } from "@/components/legal/LegalModal";
import { TermosContent } from "@/components/legal/TermosContent";
import { PrivacidadeContent } from "@/components/legal/PrivacidadeContent";

export const FooterSection = () => {
  const [openModal, setOpenModal] = useState<"termos" | "privacidade" | null>(null);

  return (
    <>
      <footer className="py-6 bg-[#060D1A] border-t border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-[14px] text-white/30 mb-3">
            <button onClick={() => setOpenModal("privacidade")} className="hover:text-white/60 transition-colors">Privacidade</button>
            <button onClick={() => setOpenModal("termos")} className="hover:text-white/60 transition-colors">Termos</button>
            <a href="#" className="hover:text-white/60 transition-colors">Contacto</a>
            <a href="/convites" className="hover:text-white/60 transition-colors">Ver os teus convites</a>
            <a href="/crm" className="hover:text-white/60 transition-colors">crm</a>
          </div>
          <p className="text-[14px] text-white/30">
            © 2025 Frederico Carvalho · DIGITALFC
          </p>
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
