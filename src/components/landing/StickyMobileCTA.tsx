import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

export const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);
  const { open } = useRegistrationModal();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-lg border-t border-border p-3"
        >
          <button
            onClick={open}
            className="w-full gradient-cta text-primary-foreground font-bold py-3 rounded-xl text-sm neon-glow"
          >
            RESERVAR LUGAR GRATUITO
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
