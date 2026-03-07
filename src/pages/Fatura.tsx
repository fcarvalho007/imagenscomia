import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { InvoiceForm } from "@/components/upgrade/InvoiceForm";
import { Check, FileText, Mail } from "lucide-react";
import { WhatsAppSupportButton } from "@/components/landing/WhatsAppSupportButton";

export default function Fatura() {
  const [params] = useSearchParams();
  const rid = params.get("rid") || "";
  const token = params.get("t") || "";
  const [valid, setValid] = useState(false);

  if (!rid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Dados de faturação</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Esta página serve para preencheres os dados necessários para a emissão da tua fatura.
          </p>
          <div className="flex items-start gap-2 text-left bg-muted/50 rounded-lg p-4">
            <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Acede através do <strong className="text-foreground">link enviado por email</strong>. Se não o encontras, verifica a pasta de spam ou contacta-nos pelo WhatsApp.
            </p>
          </div>
        </div>
        <WhatsAppSupportButton />
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
      <WhatsAppSupportButton />
    </div>
  );
}
