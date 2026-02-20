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
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  variant: "free",
  open: () => {},
  close: () => {},
  referredBy: null,
  redirectPath: "/upgrade",
});

export const useRegistrationModal = () => useContext(ModalContext);

export const RegistrationModalProvider = ({ children, redirectPath = "/upgrade" }: { children: ReactNode; redirectPath?: string }) => {
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
    <ModalContext.Provider value={{ isOpen, variant, open, close, referredBy, redirectPath }}>
      {children}
    </ModalContext.Provider>
  );
};
