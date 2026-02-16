import { useState, useEffect, useCallback, useRef } from "react";
import { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const invoiceSchema = z.object({
  invoice_name: z.string().trim().min(2, "Indicar nome ou empresa."),
  invoice_vat: z.string().regex(/^\d{9}$/, "NIF inválido. Deve ter 9 dígitos."),
  invoice_address: z.string().trim().min(5, "Indicar morada completa."),
  invoice_zip: z.string().regex(/^\d{4}-\d{3}$/, "Código postal inválido. Ex.: 1100-420"),
  invoice_city: z.string().trim().min(2, "Indicar localidade."),
  invoice_email: z.string().email("Email inválido."),
});

export type InvoiceData = z.infer<typeof invoiceSchema>;

interface Props {
  userEmail: string;
  onValidChange: (valid: boolean) => void;
  onUpsertFinal: () => Promise<void>;
}

export function InvoiceForm({ userEmail, onValidChange, onUpsertFinal }: Props) {
  const [form, setForm] = useState<InvoiceData>({
    invoice_name: "",
    invoice_vat: "",
    invoice_address: "",
    invoice_zip: "",
    invoice_city: "",
    invoice_email: userEmail || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InvoiceData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof InvoiceData, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [regId, setRegId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lookup registration_id + pre-fill
  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      const { data: reg } = await supabase
        .from("registrations")
        .select("id")
        .eq("email", userEmail)
        .maybeSingle();
      if (!reg) return;
      setRegId(reg.id);

      const { data: inv } = await supabase
        .from("invoice_details" as any)
        .select("*")
        .eq("registration_id", reg.id)
        .maybeSingle();
      if (inv) {
        const d = inv as any;
        setForm({
          invoice_name: d.invoice_name || "",
          invoice_vat: d.invoice_vat || "",
          invoice_address: d.invoice_address || "",
          invoice_zip: d.invoice_zip || "",
          invoice_city: d.invoice_city || "",
          invoice_email: d.invoice_email || userEmail,
        });
      }
    })();
  }, [userEmail]);

  // Validate on form change
  useEffect(() => {
    const result = invoiceSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      onValidChange(true);
    } else {
      const errs: Partial<Record<keyof InvoiceData, string>> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as keyof InvoiceData;
        if (!errs[key]) errs[key] = i.message;
      });
      setErrors(errs);
      onValidChange(false);
    }
  }, [form, onValidChange]);

  // Autosave debounce
  const doSave = useCallback(async (data: InvoiceData) => {
    if (!regId) return;
    const result = invoiceSchema.safeParse(data);
    if (!result.success) return;
    setSaving(true);
    try {
      await supabase.from("invoice_details" as any).upsert({
        registration_id: regId,
        ...result.data,
        updated_at: new Date().toISOString(),
      } as any);
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }, [regId]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSave(form), 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form, doSave]);

  // Expose upsert for parent
  useEffect(() => {
    // Store final upsert fn on the parent's callback ref
    (onUpsertFinal as any).__invoiceUpsert = async () => {
      if (!regId) return;
      const result = invoiceSchema.safeParse(form);
      if (!result.success) return;
      await supabase.from("invoice_details" as any).upsert({
        registration_id: regId,
        ...result.data,
        updated_at: new Date().toISOString(),
      } as any);
    };
  }, [form, regId, onUpsertFinal]);

  const handleChange = (key: keyof InvoiceData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const handleBlur = (key: keyof InvoiceData) => {
    setTouched((t) => ({ ...t, [key]: true }));
    if (key === "invoice_vat") {
      setForm((f) => ({ ...f, invoice_vat: f.invoice_vat.replace(/\D/g, "") }));
    }
    if (key === "invoice_zip") {
      setForm((f) => {
        const digits = f.invoice_zip.replace(/\D/g, "");
        if (digits.length === 7) return { ...f, invoice_zip: `${digits.slice(0, 4)}-${digits.slice(4)}` };
        return f;
      });
    }
  };

  const field = (key: keyof InvoiceData, label: string, placeholder: string, helpText?: string) => (
    <div>
      <label className="block text-[13px] font-medium text-ink-700 mb-1">{label}</label>
      <input
        type={key === "invoice_email" ? "email" : "text"}
        value={form[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        onBlur={() => handleBlur(key)}
        placeholder={placeholder}
        className={`w-full bg-white border ${touched[key] && errors[key] ? "border-red-400" : "border-border"} h-10 px-3 rounded-lg text-ink-900 placeholder:text-ink-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-[14px]`}
      />
      {helpText && !errors[key] && <p className="text-[11px] text-ink-400 mt-0.5">{helpText}</p>}
      {touched[key] && errors[key] && <p className="text-[12px] text-red-500 mt-0.5">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="border border-border rounded-xl p-5 mb-5 bg-surface">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading font-bold text-[16px] text-ink-900">
          Dados para fatura <span className="text-[12px] font-medium text-red-500 ml-1">(obrigatório)</span>
        </h3>
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-300" />}
        {saved && !saving && (
          <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium animate-in fade-in">
            <Check className="w-3 h-3" /> Guardado
          </span>
        )}
      </div>
      <p className="text-[13px] text-ink-400 mb-4">Preencher antes de confirmar o pagamento.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field("invoice_name", "Nome / Empresa", "Ex.: Maria Silva ou Silva & Co, Lda")}
        {field("invoice_vat", "NIF", "Ex.: 123456789", "9 dígitos, sem espaços")}
        {field("invoice_address", "Morada", "Ex.: Rua Augusta, 10, 2.º Dto")}
        {field("invoice_zip", "Código Postal", "Ex.: 1100-420")}
        {field("invoice_city", "Localidade", "Ex.: Lisboa")}
        {field("invoice_email", "Email para fatura", "ex@email.com")}
      </div>
    </div>
  );
}

export { invoiceSchema };
