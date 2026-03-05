import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { InvoiceForm } from "@/components/upgrade/InvoiceForm";
import { Check } from "lucide-react";

export default function Fatura() {
  const [params] = useSearchParams();
  const rid = params.get("rid") || "";
  const token = params.get("t") || "";
  const [valid, setValid] = useState(false);

  if (!rid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <p className="text-muted-foreground text-sm">Link inválido. Verifica o email que recebeste.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-xl font-bold text-foreground mb-1">Dados de faturação</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Preenche os dados abaixo para podermos emitir a tua fatura.
        </p>
        <InvoiceForm
          userEmail=""
          registrationId={rid}
          editToken={token}
          onValidChange={setValid}
        />
        {valid && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            Dados guardados com sucesso. Podes fechar esta página.
          </div>
        )}
      </div>
    </div>
  );
}
