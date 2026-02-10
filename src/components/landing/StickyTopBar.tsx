import { motion } from "framer-motion";

export const StickyTopBar = () => {
  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-background border-b border-border"
    >
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <p className="text-[13px] text-ink-700 font-medium tracking-wide text-center sm:text-left">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle" />
          AO VIVO · QUARTA 18 FEV · 10H00 · GRATUITO
        </p>
        <a
          href="#inscrever"
          className="shrink-0 text-[13px] font-heading font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors"
        >
          Reservar lugar →
        </a>
      </div>
    </motion.div>
  );
};
