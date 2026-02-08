import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToForm = () => {
    document.getElementById("cta-final")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-lg border-t border-border shadow-[0_-4px_15px_rgba(0,0,0,0.1)] p-3"
        >
          <button
            onClick={scrollToForm}
            className="w-full gradient-cta text-white font-bold py-3 rounded-xl text-sm"
          >
            RESERVAR LUGAR GRATUITO
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
