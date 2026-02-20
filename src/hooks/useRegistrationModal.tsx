import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

type ModalVariant = "free" | "premium";

interface ModalContextType {
  isOpen: boolean;
  variant: ModalVariant;
  open: (variant?: ModalVariant) => void;
  close: () => void;
  referredBy: string | null;
  redirectPath: string;
  subtitle: string;
  webinar: "imagens" | "video";
}

const DEFAULT_SUBTITLE = "Terça-feira, 10 de Março, 10h";

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  variant: "free",
  open: () => {},
  close: () => {},
  referredBy: null,
  redirectPath: "/upgrade",
  subtitle: DEFAULT_SUBTITLE,
  webinar: "imagens",
});

export const useRegistrationModal = () => useContext(ModalContext);

export const RegistrationModalProvider = ({ children, redirectPath = "/upgrade", subtitle = DEFAULT_SUBTITLE, webinar = "imagens" as "imagens" | "video" }: { children: ReactNode; redirectPath?: string; subtitle?: string; webinar?: "imagens" | "video" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState<ModalVariant>("free");
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferredBy(ref);
  }, [searchParams]);

  const open = (v: ModalVariant = "free") => {
    setVariant(v);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, variant, open, close, referredBy, redirectPath, subtitle, webinar }}>
      {children}
    </ModalContext.Provider>
  );
};
