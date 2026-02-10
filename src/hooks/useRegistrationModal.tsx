import { createContext, useContext, useState, ReactNode } from "react";

type ModalVariant = "free" | "premium";

interface ModalContextType {
  isOpen: boolean;
  variant: ModalVariant;
  open: (variant?: ModalVariant) => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  variant: "free",
  open: () => {},
  close: () => {},
});

export const useRegistrationModal = () => useContext(ModalContext);

export const RegistrationModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState<ModalVariant>("free");

  const open = (v: ModalVariant = "free") => {
    setVariant(v);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, variant, open, close }}>
      {children}
    </ModalContext.Provider>
  );
};
