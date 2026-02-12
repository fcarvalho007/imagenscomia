import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export const LegalModal = ({ open, onOpenChange, title, children }: LegalModalProps) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[200] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-[#060D1A] border border-white/10 p-6 sm:p-8 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <DialogPrimitive.Title className="font-heading text-xl sm:text-2xl font-bold text-white">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all">
            <X className="w-4 h-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-2 text-[15px] leading-relaxed text-white/80 space-y-6 scrollbar-thin">
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);
