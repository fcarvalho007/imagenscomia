import { motion } from "framer-motion";

export const StickyTopBar = () => {
  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-secondary-dark border-b border-white/[0.06]"
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <p className="text-xs sm:text-sm text-text-muted font-heading font-semibold tracking-wide truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-urgency animate-pulse mr-2 align-middle" />
          <span className="hidden sm:inline">AO VIVO · QUARTA 18 FEV · 10H00 · GRATUITO</span>
          <span className="sm:hidden">🔴 18 FEV · 10H · GRATUITO</span>
        </p>
        <a
          href="#inscrever"
          className="shrink-0 text-xs font-heading font-bold text-cta-free hover:text-cta-free-hover transition-colors"
        >
          RESERVAR AGORA →
        </a>
      </div>
    </motion.div>
  );
};
