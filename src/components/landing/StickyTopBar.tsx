import { motion } from "framer-motion";

export const StickyTopBar = () => {
  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-ink-900 to-blue-700"
    >
      <div className="container mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <p className="text-[13px] text-white/90 font-medium tracking-wide text-center sm:text-left">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle animate-pulse" />
          AO VIVO · QUARTA 18 FEV · 10H00 · GRATUITO
        </p>
        <a
          href="#form-gratis"
          className="shrink-0 text-[13px] font-heading font-semibold text-blue-600 bg-white hover:bg-blue-50 px-5 py-2.5 rounded-full transition-colors"
        >
          Reservar lugar →
        </a>
      </div>
    </motion.div>
  );
};
