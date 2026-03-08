import { useState, useEffect, useCallback } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { User, Mail, Phone, Search } from "lucide-react";
import type { Inscrito } from "@/pages/crm/mockData";
import { genderEmoji } from "@/lib/genderDetection";
import WebinarBadge from "./WebinarBadge";

const PLAN_LABEL: Record<string, string> = {
  free: "Gratuito",
  premium: "Premium",
  masterclass: "MC",
  bundle: "Bundle",
};

interface CRMCommandPaletteProps {
  inscritos: Inscrito[];
  onSelectInscrito: (i: Inscrito) => void;
}

export default function CRMCommandPalette({ inscritos, onSelectInscrito }: CRMCommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const active = inscritos.filter((i) => i.status === "activo");

  const handleSelect = useCallback(
    (id: string) => {
      const inscrito = inscritos.find((i) => i.id === id);
      if (inscrito) {
        onSelectInscrito(inscrito);
        setOpen(false);
      }
    },
    [inscritos, onSelectInscrito]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Pesquisar inscrito por nome, email ou telefone..." />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>Nenhum inscrito encontrado.</CommandEmpty>
          <CommandGroup heading={`${active.length} inscritos activos`}>
            {active.slice(0, 50).map((i) => (
              <CommandItem
                key={i.id}
                value={`${i.nome} ${i.email} ${i.whatsapp}`}
                onSelect={() => handleSelect(i.id)}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ background: "hsl(var(--surface))", color: "hsl(var(--ink-600))" }}>
                  {i.primeiro_nome?.[0]?.toUpperCase() || i.nome[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold truncate">{genderEmoji(i.gender)} {i.nome}</span>
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0" style={{
                      background: i.paid_at ? "rgba(22,163,74,0.1)" : "hsl(var(--surface))",
                      color: i.paid_at ? "#16a34a" : "hsl(var(--ink-400))",
                    }}>
                      {i.paid_at ? `✅ €${i.valor}` : PLAN_LABEL[i.plan] || i.plan}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-muted-foreground truncate">{i.email}</span>
                    {i.whatsapp && <span className="text-[11px] text-muted-foreground">{i.whatsapp}</span>}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <div className="border-t px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">⌘K</kbd>
          <span>para abrir · </span>
          <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">↑↓</kbd>
          <span>para navegar · </span>
          <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">↵</kbd>
          <span>para abrir ficha</span>
        </div>
      </Command>
    </CommandDialog>
  );
}
