import { motion } from "framer-motion";
import { useRegistrationModal } from "@/hooks/useRegistrationModal";

interface CTAButtonProps {
  label?: string;
  className?: string;
  size?: "default" | "large";
}

export const CTAButton = ({ label = "RESERVAR LUGAR GRATUITO", className = "", size = "default" }: CTAButtonProps) => {
  const { open } = useRegistrationModal();

  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: "0 0 20px hsl(320 80% 60% / 0.35), 0 0 50px hsl(320 80% 60% / 0.12)" }}
      whileTap={{ scale: 0.97 }}
      onClick={open}
      className={`gradient-cta text-primary-foreground font-bold rounded-xl animate-pulse-glow transition-all ${
        size === "large" ? "text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5" : "text-sm px-6 sm:px-8 py-3"
      } ${className}`}
    >
      {label}
    </motion.button>
  );
};
