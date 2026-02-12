import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

const CountdownBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="bg-white/20 rounded px-2 py-1 font-heading font-bold text-[16px] max-sm:text-[14px] text-white min-w-[34px] max-sm:min-w-[28px] text-center">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[10px] text-white/70 mt-0.5">{label}</span>
  </div>
);

export const StickyTopBar = () => {
  const { days, hours, minutes, seconds } = useCountdown(new Date("2026-02-18T10:00:00"));
  const { open } = useRegistrationModal();

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-ink-900 via-[hsl(262,83%,58%)]/20 to-blue-700"
    >
      <div className="container mx-auto px-4 py-2.5 max-sm:py-2 flex items-center justify-between gap-3 max-sm:gap-2">
        <p className="hidden sm:block text-[13px] text-white/90 font-medium tracking-wide">
          AO VIVO · 18 FEV · 10H00
        </p>

        <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
          <CountdownBlock value={days} label="dias" />
          <span className="text-white/60 font-bold text-sm">:</span>
          <CountdownBlock value={hours} label="horas" />
          <span className="text-white/60 font-bold text-sm">:</span>
          <CountdownBlock value={minutes} label="min" />
          <span className="text-white/60 font-bold text-sm">:</span>
          <CountdownBlock value={seconds} label="seg" />
        </div>

        <button
          onClick={() => open()}
          className="shrink-0 text-[13px] font-heading font-semibold text-white bg-green-600 hover:bg-green-700 px-5 max-sm:px-3 py-2.5 rounded-full transition-all shadow-[0_4px_14px_0_rgba(22,163,74,0.35)]"
        >
          Quero inscrever-me!
        </button>
      </div>
    </motion.div>
  );
};
