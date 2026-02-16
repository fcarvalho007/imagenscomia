import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceSectionProps {
  registrationId: string;
}

export default function InvoiceSection({ registrationId }: InvoiceSectionProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: inv } = await supabase
        .from("invoice_details" as any)
        .select("*")
        .eq("registration_id", registrationId)
        .maybeSingle();
      setData(inv);
      setLoading(false);
    })();
  }, [registrationId]);

  const handleCopy = () => {
    if (!data) return;
    const text = `Nome/Empresa: ${data.invoice_name}\nNIF: ${data.invoice_vat}\nMorada: ${data.invoice_address}\nCP: ${data.invoice_zip} ${data.invoice_city}\nEmail fatura: ${data.invoice_email}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return null;

  const hasData = !!data;

  return (
    <>
      <hr className="border-border my-6" />
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-heading font-bold text-[14px] text-foreground">Faturação</h3>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            hasData ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {hasData ? "Completo" : "Em falta"}
        </span>
      </div>
      {!hasData ? (
        <p className="text-[13px] text-muted-foreground">Sem dados de faturação</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: "Nome/Empresa", value: data.invoice_name },
              { label: "NIF", value: data.invoice_vat },
              { label: "Morada", value: data.invoice_address },
              { label: "Código Postal", value: data.invoice_zip },
              { label: "Localidade", value: data.invoice_city },
              { label: "Email fatura", value: data.invoice_email },
            ].map((f) => (
              <div key={f.label}>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{f.label}</span>
                <p className="text-[13px] text-foreground font-medium">{f.value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copiar dados de faturação"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copiado!" : "Copiar dados faturação"}
          </button>
        </>
      )}
    </>
  );
}
