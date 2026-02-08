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
      whileHover={{ y: -3, boxShadow: "0 0 30px hsl(190 100% 50% / 0.5), 0 0 60px hsl(190 100% 50% / 0.2)" }}
      whileTap={{ scale: 0.97 }}
      onClick={open}
      className={`gradient-cta text-primary-foreground font-bold rounded-xl animate-pulse-glow transition-all ${
        size === "large" ? "text-lg px-12 py-5" : "text-sm px-8 py-3"
      } ${className}`}
    >
      {label}
    </motion.button>
  );
};
